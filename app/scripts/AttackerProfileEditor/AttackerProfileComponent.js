'use strict';

const React = require('react');
const CircleComponent = require('./CircleComponent.js');


const resourcesArray = ['individual', 'club', 'contest', 'team', 'organization', 'government'];
const skillsArray = ['none', 'minimal', 'operational', 'adept'];
const limitsArray = ['code of conduct', 'legal', 'extra-legal, minor', 'extra-legal, major'];
const visibilityArray = ['overt', 'covert', 'clandestine', 'multiple'];
const intentAccessArray = ['external non-hostile', 'internal non-hostile', 'external hostile', 'internal hostile'];
const colorArray = ['#ffee56', '#ffb84d', '#ff5151', '#d60000', '#af0000', '#890000'];
const brighterArray = ['#fff177', '#ffc670', '#ff7373', '#de3232', '#bf3232', '#a03232'];


// React module to represent an attacker profile for visualization
let AttackerProfileComponent = React.createClass({
	propTypes: {
		attacker: React.PropTypes.object.isRequired,
		setActiveHover: React.PropTypes.func.isRequired,
	},

	render: function() {
		const props = this.props;

		const distances = this.computeDistances(props.attacker);

		const width = 150;
		const height = 150;
		const cx = width / 2
		const cy = height / 2;

		return (
			<svg
				className='attacker-profile-component'
				width={width}
				height={height}
			>
				<g className='profile-dots'>
					<CircleComponent
						radius={distances.intentR}
						colorIdx={distances.intentIdx}
						cx={cx}
						cy={cy}
						className='intentCircle'
						type='intent'
						setActiveHover={props.setActiveHover}
					/>
					<CircleComponent
						radius={distances.skillR}
						colorIdx={distances.skillIdx}
						cx={cx}
						cy={cy}
						className='skillCircle'
						type='skill'
						setActiveHover={props.setActiveHover}
					/>
					<CircleComponent
						radius={distances.visibilityR}
						colorIdx={distances.visibilityIdx}
						cx={cx}
						cy={cy} className='visibilityCircle'
						type='visibility'
						setActiveHover={props.setActiveHover}
					/>
					<CircleComponent
						radius={distances.limitsR}
						colorIdx={distances.limitsIdx}
						cx={cx}
						cy={cy} className='limitsCircle'
						type='limits'
						setActiveHover={props.setActiveHover}
					/>
					<CircleComponent
						radius={distances.resourcesR}
						colorIdx={distances.resourcesIdx}
						cx={cx}
						cy={cy} className='resourcesCircle'
						type='resources'
						setActiveHover={props.setActiveHover}
					/>
				</g>
			</svg>
		);
	},

	computeDistances: function(attacker) {
		let distances = {};
		distances.limitsIdx = limitsArray.indexOf(attacker.limits);
		distances.visibilityIdx = visibilityArray.indexOf(attacker.visibility);
		distances.skillIdx = skillsArray.indexOf(attacker.skills);
		distances.intentIdx = intentAccessArray.indexOf(attacker.access + ' ' + attacker.intent);
		distances.resourcesIdx = resourcesArray.indexOf(attacker.resources);

		const multipler = 3;

		distances.resourcesR = (distances.resourcesIdx + 1) * multipler;
		distances.limitsR = distances.resourcesR + (distances.limitsIdx + 1) * multipler;
		distances.visibilityR = distances.limitsR + (distances.visibilityIdx + 1) * multipler;
		distances.skillR = distances.visibilityR + (distances.skillIdx + 1) * multipler;
		distances.intentR = distances.skillR + (distances.intentIdx + 1) * multipler;

		return distances;
	},
});

module.exports = AttackerProfileComponent;
