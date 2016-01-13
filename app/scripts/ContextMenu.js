'use strict';

let React = require('react');
let d3 = require('d3');
let classnames = require('classnames');
let sf = require('sf');
let helpers = require('./helpers.js');


const halfPI = Math.PI * 0.5;
let arc = d3.svg.arc();


let ContextMenu = React.createClass({
	propTypes: {
		theme: React.PropTypes.object.isRequired,
		contextMenu: React.PropTypes.any/*.isRequired*/,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderPiePiece: function(fromAngle, toAngle, innerRadius, outerRadius, index, item) {
		arc.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.startAngle(fromAngle + halfPI)
			.endAngle(toAngle + halfPI);

		let d = arc();

		const inbetweenAngle = fromAngle + 0.5 * (toAngle - fromAngle);
		const inbetweenRadius = innerRadius + 0.5 * (outerRadius - innerRadius);
		let center = {
			x: Math.cos(inbetweenAngle) * inbetweenRadius,
			y: Math.sin(inbetweenAngle) * inbetweenRadius,
		};
		let translate = sf('translate({0},{1})', center.x, center.y);

		let iconHTML = { __html: (item.icon || '').trim() };
		let labelLines = item.label.split('\n')
			.map(function(line) {
				return line.trim();
			});

		let pathClasses = classnames('menu-item', { 'destructive': item.destructive });

		return (
			<g key={'piece-' + index}>
				<path
					className={pathClasses}
					d={d}
					onClick={item.action}>
				</path>
				<g transform={translate}>
					<text dy='-6' className='icon fa' dangerouslySetInnerHTML={iconHTML} />
					<text dy='7' className='label'>
						{labelLines.map(function(line) {
							const lineHTML = { __html: (line || '') };
							return <tspan
								key={'label-'+line+'-'+index}
								x='0'
								dy='1.1em'
								dangerouslySetInnerHTML={lineHTML} />;
						})}
					</text>
				</g>
			</g>
		);
	},

	render: function() {
		let that = this;
		const props = this.props;

		if (!props.contextMenu) { return null; }

		const numItems = props.contextMenu.menuItems.length;
		let angleStep = (numItems === 1) ? 160 : props.theme.contextMenu.desiredAngle;
		const maxAngle = 360;
		if (angleStep * numItems > maxAngle) {
			angleStep = maxAngle / numItems;
		}
		const totalAngle = angleStep * numItems;
		const center = -90;
		const startAngle = center - (totalAngle * 0.5);
		// const endAngle = center + (totalAngle * 0.5);

		const pieces = props.contextMenu.menuItems.map(function(item, index) {
			return that.renderPiePiece(
				helpers.degToRad(startAngle + angleStep * index),
				helpers.degToRad(startAngle + angleStep * (index + 1)),
				props.theme.contextMenu.innerRadius,
				props.theme.contextMenu.outerRadius,
				index,
				item
			);
		});

		return (
			<g className='context-menu'
				transform={'translate('+props.contextMenu.x+','+props.contextMenu.y+')'}>
				{pieces}
			</g>
		);
	},

});


module.exports = ContextMenu;
