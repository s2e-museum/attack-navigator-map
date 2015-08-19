'use strict';

var $ = require('jquery');
var _ = require('lodash');
var React = require('react');
var DropTarget = require('react-dnd').DropTarget;

var utils = require('../../utils.js');
var constants = require('../../constants.js');


class ModelDebugView extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);
	}

	render() {
		var that = this;
		var model = this.props.model;
		if (!model) { return null; }

		const connectDropTarget = this.props.connectDropTarget;
		return connectDropTarget(
			<div>
				<button onClick={this.generateXML} className='btn btn-default btn-xs'>generate XML</button>
				<br/><br/>
				<pre className='debug-json'>
					{JSON.stringify(model, null, 2)}
				</pre>
			</div>
		);
	}

	generateXML(event) {
		event.preventDefault();
		this.context.graphActions.generateXML();
	}
}


ModelDebugView.propTypes = {
	model: React.PropTypes.object,

	isOver: React.PropTypes.bool.isRequired,
	connectDropTarget: React.PropTypes.func.isRequired
};


ModelDebugView.contextTypes = {
	graphActions: React.PropTypes.object,
	interfaceActions: React.PropTypes.object
};


var spec = {
	drop: function (props, monitor, component) {
		let data = monitor.getItem().data;
		// console.log(data);
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
