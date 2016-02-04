'use strict';

let $ = require('jquery');
let R = require('ramda');
let React = require('react');
let classnames = require('classnames');
const actionCreators = require('./actionCreators.js');

let GraphMinimap = require('./GraphMinimap.js');
let PropertiesPanel = require('./PropertiesPanel.js');
let GraphOutline = require('./GraphOutline.js');
let Library = require('./components/Library/Library.js');

let OverlayTrigger = require('react-bootstrap').OverlayTrigger;
let Tooltip = require('react-bootstrap').Tooltip;

let AttackerProfileEditor = require('./AttackerProfileEditor/AttackerProfileEditorLanguage.js');
let AttackerProfile = require('./AttackerProfileEditor/AttackerProfile.js');

// const analysisTools = require('../data/analysis-tools.js');

// TODO: move API stuff to trespass.js
const api = require('../../api.js').api;
const serverPort = require('../../api.js').serverPort;
const serverDomain = require('../../api.js').serverDomain;
function apiUrl(url) {
	return 'http://' + serverDomain + ':' + serverPort + url;
}


function handleAdd() {
	console.log('here');
}


let Tab = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired,
		selectedSection: React.PropTypes.string.isRequired,
		icon: React.PropTypes.string.isRequired,
		tooltip: React.PropTypes.string.isRequired,
		handleClick: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	render: function() {
		const props = this.props;
		const isSelected = (props.selectedSection === props.name);
		// const imgSrc = (isSelected)
		// 	? props.icon.replace('.svg', '-inverted.svg')
		// 	: props.icon;
		const imgSrc = props.icon;

		return <OverlayTrigger
			placement='left'
			overlay={<Tooltip id={props.name}>{props.tooltip}</Tooltip>}>
			<div
				className={classnames('step-icon',
					{ selected: isSelected })
				}
				onClick={props.handleClick} >
				<img src={imgSrc} />
			</div>
		</OverlayTrigger>;
	},
});


