'use strict';

const React = require('react');
const SchleppMixin = require('./SchleppMixin.js');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');


const Port = React.createClass({
	mixins: [SchleppMixin],

	contextTypes: {
		// theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		size: React.PropTypes.number.isRequired,
		node: React.PropTypes.object.isRequired,
		style: React.PropTypes.object.isRequired,
		editorElem: React.PropTypes.object.isRequired,
		editorTransformElem: React.PropTypes.object.isRequired,
		hoverNodeId: React.PropTypes.string/*.isRequired*/,
		dragNodeId: React.PropTypes.string/*.isRequired*/,
	},

	getDefaultProps: function() {
		return {
			style: {}
		};
	},

	render: function() {
		const props = this.props;
		const iconHTML = { __html: '&#xf100;' };

		return (
			<g
				style={props.style}
				className='port-group'
				transform={`translate(${props.x}, ${props.y})`}
			>
				<circle
					className='port'
					cx={0}
					cy={0}
					r={props.size*0.5}
				/>
				<text dy='1' className='spiral' dangerouslySetInnerHTML={iconHTML}></text>
			</g>
		);
	},

	_onDragStart: function(event) {
		this.context.dispatch( actionCreators.setDragNode(this.props.node.id) );
		// this._onDragMove(event);
	},

	_onDragMove: function(event) {
		const context = this.context;
		const props = this.props;
		const node = props.node;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		context.dispatch(
			actionCreators.setPreviewEdge({
				from: node.id,
				to: { // this is an exception
					x: modelXYEvent.x,
					y: modelXYEvent.y,
				},
			})
		);
	},

	_onDragEnd: function(event) {
		const context = this.context;
		const props = this.props;

		if (props.hoverNodeId !== null && props.dragNodeId !== null) {
			const newEdge = {
				from: props.dragNodeId,
				to: props.hoverNodeId
			};
			context.dispatch( actionCreators.addEdge(newEdge) );
		}
		context.dispatch( actionCreators.setPreviewEdge(null) );
		context.dispatch( actionCreators.setDragNode(null) );
	}
});


module.exports = Port;
