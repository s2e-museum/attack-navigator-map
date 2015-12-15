'use strict';

let $ = require('jquery');
let React = require('react');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


let SchleppManagerMixin = {
	componentDidMount: function() {
		const props = this.props;

		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);

		let $body = $('body');

		$body.on('keydown', function(event) {
			if (event.keyCode === 32) {
				if (props.mouseOverEditor) {
					event.preventDefault();
					event.stopPropagation();
				}

				props.dispatch( actionCreators.setSpacePressed(true) );

				// pannable:
				if ($elem[0].tagName === 'svg') {
					props.dispatch( actionCreators.setPannable(true) );
				}
			}
		});

		$body.on('keyup', function(event) {
			if (event.keyCode === 32) {
				props.dispatch( actionCreators.setSpacePressed(false) );
				props.dispatch( actionCreators.setPannable(false) );
			}
		});

		$elem.on('mousemove', function(event) {
			event.preventDefault();
			event.stopPropagation();

			props.dispatch( actionCreators.setMouseOverEditor(true) );

			if (props.drag) {
				(props.drag.onMove || helpers.noop)(event);
			}
		});

		$elem.on('mouseleave', function(event) {
			event.preventDefault();
			event.stopPropagation();
			props.dispatch( actionCreators.setMouseOverEditor(false) );
		});

		$elem.on('mouseup', function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (props.drag) {
				(props.drag.onEnd || helpers.noop)(event);
			}
			props.dispatch( actionCreators.setDrag(null) );
			props.dispatch( actionCreators.setPanning(false) );
		});
	},

	componentWillUnmount: function() {
		let elem = helpers.getElemByRef(this, 'dragRoot');
		let $elem = $(elem);

		let $body = $('body');

		$body
			.off('keydown')
			.off('keyup');

		$elem
			.off('mousedown')
			.off('mousemove')
			.off('mouseleave')
			.off('mouseup');
	}
};

module.exports = SchleppManagerMixin;
