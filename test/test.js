'use strict';

var assert = require('assert');
var chalk = require('chalk');


var f1 = function(s) {
	return chalk.magenta(s);
};
var f2 = function(s) {
	return chalk.bgMagenta.black(s);
};
var f3 = function(s) {
	return chalk.bgMagenta.white(s);
};


var helpers = require('../app/scripts/helpers.js');
var modelHelpers = require('../app/scripts/model-helpers.js');


describe(f1('helpers.js'), function() {

	describe(f2('ellipsize()'), function() {
		it(f3('should work'), function() {
			var input = '0123456789';
			var shortened = helpers.ellipsize(5, input);
			assert(shortened === '012…89' || shortened === '01…789');

			input = '012';
			shortened = helpers.ellipsize(2, input);
			assert(shortened === '0…2');

			input = '01234';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '01234');

			input = '0';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '0');
		});
	});
});


describe(f1('model-helpers.js'), function() {

	describe(f2('removeNode()'), function() {
		const nodeId = 'node-id';
		let graph = {
			nodes: [ { id: nodeId } ],
			edges: [
				{ from: nodeId, to: 'another' },
				{ from: 'another', to: nodeId },
				{ from: 'another1', to: 'another2' },
			],
			groups: [ { nodeIds: [nodeId] } ],
		};
		const newGraph = modelHelpers.removeNode(graph, nodeId);

		it(f3('should remove node'), function() {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should remove edges to / from node'), function() {
			assert(newGraph.edges.length === 1);
		});

		it(f3('should remove node from groups'), function() {
			assert(newGraph.groups[0].nodeIds.length === 0);
		});
	});

	describe(f2('removeGroup()'), function() {
		const nodeId = 'node-id';
		const groupId = 'group-id';
		let graph = {
			nodes: [ { id: nodeId } ],
			edges: [],
			groups: [ { id: groupId, nodeIds: [nodeId] } ],
		};
		let removeNodes = true;
		const newGraph = modelHelpers.removeGroup(graph, groupId, removeNodes);

		it(f3('should remove group'), function() {
			assert(newGraph.groups.length === 0);
		});

		it(f3('should remove nodes'), function() {
			assert(newGraph.nodes.length === 0);
		});

		it(f3('should leave nodes alone'), function() {
			const nodeId = 'node-id';
			const groupId = 'group-id';
			let graph = {
				nodes: [ { id: nodeId } ],
				edges: [],
				groups: [ { id: groupId, nodeIds: [nodeId] } ],
			};
			let removeNodes = false;
			const newGraph = modelHelpers.removeGroup(graph, groupId, removeNodes);
			assert(newGraph.nodes.length === 1);
		});
	});

});
