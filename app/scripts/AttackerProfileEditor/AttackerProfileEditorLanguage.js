'use strict';

const React = require('react');
const R = require('ramda');
const classnames = require('classnames');

const helpers = require('../helpers.js');

// const AttackerProfile = require('../AttackerProfileEditor/AttackerProfile.js');
const attackerProfiles = require('../../data/attacker-profiles.js');
const profilePresets = attackerProfiles.profiles;
const profileOptions = attackerProfiles.options;
const DropdownSearchable = require('./DropdownSearchable.js');
const DropdownSelectize = require('./DropdownSelectize.js');


const displayAttribute = 'title';
const valueAttribute = 'value';


function getClassName(option, value) {
	if (!value) { return ''; }
	return (!!option)
		? option.className
		: '';
}


let AttackerProfileEditorLanguage = React.createClass({
	propTypes: {
		handleUpdate: React.PropTypes.func,
		profile: React.PropTypes.object/*.isRequired*/
	},

	getDefaultProps: function() {
		return {
			handleUpdate: () => {}
		};
	},

	getInitialState: function() {
		return {
			title: '' // selected preset title
		};
	},

	updateProfile: function(name, val) {
		const props = this.props;
		let state = this.state;
		state[name] = val;

		state.title = '';
		profilePresets.forEach(function(profile) {
			if (helpers.areAttackerProfilesEqual(profile, state)) {
				state.title = profile.title;
			}
		});

		this.setState(state, () => {
			// report to parent
			props.handleUpdate(state);
		});
	},

	renderItem: function(item, index) {
		const state = this.state;

		const valueEquals = R.propEq(valueAttribute);
		const value = state[item.name];
		const option = R.find(valueEquals(value))(item.options);

		// set default label, if there is no value
		const label = (!value)
			? `[${item.name}]`
			: (item.multiple)
				// multiple values
				? (value || []).join(', ') // TODO: show displayAttribute here, too
				// single value
				: (!!option)
					? option[displayAttribute]
					: '';

		const barClasses = classnames(
			'bar',
			getClassName(option, value)
		);

		// kind of hacky for now
		if (item.options.length === 1 && item.options[0].value === Number) {
			return <li key={'li-'+item.name}>
				<div className={barClasses}></div>
				<span>{item.name} {(item.multiple) ? 'are' : 'is'} </span>
				<input
					type='number'
					placeholder={item.name}
					value={value || undefined}
					onChange={(event) => {
						this.updateProfile(item.name, event.target.value);
					}}/>
			</li>;
		}

		return <li key={'li-'+item.name}>
			<div className={barClasses}></div>
			<span>{item.name} {(item.multiple) ? 'are' : 'is'} </span>
			{(item.multiple)
				? <DropdownSelectize
					name={item.name}
					title={label}
					value={value}
					items={item.options}
					displayAttribute={displayAttribute}
					valueAttribute={valueAttribute}
					handleSelection={this.updateProfile}
				/>
				: <DropdownSearchable
					name={item.name}
					title={label}
					value={value}
					searchable={false}
					items={item.options}
					displayAttribute={displayAttribute}
					valueAttribute={valueAttribute}
					handleSelection={this.updateProfile}
				/>
			}
		</li>;
	},

	renderPresetOption: function(preset, index) {
		return <option key={preset.title} value={preset.title}>
			{preset.title}
		</option>;
	},

	render: function() {
		const props = this.props;

		return (
			<div className='attackerProfile-editor-language language'>
				<div>
					Presets:<br />
					<select name='presets' onChange={this.handleSelectPreset} value={this.state.title}>
						<option value=''>— none —</option>
						{profilePresets.map(this.renderPresetOption)}
					</select>
				</div>
				<br />
				{/*<AttackerProfile profile={props.profile} />
				<br />*/}
				<div>
					<span><b>The attacker's</b></span>
					<ul>
						{profileOptions.map(this.renderItem)}
					</ul>
				</div>
			</div>
		);
	},

	handleSelectPreset: function(event) {
		const preset = helpers.getItemByKey('title', profilePresets, event.target.value);
		if (!!preset) {
			this.setState(preset, () => {
				this.props.handleUpdate(this.state);
			});
		}
	},
});


module.exports = AttackerProfileEditorLanguage;
