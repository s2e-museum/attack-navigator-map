'use strict';

var _ = require('lodash');
var $ = require('jquery');
var React = require('react');
var mout = require('mout');
var classnames = require('classnames');
var helpers = require('./helpers.js');
var SchleppManagerMixin = require('./SchleppManagerMixin.js');
var SchleppMixin = require('./SchleppMixin.js');
var Group = require('./Group.js');
var Node = require('./Node.js');
var Edge = require('./Edge.js');
var BackgroundImage = require('./BackgroundImage.js');
var ContextMenu = require('./ContextMenu.js');
var DropTarget = require('react-dnd').DropTarget;
var icons = require('./icons.js');


var GraphMixin = {
	propTypes: {
		graph: React.PropTypes.object.isRequired,
		editable: React.PropTypes.bool.isRequired,
		minZoom: React.PropTypes.number,
		maxZoom: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			minZoom: 0.2,
			maxZoom: 5.0,
		};
	},

	_makeGroup: function(group) {
		let bounds = null;
		const extraPadding = 5;
		if (group.nodeIds.length === 0) {
			const s = this.props.theme.node.size*0.5 + 2*extraPadding;
			bounds = { // TODO: improve this
				minX: extraPadding,
				minY: extraPadding,
				maxX: s,
				maxY: s,
			};
		} else {
			bounds = helpers.getGroupBBox(this.props.graph.nodes, group);
			const s = this.props.theme.node.size*0.5 + extraPadding;
			bounds.minX -= s;
			bounds.minY -= s;
			bounds.maxX += s;
			bounds.maxY += s;
		}

		return <Group
				{...this.props}
				key={group.id}
				group={group}
				x={bounds.minX}
				y={bounds.minY}
				width={bounds.maxX-bounds.minX}
				height={bounds.maxY-bounds.minY} />;
	},

	_makePreviewEdge: function(edge, index, collection) {
		return this._makeEdge(edge, index, collection, true);
	},

	_makeEdge: function(edge, index, collection, isPreview) {
		return <Edge
				{...this.props}
				key={index}
				edge={edge}
				from={edge.from} // TODO: remove `from` and `to`
				to={edge.to}
				preview={isPreview} />;
	},

	_makeNode: function(node, index) {
		var props = this.props;
		return <Node
				{...this.props}
				key={index}
				hovered={props.hoverNode && (node.id === props.hoverNode.id)}
				x={node.x}
				y={node.y}
				node={node} />;
	},

	_makeBgImage: function(group, index) {
		return <BackgroundImage
				{...this.props}
				key={index}
				group={group}
				groupCenterOffsetX={group._bgImage.groupCenterOffsetX}
				groupCenterOffsetY={group._bgImage.groupCenterOffsetY}
				width={group._bgImage.width || 500}
				height={group._bgImage.height || 500} />;
	},

	renderVisibleRect: function() {
		// TODO: all of this should go into a separate minimap component
		const props = this.props;

		if (!!props.constantScale) {
			let $editor = $(props.editorElem);
			const origin = helpers.unTransformFromTo(
				props.editorElem,
				props.editorTransformElem,
				{ x: 0,
				  y: 0 }
			);
			const corner = helpers.unTransformFromTo(
				props.editorElem,
				props.editorTransformElem,
				{ x: $editor.width(),
				  y: $editor.height() }
			);
			this.visibleRect = {
				x: origin.x,
				y: origin.y,
				width: corner.x - origin.x,
				height: corner.y - origin.y,
			};
		}

		if (!!this.visibleRect) {
			return (
				<g transform={'translate('+this.visibleRect.x+','+this.visibleRect.y+')'}>
					<rect
						className=''
						fill='none'
						stroke='red'
						strokeWidth={5 / props.constantScale}
						width={this.visibleRect.width}
						height={this.visibleRect.height}>
					</rect>
				</g>
			);
		} else {
			return null;
		}
	},

	render: function() {
		var props = this.props;
		var graph = props.graph;

		var classNames = classnames(
			'graph',
			{
				'editable': props.editable,
				'not-editable': !props.editable,
			}
		);

		var scale = (!!props.constantScale) ? props.constantScale : props.scale;
		var panX = (!!props.constantScale) ? (props.panX * props.constantScale) : props.panX;
		var panY = (!!props.constantScale) ? (props.panY * props.constantScale) : props.panY;

		const connectDropTarget = this.props.connectDropTarget || _.identity;
		return connectDropTarget(
			<div id={props.id} style={{ height: '100%' }}>
				<svg
					ref='dragRoot'
					className={classNames}
					onWheel={this._onWheel || helpers.noop}
					onClick={this._onClick || helpers.noop}>
					<g
						ref='panZoom'
						transform={'matrix('+scale+',0,0,'+scale+','+panX+','+panY+')'}
						>
						{graph.groups.filter(function(group) { return !!group._bgImage; }).map(this._makeBgImage)}
						{graph.groups.map(this._makeGroup)}
						{graph.edges.map(this._makeEdge)}
						{ (this.props.previewEdge)
							? [this.props.previewEdge].map(this._makePreviewEdge)
							: null
						}
						{graph.nodes.map(this._makeNode)}
						{this.renderVisibleRect()}
					</g>
					{(props.editable) ? <ContextMenu {...this.props} /> : null}
				</svg>
			</div>
		);
	},

	componentWillMount: function() {
		this._graphActions = this.props.flux.getActions('graph');
		this._interfaceActions = this.props.flux.getActions('interface');
	},

	// updateDimensions: function() {
	// 	var $window = $(window);
	// 	this.setState({ // TODO: unused
	// 		width: $window.width(),
	// 		height: $window.height()
	// 	});
	// },
	// componentDidMount: function() {
	// 	this.updateDimensions();
	// 	window.addEventListener('resize', this.updateDimensions);
	// },
	// componentWillUnmount: function() {
	// 	window.removeEventListener('resize', this.updateDimensions);
	// }
};


