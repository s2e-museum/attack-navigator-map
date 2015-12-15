'use strict';

let React = require('react');
let R = require('ramda');
let _ = require('lodash');

let createStore = require('redux').createStore;
let combineReducers = require('redux').combineReducers;
let applyMiddleware = require('redux').applyMiddleware;
let connect = require('react-redux').connect;
let Provider = require('react-redux').Provider;
let thunk = require('redux-thunk');

let ModelDebugView = require('./components/ModelDebugView/ModelDebugView.js');
let GraphOutline = require('./GraphOutline.js');
let GraphEditor = require('./Graph.js').GraphEditor;
let MainMenu = require('./MainMenu.js');
let Wizard = require('./Wizard.js');

let HTML5Backend = require('react-dnd/modules/backends/HTML5');
let DragDropContext = require('react-dnd').DragDropContext;

const constants = require('./constants.js');


let App = React.createClass({
	render: function() {
		const props = this.props;

		return (
			<div id='container'>
				<input type='file' accept='.svg' id='add-file' />

				<div id='map-container'>
					<div id='map'>
						{/*<GraphEditor id='editor' {...props} />*/}
					</div>
				</div>

				<div id='model-debug-view'>
					<div className='panel-section'>
						<h3 className='title'>debug</h3>
						<MainMenu id='main-menu' {...props} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>outline</h3>
							<GraphOutline graph={props.graph} dispatch={props.dispatch} />
					</div>
					<div className='panel-section'>
						<h3 className='title'>model</h3>
						<ModelDebugView {...props} />
					</div>
				</div>

				<div id='panel-container'>
					<Wizard {...props} />
				</div>
			</div>
		);
	}
});


function mapStateToProps(state) {
	const newState = _.merge({}, state.model, state.interface);
	return newState;
}

App = DragDropContext(HTML5Backend)(App);
App = connect(mapStateToProps)(App);

const reducer = combineReducers({
	model: require('./modelReducer.js'),
	interface: require('./interfaceReducer.js'),
});
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
let store = createStoreWithMiddleware(reducer);


React.render(
	<Provider store={store}>
		{ function() { return <App />; } }
	</Provider>,
	document.querySelector('#app')
);
