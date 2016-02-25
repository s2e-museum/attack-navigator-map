'use strict';

let $ = require('jquery');
let _ = require('lodash');
let R = require('ramda');
let classnames = require('classnames');
let React = require('react');
let reactDOM = require('react-dom');
let SchleppMixin = require('./SchleppMixin.js');
let icons = require('./icons.js');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let Dropzone = React.createClass({
	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		radius: React.PropTypes.number.isRequired,
	},

	render: function() {
		const props = this.props;
		return (
			<g transform={'translate('+props.x+','+props.y+')'}>
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


let Group = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		selected: React.PropTypes.bool,
		hovered: React.PropTypes.bool,
		theme: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			hovered: false,
			selected: false,
		};
	},

	renderLabel: function() {
		const props = this.props;
		if (!props.showGroupLabels) { return null; }
		return <text
			dx={props.width*0.5}
			dy={/*props.height*0.5 + 16*/ -10}
			className='label'>{props.group.name}</text>;
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
			const halfSize = 0.5 * props.theme.node.size;
			const nodeRect = {
				x: props.dragNode.x - halfSize,
				y: props.dragNode.y - halfSize,
				width: props.theme.node.size,
				height: props.theme.node.size,
			};
			if (helpers.isRectInsideRect(nodeRect, groupRect) ||
				helpers.isRectInsideRect(groupRect, nodeRect) // or, when group is smaller than node
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
		const props = this.props;

		if (!props.showGroups) { return null; }

		return (
			<g
				className='group-group'
				onClick={this._onClick}
				onContextMenu={this._onContextMenu}
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
		const props = this.props;
		props.dispatch( actionCreators.setHoverGroup(props.group) );
	},

	_handleHoverOut: function(event) {
		const props = this.props;
		props.dispatch( actionCreators.setHoverGroup(null) );
	},

	_onContextMenu: function(event) {
		const props = this.props;

		let bgimg = {
			label: 'background\nimage',
			icon: icons['fa-plus'],
			action: this.openFileDialog
		};
		if (!_.isEmpty(props.group._bgImage)) {
			bgimg.icon = icons['fa-remove'];
			bgimg.action = function() {
				props.dispatch( actionCreators.removeGroupBackgroundImage(props.group.id) );
			};
		}

		const menuItems = [
			{ label: 'delete', destructive: true, icon: icons['fa-trash'], action:
				function(/*event*/) {
					props.dispatch( actionCreators.removeGroup(props.group.id, true) );
				}
			},
			{ label: 'ungroup', destructive: true, icon: icons['fa-remove'], action:
				function(/*event*/) {
					props.dispatch( actionCreators.removeGroup(props.group.id) );
				}
			},
			{ label: 'clone', icon: icons['fa-files-o'], action:
				function() {
					props.dispatch( actionCreators.cloneGroup(props.group.id) );
				}
			},
			{ label: 'save as\npattern', icon: icons['fa-floppy-o'], action:
				function() {
					// props.dispatch( actionCreators.cloneGroup(props.group.id) );
				}
			},
			bgimg
		];
		props.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	openFileDialog: function() {
		let $addfile = $('#add-file');
		$addfile.on('change', this.loadBackgroundFile);
		$addfile.click();
	},

	loadBackgroundFile: function(event) { // TODO: do this elsewhere
		let that = this;
		const props = this.props;

		let file = $('#add-file')[0].files[0];
		let reader = new FileReader();
		reader.onload = function(event) {
			let svg = event.target.result;
			let $svg = $($.parseXML(svg)).find('svg').first();
			const w = parseFloat($svg.attr('width'));
			const h = parseFloat($svg.attr('height'));
			const aspectRatio = w / h;
			// const dataURI = 'data:image/svg+xml;utf8,'+svg;
			const dataURI = 'data:image/svg+xml;base64,'+btoa(svg);
			props.dispatch( actionCreators.addGroupBackgroundImage(props.group.id, dataURI, aspectRatio, w) );
		};
		// reader.readAsDataURL(file);
		reader.readAsText(file);

		$('#add-file').off('change', this.loadBackgroundFile);
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		const props = this.props;
		props.dispatch( actionCreators.select(props.group.id, 'group') );
	},

	_onMouseOver: function(event) {
		const props = this.props;
		props.dispatch( actionCreators.setHoverGroup(props.group) );
	},
	_onMouseOut: function(event) {
		const props = this.props;
		props.dispatch( actionCreators.setHoverGroup(null) );
	},

	_onDragStart: function(event) {
		const props = this.props;

		this.originalPositionX = props.x;
		this.originalPositionY = props.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		this.currentPositionX = props.x;
		this.currentPositionY = props.y;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		const newPositionX = this.originalPositionX + modelXYDelta.x;
		const newPositionY = this.originalPositionY + modelXYDelta.y;

		props.dispatch(
			actionCreators.moveGroup(
				props.group,
				{ // delta of the delta
					x: newPositionX - this.currentPositionX,
					y: newPositionY - this.currentPositionY
				}
			)
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;
