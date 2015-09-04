'use strict';

var $ = require('jquery');
var _ = require('lodash');
var R = require('ramda');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var classnames = require('classnames');
var SchleppMixin = require('./SchleppMixin.js');
var Port = require('./Port.js');
var icons = require('./icons.js');
var helpers = require('./helpers.js');


const typeIcons = {
	location: 'fa-square-o',
	asset: 'fa-file-o',
	actor: 'fa-male',
	role: 'fa-user',
	predicate: 'fa-tags',
	process: 'fa-gears',
	policy: 'fa-ban',
};


var Node = React.createClass({
	mixins: [SchleppMixin/*, PureRenderMixin*/],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		hovered: React.PropTypes.bool,
		selected: React.PropTypes.bool,
		theme: React.PropTypes.object.isRequired,
		node: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			selected: false,
			hovered: false,
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderIcon: function() {
		if (!this.props.showGroupLabels) { return null; }
		const icon = icons[typeIcons[this.props.node.type]];
		return <text ref='icon' className='icon fa' x='0' y='2' dangerouslySetInnerHTML={{__html:icon}}></text>;
	},

	renderLabel: function() {
		if (!this.props.showGroupLabels) { return null; }
		let label = this.props.node.label || 'no label';
		label = helpers.ellipsize(15, label);
		return <text ref='label' className='label' x='0' y={2+this.props.theme.node.size*0.5}>{label}</text>;
	},

	render: function() {
		var props = this.props;
		var radius = props.theme.node.size * 0.5;

		var portStyle = {};
		if (!props.hovered) { portStyle.display = 'none'; }

		return (
			<g
				className='node-group'
				transform={'translate('+props.x+','+props.y+')'}
				onClick={this._onClick}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}>
				<g ref='dragRoot'>
					<rect
						className={classnames('node', { 'hover': props.hovered, 'selected': props.selected })}
						x={-radius}
						y={-radius}
						rx={props.theme.node.cornerRadius}
						ry={props.theme.node.cornerRadius}
						height={radius*2}
						width={radius*2} />
					{this.renderLabel()}
					{this.renderIcon()}
				</g>
				<Port
					style={portStyle}
					{...this.props}
					x={0}
					y={-radius}
					size={props.theme.port.size}
					node={this.props.node} />
			</g>
		);
	},


	componentDidMount: function() {
		var that = this;
		const props = this.props;
		const context = this.context;

		$(this.getDOMNode()).on('contextmenu', function(event) {
			let menuItems = [
				{	label: 'delete',
					icon: icons['fa-trash'],
					action: function() { context.graphActions.removeNode(props.node); }
				},
				{	label: 'clone', icon: icons['fa-files-o'], action:
					function() {
						context.graphActions.cloneNode(props.node);
					}
				},
				{	label: 'remove\nfrom group', icon: icons['fa-object-group'], action:
					function() {
						context.graphActions.ungroupNode(props.node);
					}
				},
			];
			context.interfaceActions.showContextMenu(event, props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		$(this.getDOMNode()).off('contextmenu');
	},

	// _getLabelWidth: function() {
	// 	var label = this.refs.label.getDOMNode();
	// 	var bbox = label.getBBox();
	// 	var width = bbox.width;
	// 	return width;
	// },

	// _positionPorts: function() {
	// 	var w = this._getLabelWidth();
	// 	this.setState({
	// 		portPosX: props.theme.port.size+props.theme.label.fontSize+w*0.5
	// 	});
	// },

	// componentDidMount: function() {
	// 	// this._positionPorts();
	// },

	// componentDidUpdate: function() {
	// 	if (!this.state.portPosX)
	// 		this._positionPorts();
	// },

	// getInitialState: function() {
	// 	return {};
	// },

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.interfaceActions.select(this.props.node, 'node');
	},

	_onDragStart: function(event) {
		const props = this.props;
		const node = props.node;

		this.context.interfaceActions.setDragNode(node);

		this.originalPositionX = node.x;
		this.originalPositionY = node.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		// get event coords in model space
		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		this.context.interfaceActions.moveNode(
			this.props.node, {
				x: this.originalPositionX + modelXYDelta.x,
				y: this.originalPositionY + modelXYDelta.y,
			}
		);
	},

	_onDragEnd: function(event) {
		// TODO: DRY (almost same code as in <Dropzone>)

		// for every group
			// check if node is inside the bounds of group
				// if yes, add node to group
		const props = this.props;
		const graph = props.graph;
		const groups = graph.groups;
		const node = props.node;
		const dropGroups = groups.filter(function(group) {
			const groupRect = helpers.getGroupBBox(graph.nodes, group);
			const nodeRect = {
				x: node.x - 0.5*props.theme.node.size,
				y: node.y - 0.5*props.theme.node.size,
				width: props.theme.node.size,
				height: props.theme.node.size,
			};
			// TODO: check if actually inside dropzone
			return helpers.isRectInsideRect(nodeRect, groupRect);
		});
		if (dropGroups.length) {
			this.context.graphActions.addNodeToGroup(node, R.last(dropGroups));
		}

		this.context.interfaceActions.setDragNode(null);
	},

	_handleHover: function(event) {
		this.context.interfaceActions.setHoverNode(this.props.node);
	},

	_handleHoverOut: function(event) {
		this.context.interfaceActions.setHoverNode(null);
	}
});


module.exports = Node;
