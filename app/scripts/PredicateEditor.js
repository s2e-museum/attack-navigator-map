const React = require('react');
const actionCreators = require('./actionCreators.js');
const ComponentReference = require('./ComponentReference.js');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const RelationSelectize = require('./RelationSelectize.js');


// TODO: added ones are not persisted
const createFromSearch = (options, search) => {
	if (!search || options.length) {
		return null;
	}
	const result = {
		label: search,
		value: search,
	};
	return result;
};


const SubjObjSelectize = React.createClass({
	render() {
		const props = this.props;

		const renderValue = (item) => {
			const node = props.nodes[item[props.valueKey]];
			return (node)
				? <ComponentReference modelComponent={node}>
					{node.label}
				</ComponentReference>
				: item[props.labelKey];
		};

		return <SelectizeDropdown
			multi={false}
			extraProps={{ createFromSearch, renderValue }}
			{...props}
		/>;
	},
});


const PredicateEditor = React.createClass({
	propTypes: {
		handleCreate: React.PropTypes.func,
		handleUpdate: React.PropTypes.func,
		nodes: React.PropTypes.object.isRequired,
		edges: React.PropTypes.array.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		relationsMap: React.PropTypes.object.isRequired,
		predicates: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			handleCreate: () => {},
			handleUpdate: () => {},
		};
	},

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	addPredicate(event) {
		const subject = this.refs['new-subject'].value;
		const type = this.refs['new-predicate'].value;
		const object = this.refs['new-object'].value;
		const predicate = {
			type,
			value: [subject, object],
		};
		this.props.handleCreate(predicate);

		this.refs['new-subject'].value = '';
		this.refs['new-predicate'].value = '';
		this.refs['new-object'].value = '';
	},

	updatePredicate(predicateId, property, value) {
		this.props.handleUpdate(predicateId, { [property]: value });
	},

	edgeRelationChanged(name, relation, edgeId) {
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				edgeId, 'edge', { relation }
			)
		);
	},

	subjObjChanged(name, value, edgeId) {
		const key = (name === 'subject') ? 'from' : 'to';
		this.context.dispatch(
			actionCreators.updateComponentProperties(
				edgeId, 'edge', { [key]: value }
			)
		);
	},

	renderPredicate(edge, index, relationTypes, relationsMap) {
		const props = this.props;

		const subj = <SubjObjSelectize
			nodes={props.nodes}
			placeholder='subject'
			name='subject'
			valueKey='id'
			labelKey='label'
			options={props.nodesList}
			value={{ id: edge.from, label: edge.from }}
			onChange={(name, value) => {
				this.subjObjChanged(name, value, edge.id);
			}}
		/>;

		const obj = <SubjObjSelectize
			nodes={props.nodes}
			placeholder='object'
			name='object'
			valueKey='id'
			labelKey='label'
			options={props.nodesList}
			value={{ id: edge.to, label: edge.to }}
			onChange={(name, value) => {
				this.subjObjChanged(name, value, edge.id);
			}}
		/>;

		// TODO: make it possible to add predicates
		// allow 'create from search':
		// http://furqanzafar.github.io/react-selectize/#/?category=simple
		return <li key={index}>
			<span>{subj} </span>
			<RelationSelectize
				options={relationTypes}
				value={relationsMap[edge.relation]}
				onChange={(name, relation) => {
					this.edgeRelationChanged(name, relation, edge.id);
				}}
			/>
			<span> {obj}</span>
		</li>;
	},

	render() {
		const props = this.props;

		return (
			<div className='predicate-editor language'>
				<div className='predicates'>
					<ul>
						{props.edges
							.map((edge, index) =>
								this.renderPredicate(
									edge,
									index,
									props.relationTypes,
									props.relationsMap
								)
						)}
					</ul>
				</div>
			</div>
		);
	},
});


module.exports = PredicateEditor;