let Wizard = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderMinimap: function(props) {
		return <GraphMinimap
			id='minimap'
			graph={props.graph}
			theme={props.theme}
			showEdges={true}
		/>;
	},

	renderOutline: function(props) {
		return null; // TODO: implement some sort of debug view
		// return <div>
		// 	<h3 className='title'>outline</h3>
		// 	<GraphOutline graph={props.graph} dispatch={props.dispatch} />
		// </div>;
	},

	renderProperties: function(props) {
		return <PropertiesPanel
			id='propspanel'
			selected={props.selected}
			graph={props.graph}
			dispatch={props.dispatch}
			relationsLibUrl={apiUrl(api.relations.url)}
		/>;
	},

	renderImport: function(props) {
		return <div>
			<h2 className='title'>Import</h2>
			<input
				style={{ display: 'none' }}
				ref='load-model'
				type='file'
				accept='.xml'
				onChange={this.loadXMLFile} />

			<button
				onClick={this.clickFileButton}
				className='btn btn-default btn-xs'>
				Load model XML file
			</button>
		</div>;
	},

	renderLocations: function(props) {
		const filterFn = function(a) {
			return R.contains(a.modelComponentType, ['location']);
		};
		return <div>
			<h2 className='title'>Locations</h2>
			<div id='pattern-lib'>
				<Library {...props}
					key={'locations-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library {...props}
					key={'locations-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderAssets: function(props) {
		const filterFn = function(a) {
			return R.contains(a.modelComponentType, ['item', 'data']);
		};
		return <div>
			<h2 className='title'>Assets</h2>
			<div id='component-lib'>
				<Library {...props}
					key={'assets-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderActors: function(props) {
		const filterFn = function(a) {
			return R.contains(a.modelComponentType, ['actor', 'role']);
		};
		return <div>
			<h2 className='title'>Actors</h2>
			<div id='pattern-lib'>
				<Library {...props}
					key={'actors-patterns'}
					url={apiUrl(api.patterns.url)}
					title='patterns' />
			</div>
			<div id='component-lib'>
				<Library {...props}
					key={'actors-components'}
					url={apiUrl(api.components.url)}
					title='components'
					filter={filterFn}
					onAdd={handleAdd} />
			</div>
		</div>;
	},

	renderConnections: function(props) {
		return <div>
			<h2 className='title'>Connections</h2>
		</div>;
	},

	renderPolicies: function(props) {
		return <div>
			<h2 className='title'>Policies</h2>
		</div>;
	},

	renderAttackerProfile: function(props) {
		return <div>
			<h2 className='title'>Attacker profile</h2>
			<AttackerProfileEditor handleUpdate={this.handleAttackerProfileUpdate} />
			{(!!props.attackerProfile)
				? <AttackerProfile profile={props.attackerProfile} />
				: null
			}
		</div>;
	},

	handleAttackerProfileUpdate: function(profile) {
		const props = this.props;
		props.dispatch( actionCreators.attackerProfileChanged(profile) );
	},

	renderRunAnalysis: function(props) {
		const goalValue = (!!props.attackerGoal && !!props.attackerGoalType)
			? props.attackerGoal[props.attackerGoalType].asset || ''
			: '';

		const readyToRun = (!!props.attackerGoal);

		return <div>
			<h2 className='title'>Run analysis</h2>

			<button
				onClick={this.downloadAsXML}
				className='btn btn-default btn-xs'>
				Save current model as XML
			</button>

			<hr/>

			{/*<h3>Tool</h3>
			<select>
				{R.values(analysisTools)
					.map(function(tool) {
						return <option key={tool.name} value={tool.id}>{tool.name}</option>;
					})
				}
			</select>*/}
			<h3>Tool chains</h3>
			<select ref='toolchain'>
				{props.toolChains
					.map(function(chain) {
						return <option
							key={chain.id}
							value={chain.id}>
							{chain.name}
						</option>;
					})
				}
			</select>
			<br/>

			<h3>Attacker goal</h3>
			<select
				value={goalValue}
				onChange={this.setAttackerGoal}
			>{/*disabled={true}*/}
				<option value=''>— select goal —</option>
				{props.graph.nodes
					.filter((item) => {
						return item.modelComponentType === 'item' ||
							item.modelComponentType === 'data';
					})
					.map(this.renderGoalOption)
				}
			</select>
			<br/>

			<hr/>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				<button
					disabled={!readyToRun}
					onClick={this.runAnalysis}
					className='btn btn-primary'
				>
					<b>Run analysis</b>
				</button>
			</div>
		</div>;
	},

	renderGoalOption: function(item) {
		return <option
			key={item.id}
			value={item.id}
		>
			{item.label}
		</option>;
	},

	render: function() {
		const props = this.props;
		const wizard = props.wizard;
		const selectedSection = wizard.selectedSection;

		const wizardSteps = {
			'import': { renderFn: this.renderImport },
			'locations': { renderFn: this.renderLocations },
			'assets': { renderFn: this.renderAssets },
			'actors': { renderFn: this.renderActors },
			'connections': { renderFn: this.renderConnections },
			'policies': { renderFn: this.renderPolicies },
			'attackerprofile': { renderFn: this.renderAttackerProfile },
			'runanalysis': { renderFn: this.renderRunAnalysis },
		};

		let defaultRenderFn = function() {
			return <div>error</div>;
		};
		let renderFn = (!!wizardSteps[wizard.selectedSection])
			? wizardSteps[wizard.selectedSection].renderFn
				|| defaultRenderFn
			: defaultRenderFn;

		return (
			<div>
				{this.renderMinimap(props)}
				{this.renderOutline(props)}
				{this.renderProperties(props)}
				<hr/>

				<div id='wizard-container'>
					<div id='steps-container'>
						<Tab name='import'
							selectedSection={selectedSection}
							icon='images/icons/import-01.svg'
							tooltip='Import model'
							handleClick={R.partial(this.selectWizardStep, ['import'])}
						/>
						<Tab name='locations'
							selectedSection={selectedSection}
							icon='images/icons/location-01.svg'
							tooltip='Locations'
							handleClick={R.partial(this.selectWizardStep, ['locations'])}
						/>
						<Tab name='assets'
							selectedSection={selectedSection}
							icon='images/icons/assets-01.svg'
							tooltip='Assets'
							handleClick={R.partial(this.selectWizardStep, ['assets'])}
						/>
						<Tab name='actors'
							selectedSection={selectedSection}
							icon='images/icons/actors-01.svg'
							tooltip='Actors'
							handleClick={R.partial(this.selectWizardStep, ['actors'])}
						/>
						<Tab name='connections'
							selectedSection={selectedSection}
							icon='images/icons/connections-01.svg'
							tooltip='Connections'
							handleClick={R.partial(this.selectWizardStep, ['connections'])}
						/>
						<Tab name='policies'
							selectedSection={selectedSection}
							icon='images/icons/policies-01.svg'
							tooltip='Policies'
							handleClick={R.partial(this.selectWizardStep, ['policies'])}
						/>
						<Tab name='attackerprofile'
							selectedSection={selectedSection}
							icon='images/icons/attacker_profile-01.svg'
							tooltip='Attacker profile'
							handleClick={R.partial(this.selectWizardStep, ['attackerprofile'])}
						/>
						<Tab name='runanalysis'
							selectedSection={selectedSection}
							icon='images/icons/run-01.svg'
							tooltip='Run analysis'
							handleClick={R.partial(this.selectWizardStep, ['runanalysis'])}
						/>
					</div>

					{renderFn(props)}

					{this.renderOverlay()}
				</div>
			</div>
		);
	},

	setAttackerGoal: function(event) {
		const assetId = event.target.value;
		const goalType = 'assetGoal';
		const goalData = {
			[goalType]: {
				attacker: 'X',
				asset: assetId
			}
		};
		this.props.dispatch( actionCreators.setAttackerGoal(goalType, goalData) );
	},

	runAnalysis: function() {
		const select = this.refs.toolchain;
		this.props.dispatch( actionCreators.runAnalysis(select.value) );
	},

	renderOverlay: function() {
		const props = this.props;
		if (!props.analysisRunning) {
			return null;
		}

		return <div id='task-overlay'>
			<div>{/* TODO: display / link to intermediate results */}
				<h3>Generating attack tree...</h3>
				<h3>Attack Pattern Library...</h3>
				<h3>Tree Evaluator...</h3>
				<h3><a href='http://lustlab.net/dev/trespass/visualizations/analytics5/' target='_blank'>Visualise results</a></h3>
			</div>
		</div>;
	},

	clickFileButton: function(event) {
		event.preventDefault();
		$(this.refs['load-model']).click();
	},

	loadXMLFile: function(event) {
		event.preventDefault();
		let $fileInput = $(this.refs['load-model']);
		let file = $fileInput[0].files[0];
		this.props.dispatch( actionCreators.loadXMLFile(file) );
	},

	downloadAsXML: function(event) {
		event.preventDefault();
		this.props.dispatch( actionCreators.downloadAsXML() );
	},

	selectWizardStep(name, event) {
		event.preventDefault();
		this.props.dispatch( actionCreators.selectWizardStep(name) );
	}

});


module.exports = Wizard;
