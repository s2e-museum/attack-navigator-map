'use strict';

var $ = require('jquery');
var _ = require('lodash');
var R = require('ramda');
var utils = require('../../utils.js');
var constants = require('../../constants.js');
var helpers = require('../../helpers.js');
var React = require('react');
var DragSource = require('react-dnd').DragSource;


class LibraryItem extends React.Component {
	constructor(props) {
		super(props);
		utils.autoBind(this);
	}

	render() {
		const props = this.props;
		const connectDragSource = props.connectDragSource;
		return connectDragSource(
			<li key={props.data.label} className='list-group-item'>
				<div className='badge' style={{ float:'right', fontWeight:'normal', marginTop:'0.15em' }}>{props.data.componentType}</div>
				<div>{props.data.label}</div>
			</li>
		);
	}
}

LibraryItem.propTypes = {
	data: React.PropTypes.object.isRequired,
	// injected by react dnd:
	isDragging: React.PropTypes.bool.isRequired,
	connectDragSource: React.PropTypes.func.isRequired
};

var spec = {
	beginDrag: function(props, monitor, component) {
		return { data: props.data };
	},
	endDrag: function(props, monitor, component) {
		if (!monitor.didDrop()) { return; }

		let result = monitor.getDropResult();
		if (result.target === constants.DND_TARGET_MAP ||
			result.target === constants.DND_TARGET_DEBUG) {
			// let graphActions = props.flux.getActions('graph');

			let data = props.data;
			data.id = Date.now() + '';
			data.type = data.componentType;
			// data.domain = 'physical';
			// graphActions.modelAdd('location', data);

			// graphActions.modelAdd(data.componentType, data);

			let interfaceStore = component.props.flux.getStore('interface');

			const editorXY = helpers.coordsRelativeToElem(
				interfaceStore.state.editorElem,
				result.clientOffset
			);
			const modelXY = helpers.unTransformFromTo(
				interfaceStore.state.editorElem,
				interfaceStore.state.editorTransformElem,
				editorXY
			);

			let graphActions = component.props.flux.getActions('graph');
			const fragment = {
				nodes: [data],
				edges: [],
				groups: [],
			}
			// graphActions.importModelFragment(monitor.getItem(), modelXY);
			graphActions.importModelFragment(fragment, modelXY);
		}
	}
};

// the props to be injected
function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}
LibraryItem = DragSource(constants.DND_SOURCE_NODE, spec, collect)(LibraryItem);


// react + es6
// http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html
class Library extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);

		this.render_listItem = this.props.renderItem || this.render_listItem;

		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);
		libraryActions.loadData(this.props.url);
	}

	render_listItem(item, index) {
		var that = this;
		var onClick = null;
		if (_.isFunction(this.props.onClick)) {
			onClick = function(event) { that.props.onClick(item); };
		}
		return (
			<LibraryItem
				flux={this.props.flux}
				onClick={onClick}
				key={item.id || index}
				data={item}
			/>
		);
	}

	render_loading() {
		if (this.props.loading) {
			return <div>loading...</div>;
		} else {
			return null;
		}
	}

	render_error() {
		if (this.props.error) {
			return <div>{this.props.error.status}: {this.props.error.errorMessage}</div>;
		} else {
			return null;
		}
	}

	render_add() {
		// var that = this;
		// var onAdd = this.props.onAdd;
		// if (_.isFunction(onAdd)) {
		// 	var handleAdd = _.wrap(onAdd, function(onAdd) {
		// 		var input = that.refs['add-input'];
		// 		var $input = $(input.getDOMNode());
		// 		var val = $input.val().trim();
		// 		onAdd(val);
		// 	});
		// 	return (
		// 		<div className='add'>
		// 			<input type="text" ref='add-input' /> <button onClick={handleAdd}>add</button>
		// 		</div>
		// 	);
		// } else {
			return null;
		// }
	}

	renderFilterItem(item) {
		const props = this.props;
		const checked = R.contains(item, props.componentTypesFilter);
		return (
			<label>
				<input type='checkbox' key={item} value={item} checked={checked} className=''> {item}</input>
			</label>
		);
	}

	render() {
		var that = this;
		var props = this.props;
		var list = props.list;

		return (
			<div className='panel-section library-component'>
				<h3 className='title'>{props.title}</h3>
				<div className='search form-group'>
					<div className='input-group'>
						<input ref='searchInput' type='search' className='form-control' placeholder='search' onChange={this.search}></input>
						<div className='btn input-group-addon' onClick={this.clearSearch}>
							<span className='glyphicon glyphicon-remove'></span>
						</div>
					</div>
				</div>
				<form className='form-inline type-filter' onChange={this.filterType}>
					{props.componentTypes.map(this.renderFilterItem)}
				</form>
				{this.render_loading()}
				{this.render_error()}
				<div className="results">
					<ul className='list-group'>{list.map(this.render_listItem)}</ul>
				</div>
				{this.render_add()}
			</div>
		);
	}

	filterType(event) {
		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);
		libraryActions.filterByType(event.target.value, event.target.checked);
	}

	clearSearch() {
		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);
		this.refs.searchInput.getDOMNode().value = '';
		libraryActions.filterList('');
	}

	search(event) {
		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);

		var $input = $(event.target);
		var query = $input.val().trim();
		libraryActions.filterList(query);
	}
}


Library.propTypes = {
	title: React.PropTypes.string.isRequired,
	url: React.PropTypes.string.isRequired,
	list: React.PropTypes.array.isRequired,
	componentTypes: React.PropTypes.array.isRequired,
	componentTypesFilter: React.PropTypes.array.isRequired,

	flux: React.PropTypes.any.isRequired,
	libName: React.PropTypes.string.isRequired,

	renderItem: React.PropTypes.func,
	onClick: React.PropTypes.func,
	onAdd: React.PropTypes.func,
	loading: React.PropTypes.bool,
	query: React.PropTypes.string,
};


// https://github.com/acdlite/flummox/issues/208
// Library.contextTypes = {
// 	flux: React.PropTypes.any
// };


module.exports = Library;
