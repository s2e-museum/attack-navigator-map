'use strict';

var React = require('react');
var MenuItem = require('react-bootstrap').MenuItem;

var common = require('./common.js');


var DropdownSearchable = React.createClass({
	propTypes: {
		title: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired,
		searchable: React.PropTypes.bool,
		items: React.PropTypes.array.isRequired,
		handleSelection: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			searchable: true,
			handleSelection: function() {}
		};
	},

	renderItem: function(item, index) {
		if (item.divider) {
			return common.divider;
		}

		if (item.header) {
			return <MenuItem header={true} key={index}>{item.title}</MenuItem>;
		}

		return (
			<MenuItem
				onSelect={this.handleSelection}
				eventKey={item.eventKey}
				key={index}>{item.title}
			</MenuItem>
		);
	},

	renderSearch: function() {
		return (
			<div>
				<form className='form'>
					<div className='input-group filter' role='search'>
						<input
							className='form-control'
							onChange={this.handleChange}
							onKeyDown={this.handleKeyDown}
							value={this.state.query}
							type='search'
							placeholder='search'
						/>
						<span className='input-group-addon'>
							<span className='glyphicon glyphicon-search'></span>
						</span>
					</div>
				</form>
				{/*common.divider*/ null}
			</div>
		);
	},

	getInitialState: function() {
		return {
			query: ''
		};
	},

	render: function() {
		var state = this.state;
		var props = this.props;

		var re = new RegExp(state.query, 'ig');
		var options = props.items
			.filter(function(item) {
				if (item.eventKey === null) { return true; } // always show default option
				if (item.divider) { return true; }
				if (item.header) { return true; }
				return item.title.match(re);
			});

		return (
			<span className='dropdown'>
				<a href='#' data-toggle='dropdown' className='dropdown-toggle'>
					{props.title}{common.caret}
				</a>
				<ul role='menu' className='dropdown-menu'>
					{(props.searchable) ? this.renderSearch() : null}
					{options.map(this.renderItem)}
				</ul>
			</span>
		);
	},

	handleChange: function(event) {
		this.setState({
			query: event.target.value
		});
	},

	handleKeyDown: function(event) {
		if (event.keyCode === 13) { // enter
			event.preventDefault();
		}
	},

	handleSelection: function(event, eventKey) {
		this.props.handleSelection(this.props.name, eventKey);
	}
});


module.exports = DropdownSearchable;
