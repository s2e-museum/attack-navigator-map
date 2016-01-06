'use strict';

let $ = require('jquery');
let React = require('react');
let DropTarget = require('react-dnd').DropTarget;

let actionCreators = require('../../actionCreators.js');
const constants = require('../../constants.js');


let ModelDebugView = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
		model: React.PropTypes.object,

		isOver: React.PropTypes.bool.isRequired,
		connectDropTarget: React.PropTypes.func.isRequired
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	render: function() {
		const model = this.props.model;
		if (!model) { return null; }

		const connectDropTarget = this.props.connectDropTarget;
		return connectDropTarget(
			<div>
				{/*<input ref='load-model' type='file' accept='.xml' onChange={this.loadXMLFile} />
								<hr/>*/}
				{/*<br/><br/>
								<pre className='debug-json'>
									{JSON.stringify(model, null, 2)}
								</pre>*/}
			</div>
		);
	},
});


const spec = {
	drop: function (props, monitor, component) {
		let data = monitor.getItem().data;
		return { target: constants.DND_TARGET_DEBUG };
	}
};


// the props to be injected
function collect(connect, monitor) {
	return {
		connectDropTarget: connect.dropTarget(),
		isOver: monitor.isOver()
	};
}


module.exports = DropTarget(['LibraryItem'], spec, collect)(ModelDebugView);