var GraphEditor = React.createClass({
	mixins: [
		SchleppMixin,
		SchleppManagerMixin,
		GraphMixin
	],

	getDefaultProps: function() {
		return {
			editable: true,
		};
	},

	componentDidMount: function() {
		let $svg = $(this.getDOMNode()).find('svg');
		this._interfaceActions.setEditorElem($svg[0]);

		var that = this;
		$svg.on('contextmenu', function(event) {
			let menuItems = [ // TODO: have these all in one place?
				{
					label: 'add node',
					icon: icons['fa-plus'],
					action: function(/*event*/) {
						let node = {
							x: event.offsetX,
							y: event.offsetY,
						};
						that._graphActions.addNode(node);
					}
				}
			];
			that._interfaceActions.showContextMenu(event, that.props.graph, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		let $svg = $(this.props.editorElem);
		$svg.off('contextmenu');
		this._interfaceActions.setEditorElem(null);
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this._interfaceActions.hideContextMenu();
		this._interfaceActions.select(null);
	},

	_onWheel: function(event) {
		event.preventDefault();

		const props = this.props;

		let deltaScale = event.deltaY / 2000.0;
		let newScale = mout.math.clamp(this.props.scale + deltaScale,
									   props.minZoom,
									   props.maxZoom);

		// event position, relative to svg elem
		const editorXY = helpers.coordsRelativeToElem(
			props.editorElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		// zoom and pan transform-origin equivalent
		// (from the-graph-app.js)
		var scaleD = newScale / props.scale;
		var currentX = props.panX;
		var currentY = props.panY;
		var x = scaleD * (currentX - editorXY.x) + editorXY.x;
		var y = scaleD * (currentY - editorXY.y) + editorXY.y;

		this._interfaceActions.setTransformation({
			scale: newScale,
			panX: x,
			panY: y,
		});
	},

	_onDragStart: function(event) {
		let $svg = $(this.props.editorElem);
		$svg.addClass('panning');
		this._originalPanX = this.props.panX;
		this._originalPanY = this.props.panY;
	},

	_onDragMove: function(event) {
		this._interfaceActions.setTransformation({
			panX: this._originalPanX + event.deltaX,
			panY: this._originalPanY + event.deltaY,
		});
	},

	_onDragEnd: function(event) {
		let $svg = $(this.props.editorElem);
		$svg.removeClass('panning');
		this._originalPanX = this.props.panX;
		this._originalPanY = this.props.panY;
	},
});


var Graph = React.createClass({
	mixins: [GraphMixin],

	getDefaultProps: function() {
		return {
			editable: false,
		};
	},
});


var GraphMinimap = React.createClass({
	propTypes: {
		constantScale: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			constantScale: 0.2,
		};
	},

	render: function() {
		const props = this.props;

		// if (!this.fit) { return null; }
		if (!this.size) { return null; }
		let bbox = helpers.getNodesBBox(props.graph.nodes);

		const visibleRect = {
			x: bbox.minX,
			y: bbox.minY,
			width:  bbox.maxX - bbox.minX,
			height: bbox.maxY - bbox.minY,
		};

		// add some padding
		bbox.minX -= props.theme.node.size * 2;
		bbox.maxX += props.theme.node.size * 2;
		bbox.minY -= props.theme.node.size * 2;
		bbox.maxY += props.theme.node.size * 2;
		const bboxSize = {
			width:  bbox.maxX - bbox.minX,
			height: bbox.maxY - bbox.minY,
		};
		const bboxAspectRatio = bboxSize.width / bboxSize.height;
		const fit = (this.aspectRatio > bboxAspectRatio) ? 'height' : 'width';
		// const scale = this.size[this.fit] / bboxSize[this.fit];
		const scale = this.size[fit] / bboxSize[fit];

		const showNodeLabels = false;
		const showEdgeLabels = false;
		const showGroupLabels = false;

		let restProps = _.omit(props, 'id');

		return (
			<div ref='height' id={props.id}>
				<Graph {...restProps}
					constantScale={scale}
					panX={-bbox.minX}
					panY={-bbox.minY}
					showNodeLabels={showNodeLabels}
					showEdgeLabels={showEdgeLabels}
					showGroupLabels={showGroupLabels} />
			</div>
		);
	},

	_setHeight: function() {
		const props = this.props;

		let $minimap = $(this.getDOMNode());
		let $mainGraph = $(props.editorElem);

		// let $height = $(this.refs.height.getDOMNode());
		// const height = $mainGraph.height() * props.constantScale;
		// $height.height(height);

		// this.editorSize = {
		// 	width: $mainGraph.width(),
		// 	height: $mainGraph.height(),
		// };
		// const editorAspectRatio = this.editorSize.width / this.editorSize.height;
		// if (!editorAspectRatio) { return; }

		this.size = {
			width: $minimap.width(),
			height: $minimap.height(),
		};
		this.aspectRatio = this.size.width / this.size.height;
		// this.fit = (this.aspectRatio > editorAspectRatio) ? 'height' : 'width';
	},

	componentDidMount: function() {
		this._setHeight();
	},

	componentDidUpdate: function() {
		this._setHeight();
	},
});


var spec = {
	drop: function (props, monitor, component) {
		// console.log(monitor.getItem());
		return {
			target: 'graph',
			clientOffset: monitor.internalMonitor.dragOffsetStore.state.clientOffset // TODO: this seems hacky
		};
	}
};


// the props to be injected
function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
}


module.exports = {
	Graph,
	GraphEditor: DropTarget(['DndNode', 'DndFragment'], spec, collect)(GraphEditor),
	GraphMinimap,
};
