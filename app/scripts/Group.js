'use strict';

var $ = require('jquery');
var _ = require('lodash');
var R = require('ramda');
var classnames = require('classnames');
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var SchleppMixin = require('./SchleppMixin.js');
var icons = require('./icons.js');
var helpers = require('./helpers.js');


var Dropzone = React.createClass({
	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		radius: React.PropTypes.number.isRequired,
	},

	render: function() {
		const props = this.props;
		return (
			<g
				transform={'translate('+props.x+','+props.y+')'}
			>
				<circle
					className='dropzone'
					cx={0}
					cy={0}
					r={props.radius}
				/>
			</g>
		);
	},
});


var Group = React.createClass({
	mixins: [SchleppMixin/*, PureRenderMixin*/],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		selected: React.PropTypes.bool,
		hovered: React.PropTypes.bool,
		flux: React.PropTypes.object.isRequired,
		theme: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			hovered: false,
			selected: false,
		};
	},

	contextTypes: {
		graphActions: React.PropTypes.object,
		interfaceActions: React.PropTypes.object
	},

	renderLabel: function() {
		if (!this.props.showGroupLabels) { return null; }
		return (
			<text
				dx={this.props.width*0.5}
				dy={this.props.height*0.5 + 16}
				className='label'>{this.props.group.name}</text>
		);
	},

	renderDropzone: function() {
		const props = this.props;

		if (props.dragNode && !R.contains(props.dragNode.id, props.group.nodeIds)) {
			const groupRect = {
				x: props.x,
				y: props.y,
				width: props.width,
				height: props.height,
			};
			const nodeRect = {
				x: props.dragNode.x - 0.5*props.theme.node.size,
				y: props.dragNode.y - 0.5*props.theme.node.size,
				width: props.theme.node.size,
				height: props.theme.node.size,
			};
			if (helpers.isRectInsideRect(nodeRect, groupRect)
				|| helpers.isRectInsideRect(groupRect, nodeRect) // or, when group is smaller than node
				) {
				return (
					<Dropzone
						group={props.group}
						radius={props.theme.group.dropzoneRadius}
						x={props.width*0.5}
						y={props.height*0.5}
					/>
				);
			}
		}

		return null;
	},

	render: function() {
		var props = this.props;

		let style = {};
		if (!props.showGroups) { style.display = 'none'; }

		return (
			<g
				className='group-group'
				style={style}
				onClick={this._onClick}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}
				transform={'translate('+props.x+','+props.y+')'}>
				<rect
					className={classnames('group', { 'selected': props.selected })}
					rx={props.theme.group.cornerRadius}
					ry={props.theme.group.cornerRadius}
					width={props.width}
					height={props.height}>
				</rect>
				{this.renderLabel()}
				{this.renderDropzone()}
			</g>
		);
	},

	_handleHover: function(event) {
		this.context.interfaceActions.setHoverGroup(this.props.group);
	},

	_handleHoverOut: function(event) {
		this.context.interfaceActions.setHoverGroup(null);
	},

	componentDidMount: function() {
		var that = this;
		var context = this.context;

		var elem = this.getDOMNode();
		$(elem).on('contextmenu', function(event) {
			let bgimg = { label: 'image', icon: icons['fa-plus'], action: that.openFileDialog };
			if (!_.isEmpty(that.props.group._bgImage)) {
				bgimg.icon = icons['fa-remove'];
				bgimg.action = function() {
					context.interfaceActions.removeGroupBackgroundImage(that.props.group);
				};
			}

			let menuItems = [
				{ label: 'delete', icon: icons['fa-trash'], action:
					function(/*event*/) {
						context.graphActions.removeGroup(that.props.group, true);
					}
				},
				{ label: 'ungroup', icon: icons['fa-remove'], action:
					function(/*event*/) {
						context.graphActions.removeGroup(that.props.group);
					}
				},
				{ label: 'clone', icon: icons['fa-files-o'], action:
					function() {
						context.graphActions.cloneGroup(that.props.group);
					}
				},
				bgimg,
				{ label: 'node', icon: icons['fa-plus'], action:
					function(/*event*/) {
						let node = {
							x: event.offsetX,
							y: event.offsetY,
							group: that.props.group
						};
						context.graphActions.addNode(node);
					}
				},
			];
			context.interfaceActions.showContextMenu(event, that.props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {
		$(this.getDOMNode()).off('contextmenu');
	},

	openFileDialog: function() {
		let $addfile = $('#add-file');
		$addfile.on('change', this.loadBackgroundFile);
		$addfile.click();
	},
	loadBackgroundFile: function(event) { // TODO: do this elsewhere
		var that = this;
		var file = $('#add-file')[0].files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			var svg = event.target.result;
			var $svg = $($.parseXML(svg)).find('svg').first();
			var w = parseFloat($svg.attr('width'));
			var h = parseFloat($svg.attr('height'));
			var aspectRatio = w / h;
			// var dataURI = 'data:image/svg+xml;utf8,'+svg;
			var dataURI = 'data:image/svg+xml;base64,'+btoa(svg);
			that.context.interfaceActions.addGroupBackgroundImage(that.props.group, dataURI, aspectRatio, w);
		};
		// reader.readAsDataURL(file);
		reader.readAsText(file);

		$('#add-file').off('change', this.loadBackgroundFile);
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.interfaceActions.select(this.props.group, 'group');
	},

	_onMouseOver: function(event) {
		this.context.interfaceActions.setHoverGroup(this.props.group);
	},
	_onMouseOut: function(event) {
		this.context.interfaceActions.setHoverGroup(null);
	},

	_onDragStart: function(event) {
		const props = this.props;

		this.originalPositionX = props.x;
		this.originalPositionY = props.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.offsetX,
			  y: event.offsetY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		this.currentPositionX = props.x;
		this.currentPositionY = props.y;

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

		var newPositionX = this.originalPositionX + modelXYDelta.x;
		var newPositionY = this.originalPositionY + modelXYDelta.y;

		this.context.interfaceActions.moveGroup(
			props.group,
			{ // delta of the delta
				x: newPositionX - this.currentPositionX,
				y: newPositionY - this.currentPositionY
			}
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;
