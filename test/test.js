'use strict';

const assert = require('assert');
const chalk = require('chalk');
const R = require('ramda');
const _ = require('lodash');


const f1 = (s) => {
	return chalk.magenta(s);
};
const f2 = (s) => {
	return chalk.bgMagenta.black(s);
};
const f3 = (s) => {
	return chalk.bgMagenta.white(s);
};


const trespass = require('trespass.js');
const helpers = require('../app/scripts/helpers.js');
const modelHelpers = require('../app/scripts/model-helpers.js');


describe(f1('helpers.js'), () => {

	describe(f2('toHashMap()'), () => {
		const list = [
			{ id: 'item-1' },
			{ id: 'item-2' },
			{ id: 'item-3' },
			{ id: 'item-4' },
			{ id: 'item-5' }
		];
		const key = 'id';
		const result = helpers.toHashMap(key, list);

		it(f3('should find the item'), () => {
			assert(R.keys(result).length === list.length);
			list.forEach((item) => {
				assert(result[item.id] === item);
			});
		});
	});

	describe(f2('getItemByKey()'), () => {
		const coll = [
			{ id: '1' },
			{ id: '2' },
			{ id: '3' },
			{ id: '4' },
			{ id: '5' }
		];
		const key = 'id';
		const value = '4';
		const badKey = 'name';
		const badValue = '7';

		it(f3('should find the item'), () => {
			const result = helpers.getItemByKey(key, coll, value);
			assert(!!result && result.id === value);
		});

		it(f3('should not find the item #1'), () => {
			const result = helpers.getItemByKey(key, coll, badValue);
			assert(!result);
		});

		it(f3('should not find the item #2'), () => {
			const result = helpers.getItemByKey(badKey, coll, value);
			assert(!result);
		});
	});

	describe(f2('ellipsize()'), () => {
		it(f3('should work'), () => {
			let input = '0123456789';
			let shortened = helpers.ellipsize(5, input);
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

	describe(f2('isBetween()'), () => {
		it(f3('should work'), () => {
			assert(helpers.isBetween(5, 0, 10));
			assert(!helpers.isBetween(11, 0, 10));
			assert(!helpers.isBetween(-1, 0, 10));
		});
		it(f3('should include edge cases'), () => {
			assert(helpers.isBetween(0, 0, 10));
			assert(helpers.isBetween(10, 0, 10));
		});
	});

	describe(f2('isRectInsideRect()'), () => {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		const rectInside = { x: 10, y: 10, width: 50, height: 50 };
		const rectOutside = { x: -10, y: -10, width: 5, height: 5 };
		const rectPartiallyInside = { x: -10, y: -10, width: 50, height: 50 };
		const rectFullOverlap = { x: -10, y: -10, width: 120, height: 120 };
		const rectPartialOverlap1 = { x: 40, y: -10, width: 20, height: 120 };
		const rectPartialOverlap2 = { x: -10, y: 40, width: 120, height: 20 };

		it(f3('should work'), () => {
			assert( helpers.isRectInsideRect(rectInside, rect) );
			assert( !helpers.isRectInsideRect(rectOutside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #1'), () => {
			assert( helpers.isRectInsideRect(rectPartiallyInside, rect) );
		});

		it(f3('partial overlap should be considered "inside" #2'), () => {
			assert( helpers.isRectInsideRect(rectPartialOverlap1, rect) );
			assert( helpers.isRectInsideRect(rectPartialOverlap2, rect) );
		});

		it(f3('complete overlap should be considered "inside"'), () => {
			assert( helpers.isRectInsideRect(rectFullOverlap, rect) );
		});
	});

	describe(f2('areAttackerProfilesEqual()'), () => {
		const profile = {
			// "intent": "hostile",
			// "access": "external",
			// "outcomes": [
			// 	"damage",
			// 	"embarrassment"
			// ],
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "skills": "minimal",
			// "objectives": [
			// 	"copy",
			// 	"deny",
			// 	"destroy",
			// 	"damage",
			// 	"take"
			// ],
			// "visibility": "overt"
			budget: 5000,
			skill: 'H',
			time: 'S',
		};
		const profileEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment",
			// 	"damage"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"destroy",
			// 	"deny",
			// 	"copy"
			// ]
			time: 'S',
			skill: 'H',
			budget: 5000,
		};
		const profileNotEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: 10000,
			skill: 'M',
			time: 'HR',
		};
		const profileIncomplete = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": undefined,
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": undefined,
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: undefined,
			skill: 'M',
			time: 'HR',
		};

		it(f3('should work with equal profiles'), () => {
			assert(helpers.areAttackerProfilesEqual(profile, profileEqual));
			assert(helpers.areAttackerProfilesEqual(profileEqual, profile));
		});

		it(f3('should work with unequal profiles'), () => {
			assert(!helpers.areAttackerProfilesEqual(profile, profileNotEqual));
			assert(!helpers.areAttackerProfilesEqual(profileNotEqual, profile));
		});

		it(f3('should work with incomplete profiles'), () => {
			assert.doesNotThrow(() => {
				helpers.areAttackerProfilesEqual(profileIncomplete, profileNotEqual);
			});
		});
	});
});


describe(f1('model-helpers.js'), () => {

	describe(f2('getNodeGroups()'), () => {
		const node = { id: 'node-id' };
		const groups = {
			'group-1': { id: 'group-1', nodeIds: ['a', 'b', 'c'] },
			'group-2': { id: 'group-2', nodeIds: ['d', 'node-id', 'e'] },
			'group-3': { id: 'group-3', nodeIds: ['f', 'g', 'h'] },
			'group-4': { id: 'group-4', nodeIds: ['node-id', 'i', 'j'] },
		};

		it(f3('should return the groups'), () => {
			const nodeGroups = modelHelpers.getNodeGroups(node, groups);
			assert(nodeGroups.length === 2);
			assert(nodeGroups[0].id === 'group-2');
			assert(nodeGroups[1].id === 'group-4');
		});

		it(f3('should return empty list'), () => {
			const wrongNode = { id: 'non-existing-node' };
			const nodeGroups = modelHelpers.getNodeGroups(wrongNode, groups);
			assert(nodeGroups.length === 0);
		});
	});

	describe(f2('getNodeEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = {
			'edge-1': { id: 'edge-1', from: node.id, to: 'aaa' },
			'edge-2': { id: 'edge-2', from: 'bbb', to: node.id },
			'edge-3': { id: 'edge-3', from: 'bbb', to: 'aaa' },
		};
		const nodeEdges = modelHelpers.getNodeEdges(node, edges);

		it(f3('should return the right edges'), () => {
			assert(nodeEdges.length === 2);
			assert(nodeEdges[0].from === node.id);
			assert(nodeEdges[1].to === node.id);
		});
	});

	describe(f2('getEdgeNodes()'), () => {
		const edge = {
			from: 'node-1',
			to: 'node-2',
		};
		const nodes = {
			'node-1': { id: 'node-1' },
			'node-2': { id: 'node-2' },
			'node-3': { id: 'node-3' },
			'node-4': { id: 'node-4' },
		};

		it(f3('should return the nodes'), () => {
			const edgeNodes = modelHelpers.getEdgeNodes(edge, nodes);
			assert(edgeNodes.fromNode.id === 'node-1');
			assert(edgeNodes.toNode.id === 'node-2');
		});
	});

	describe(f2('inferEdgeType()'), () => {
		it(f3('edges between locations should have type "connection"'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'location');
			assert(edgeType === 'connection');
		});

		it(f3('edges between items should have type "networkConnection"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'item');
			assert(edgeType === 'networkConnection');
		});

		it(f3('edges between items and locations should have type "atLocation"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'location');
			assert(edgeType === 'atLocation');
		});

		// it(f3('spread operator test'), () => {
		// 	const edges = [
		// 		{ type: 'location' },
		// 		{ type: 'location' },
		// 	];
		// 	const edgeType = modelHelpers.inferEdgeType(...(edges.map(R.prop('type'))));
		// 	assert(edgeType === 'connection');
		// });

		it(f3('edge types that cannot be inferred should be undefined'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'item');
			assert(!edgeType);
		});
	});

	describe(f2('replaceIdInGroup()'), () => {
		const group = {
			id: 'group-id',
			nodeIds: ['node-1', 'node-2', 'node-3']
		};
		const mapping = {
			'node-2': 'a',
			'node-3': 'b',
			'bla': 'c',
		};

		it(f3('should change the ids'), () => {
			const changedGroup = modelHelpers.replaceIdInGroup(mapping, group);
			assert(changedGroup.nodeIds[0] === 'node-1');
			assert(changedGroup.nodeIds[1] === 'a');
			assert(changedGroup.nodeIds[2] === 'b');
		});
	});

	describe(f2('replaceIdInEdge()'), () => {
		it(f3('should stay the same'), () => {
			const mapping = {};
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === edge.from);
		});

		it(f3('should work with `from`'), () => {
			const mapping = { 'a': 'something' };
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === 'something');
		});

		it(f3('should work with `to`'), () => {
			const mapping = { 'b': 'something' };
			const edge = { from: 'a', to: 'b' }
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.to === 'something');
		});
	});

	describe(f2('duplicateNode()'), () => {
		const nodeId = 'old-id';
		const node = { id: nodeId };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id === nodeId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id !== nodeId);
		});
	});

	describe(f2('duplicateEdge()'), () => {
		const edgeId = 'old-id';
		const edge = { id: edgeId, from: 'x', to: 'y' };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id === edgeId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id !== edgeId);
		});
	});

	describe(f2('duplicateGroup()'), () => {
		const groupId = 'old-id';
		const group = { id: groupId, nodeIds: ['x', 'y'] };

		it(f3('should keep id'), () => {
			const keepId = true;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id === groupId);
		});

		it(f3('should create new id'), () => {
			const keepId = false;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id !== groupId);
		});
	});

	describe(f2('combineFragments()'), () => {
		const fragment1 = {
			nodes: {
				'node-1': { id: 'node-1' },
			},
			edges: {
				'edge-1': { id: 'edge-1' },
			},
			groups: {},
		};
		const fragment2 = {
			nodes: {
				'node-2': { id: 'node-2' },
				'node-3': { id: 'node-3' },
			},
			edges: {
				'edge-2': { id: 'edge-2' },
			},
			groups: {
				'group-2': { id: 'group-2' },
				'group-3': { id: 'group-3' },
			},
		};
		const combinedFragement = modelHelpers.combineFragments([fragment1, fragment2]);

		it(f3('should have the right number of things'), () => {
			assert(R.keys(combinedFragement.nodes).length === 3);
			assert(R.keys(combinedFragement.edges).length === 2);
			assert(R.keys(combinedFragement.groups).length === 2);
		});

		it(f3('should have correct values'), () => {
			assert(combinedFragement.nodes['node-1'] === fragment1.nodes['node-1']);
			assert(combinedFragement.nodes['node-3'] === fragment2.nodes['node-3']);
			assert(combinedFragement.nodes['edge-1'] === fragment1.nodes['edge-1']);
			assert(combinedFragement.nodes['edge-2'] === fragment2.nodes['edge-2']);
			assert(combinedFragement.nodes['group-2'] === fragment2.nodes['group-2']);
		});
	});

	describe(f2('nodeAsFragment()'), () => {
		const node = { id: 'node-id' };

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragment(node);
			assert(R.keys(fragment.nodes).length === 1);
			assert(fragment.nodes[node.id]);
		});
	});

	describe(f2('nodeAsFragmentInclEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = {
			'edge-1': { id: 'edge-1', from: 'node-id', to: 'aaa' },
			'edge-2': { id: 'edge-2', from: 'bbb', to: 'node-id' },
			'edge-3': { id: 'edge-3', from: 'bbb', to: 'aaa' },
		};

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragmentInclEdges(node, edges);
			assert(R.keys(fragment.nodes).length === 1);
			assert(fragment.nodes[node.id] === node);
			assert(R.keys(fragment.edges).length === 2);
			assert(fragment.edges['edge-1'] === edges['edge-1']);
			assert(fragment.edges['edge-2'] === edges['edge-2']);
		});
	});

	describe(f2('edgeAsFragment()'), () => {
		const edge = { id: 'edge-id' };

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragment(edge);
			assert(R.keys(fragment.edges).length === 1);
		});
	});

	describe(f2('edgeAsFragmentInclNodes()'), () => {
		const edge = { id: 'edge-id', from: 'node-2', to: 'node-1' };
		const nodes = {
			'node-1': { id: 'node-1' },
			'node-2': { id: 'node-2' },
		};

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragmentInclNodes(edge, nodes);
			assert(R.keys(fragment.edges).length === 1);
			assert(R.keys(fragment.nodes).length === 2);
		});
	});

	describe(f2('groupAsFragment()'), () => {
		const nodes = {
			'node-0': { id: 'node-0' },
			'node-1': { id: 'node-1' },
			'node-2': { id: 'node-2' },
			'node-3': { id: 'node-3' },
			'node-4': { id: 'node-4' },
		};
		const group = {
			id: 'group-id',
			nodeIds: ['node-1', 'node-2', 'node-3']
		};
		const graph = {
			nodes,
			edges: {},
			groups: {
				[group.id]: group
			}
		};

		it(f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.groupAsFragment(graph, group);
			assert(R.keys(fragment.groups).length === 1);
			assert(fragment.groups[group.id] === group);
			assert(R.keys(fragment.nodes).length === 3);
			assert(fragment.nodes['node-1'] === nodes['node-1']);
			assert(fragment.nodes['node-2'] === nodes['node-2']);
			assert(fragment.nodes['node-3'] === nodes['node-3']);
		});
	});

	describe(f2('duplicateFragment()'), () => {
		const nodes = {
			'node-1': { id: 'node-1' },
			'node-2': { id: 'node-2' },
			'node-3': { id: 'node-3' },
		};
		const groups = {
			'group-1': { id: 'group-1', nodeIds: ['node-1', 'node-2'] },
		};
		const edges = {
			'edge-1': { id: 'edge-1', from: 'node-1', to: 'node-2' },
			'edge-2': { id: 'edge-2', from: 'node-3', to: 'node-2' },
			'edge-3': { id: 'edge-3', from: 'node-x', to: 'node-1' },
		};
		const fragment = { nodes, edges, groups };
		const dupFragment = modelHelpers.duplicateFragment(fragment);
		const dupEdges = R.values(dupFragment.edges);
		const dupNodes = R.values(dupFragment.nodes);
		const dupGroups = R.values(dupFragment.groups);

		it(f3('should contain the right number of things'), () => {
			assert(R.keys(dupFragment.nodes).length === R.keys(fragment.nodes).length);
			assert(R.keys(dupFragment.edges).length === R.keys(fragment.edges).length);
			assert(R.keys(dupFragment.groups).length === R.keys(fragment.groups).length);
		});

		it(f3('should create new ids for everything inside'), () => {
			R.keys(dupFragment.nodes)
				.forEach((key) => {
					assert(nodes[key] === undefined);
				});
			R.keys(dupFragment.edges)
				.forEach((key) => {
					assert(edges[key] === undefined);
				});
			R.keys(dupFragment.groups)
				.forEach((key) => {
					assert(groups[key] === undefined);
				});
		});

		it(f3('should use new node ids in edges'), () => {
			assert(dupEdges[0].from === dupNodes[0].id);
			assert(dupEdges[0].to === dupNodes[1].id);
			assert(dupEdges[1].from === dupNodes[2].id);
			assert(dupEdges[1].to === dupNodes[1].id);
			assert(dupEdges[2].from === 'node-x');
			assert(dupEdges[2].to === dupNodes[0].id);
		});

		it(f3('should use new node ids in groups'), () => {
			const dupGroup = dupGroups[0];
			assert(dupGroup.nodeIds[0] === dupNodes[0].id);
			assert(dupGroup.nodeIds[1] === dupNodes[1].id);
		});
	});

	describe(f2('importFragment()'), () => {
		const fragment = {
			nodes: {
				'node-1': { id: 'node-1' },
				'node-2': { id: 'node-2' },
			},
			edges: {
				'edge-1': { id: 'edge-1' },
				'edge-2': { id: 'edge-2' },
			},
			groups: {
				'group-1': { id: 'group-1' },
				'group-2': { id: 'group-2' },
			}
		};
		const graph = {};
		const newGraph = modelHelpers.importFragment(graph, fragment);

		it(f3('should import everything'), () => {
			assert(R.keys(newGraph.nodes).length === R.keys(fragment.nodes).length);
			assert(R.keys(newGraph.edges).length === R.keys(fragment.edges).length);
			assert(R.keys(newGraph.groups).length === R.keys(fragment.groups).length);
		});

		// TODO: what else?
	});

	describe(f2('addNodeToGroup()'), () => {
		const node = { id: 'node-id' };
		const group = {
			id: 'group-id',
			nodeIds: []
		};
		const graph = {
			nodes: helpers.toHashMap('id', [node]),
			edges: {},
			groups: helpers.toHashMap('id', [group]),
		};

		const newGraph = modelHelpers.addNodeToGroup(graph, node.id, group.id);

		it(f3('should work'), () => {
			const groups = R.values(newGraph.groups);
			const nodes = R.values(newGraph.nodes);
			assert(groups[0].nodeIds.length === 1);
			assert(groups[0].nodeIds[0] === nodes[0].id);
		});
	});

	describe(f2('removeNode()'), () => {
		const node = { id: 'node-id' };
		const nodes = [node];
		const edges = [
			{ id: 'edge-1', from: node.id, to: 'another' },
			{ id: 'edge-2', from: 'another', to: node.id },
			{ id: 'edge-3', from: 'another1', to: 'another2' },
		];
		const groups = [{ id: 'group-id', nodeIds: [node.id] }];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: helpers.toHashMap('id', edges),
			groups: helpers.toHashMap('id', groups),
		};
		const newGraph = modelHelpers.removeNode(graph, node.id);

		it(f3('should remove node'), () => {
			assert(R.keys(newGraph.nodes).length === 0);
		});

		it(f3('should remove edges to / from node'), () => {
			assert(R.keys(newGraph.edges).length === 1);
		});

		it(f3('should remove node from groups'), () => {
			const groups = R.values(newGraph.groups);
			assert(groups[0].nodeIds.length === 0);
		});
	});

	describe(f2('removeGroup()'), () => {
		const node = { id: 'node-id' };
		const nodes = [node];
		const group = { id: 'group-id', nodeIds: [node.id] };
		const groups = [group];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: {},
			groups: helpers.toHashMap('id', groups),
		};

		const removeNodes = true;
		const newGraph = modelHelpers.removeGroup(graph, group.id, removeNodes);
		it(f3('should remove group'), () => {
			assert(R.keys(newGraph.groups).length === 0);
		});
		it(f3('should remove nodes'), () => {
			assert(R.keys(newGraph.nodes).length === 0);
		});

		it(f3('should leave nodes alone'), () => {
			const removeNodes = false;
			const newGraph = modelHelpers.removeGroup(graph, group.id, removeNodes);
			assert(R.keys(newGraph.nodes).length === 1);
		});
	});

	describe(f2('cloneNode()'), () => {
		const node1 = { id: 'node-id-1' };
		const node2 = { id: 'node-id-2' };
		const nodes = [node1, node2];
		const edge = { id: 'edge-id', from: node1.id, to: node2.id };
		const edges = [edge];
		const group = { id: 'group-id', nodeIds: [node1.id] };
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: helpers.toHashMap('id', edges),
			groups: helpers.toHashMap('id', [group]),
		};

		const newGraph = modelHelpers.cloneNode(graph, node1.id);

		const newNodes = R.values(newGraph.nodes);
		const newEdges = R.values(newGraph.edges);

		it(f3('should create a new node'), () => {
			assert(newNodes.length === nodes.length + 1);
		});

		it(f3('should create a new edge'), () => {
			assert(newEdges.length === edges.length + 1);
		});

		const origNode = node1;
		const clonedNodeId = R.symmetricDifference(
			R.keys(newGraph.nodes),
			R.keys(graph.nodes)
		)[0];

		it(f3('should give cloned node a new id'), () => {
			assert(!!clonedNodeId);
		});

		const clonedNode = newGraph.nodes[clonedNodeId];
		const clonedNodeEdges = modelHelpers.getNodeEdges(clonedNode, newGraph.edges);
		const clonedEdge = clonedNodeEdges[0];

		it(f3('cloned node should have original edges'), () => {
			assert(clonedEdge.from === clonedNode.id);
			assert(clonedEdge.to === node2.id);
		});

		it(f3('cloned node should be in original group'), () => {
			const group = R.values(newGraph.groups)[0];
			assert( R.contains(clonedNode.id, group.nodeIds) );
		});
	});

	describe(f2('cloneGroup()'), () => {
		const nodes = [
			{ id: 'node-id-1' },
			{ id: 'node-id-2' },
			{ id: 'node-id-3' }
		];
		const groupId = 'group-id';
		const group = {
			id: groupId,
			nodeIds: ['node-id-1', 'node-id-2', 'node-id-3']
		};
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: {},
			groups: helpers.toHashMap('id', [group]),
		};
		const newGraph = modelHelpers.cloneGroup(graph, group.id);
		const newNodes = R.values(newGraph.nodes);
		const newGroups = R.values(newGraph.groups);

		const clonedGroupId = R.symmetricDifference(
			R.keys(newGraph.groups),
			R.keys(graph.groups)
		)[0];
		const clonedGroup = newGraph.groups[clonedGroupId];

		it(f3('should create a new group'), () => {
			assert(!!clonedGroupId);
			assert(newGroups.length === 2);
		});

		it(f3('should give cloned group a new id'), () => {
			assert(clonedGroupId !== groupId);
		});

		it(f3('original group and cloned group should contain the same number of nodes'), () => {
			assert(newGroups[0].nodeIds.length === newGroups[1].nodeIds.length);
		});

		it(f3('should give cloned nodes a new id'), () => {
			newGroups[1].nodeIds
				.forEach((nodeId) => {
					assert(!R.contains(nodeId, newGroups[0].nodeIds))
				});
		});

		it(f3('all nodes should exist afterwards'), () => {
			assert(newNodes.length === 6);
		});

		it(f3('all original nodes should be in original group'), () => {
			const origGroup = newGraph.groups[groupId];
			const origNodeIds = origGroup.nodeIds;
			const origNodes = nodes;
			assert(origGroup.nodeIds.length === 3);
			assert(R.contains(origNodes[0].id, origNodeIds));
			assert(R.contains(origNodes[1].id, origNodeIds));
			assert(R.contains(origNodes[2].id, origNodeIds));
		});

		it(f3('all new nodes should be in new group'), () => {
			assert(clonedGroup.nodeIds.length === 3);
		});

		it(f3('edges should stay intact, and be cloned as well'), () => {
			const nodes = [
				{ id: 'node-id-1' },
				{ id: 'node-id-2' },
				{ id: 'external-node' }
			];
			const groups = [{
				id: 'group-id',
				nodeIds: ['node-id-1', 'node-id-2']
			}];
			const edges = [
				{ id: 'edge-1', from: 'node-id-1', to: 'node-id-2' },
				{ id: 'edge-2', from: 'node-id-1', to: 'external-node' },
			];
			const graph = {
				nodes: helpers.toHashMap('id', nodes),
				groups: helpers.toHashMap('id', groups),
				edges: helpers.toHashMap('id', edges),
			};

			const newGraph = modelHelpers.cloneGroup(graph, group.id);
			const newEdges = R.values(newGraph.edges);

			assert(newEdges.length === 4);
		});

		it(f3('should clone only one group'), () => {
			const newNewGraph = modelHelpers.cloneGroup(newGraph, clonedGroupId);
			assert(R.values(newNewGraph.groups).length === 3);
		});
	});

	describe(f2('updateComponentProperties()'), () => {
		const nodes = [
			{ id: 'node-1' },
			{ id: 'node-2' }
		];
		const edges = [
			{ id: 'edge-1', from: 'node-1', to: 'node-2' },
			{ id: 'edge-2', from: 'node-2', to: 'node-1' }
		];
		const groups = [
			{ id: 'group-1', nodeIds: [] },
			{ id: 'group-2', nodeIds: ['node-1'] }
		];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: helpers.toHashMap('id', edges),
			groups: helpers.toHashMap('id', groups),
		};

		it(f3('should work with nodes'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				graph,
				'node',
				'node-1',
				{ id: 'updated-node-1', attribute: 'test' }
			);
			assert(!updatedGraph.nodes['node-1']);
			assert(!!updatedGraph.nodes['updated-node-1']);
			assert(updatedGraph.nodes['updated-node-1']['attribute'] === 'test');
		});

		it(f3('should work with edges'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				graph,
				'edge',
				'edge-1',
				{ from: 'node-3', to: 'node-4' }
			);
			assert(updatedGraph.edges['edge-1'].from === 'node-3');
			assert(updatedGraph.edges['edge-1'].to === 'node-4');
		});

		it(f3('should work with groups'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				graph,
				'group',
				'group-2',
				{ nodeIds: ['node-3', 'node-4'] }
			);
			assert(updatedGraph.groups['group-2'].nodeIds.length === 2);
		});
	});

	describe(f2('layoutGraphByType()'), () => {
		const nodes = [
			{ id: 'node-1', modelComponentType: 'location' },
			{ id: 'node-2', modelComponentType: 'location' },
			{ id: 'node-3', modelComponentType: 'item' },
			{ id: 'node-4', modelComponentType: 'data' },
		];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
		};

		const newGraph = modelHelpers.layoutGraphByType(graph);

		it(f3('should be immutable'), () => {
			assert(graph !== newGraph);
		});

		const groups = R.values(newGraph.groups);

		it(f3('should group the nodes'), () => {
			assert(groups.length === 3);
		});

		// TODO: more
	});

	describe(f2('graphFromModel()'), () => {
		let model = trespass.model.create();
		model = trespass.model.addEdge(model, {
			source: 'source',
			target: 'target'
		});
		model = trespass.model.addLocation(model, {
			id: 'location'
		});
		model = trespass.model.addPredicate(model, {
			id: 'predicate',
			arity: 2,
			value: ['val1', 'val2']
		});
		model = trespass.model.addPolicy(model, {
			id: 'policy'
		});
		const {graph, other} = modelHelpers.graphFromModel(model);

		const edges = R.values(graph.edges);
		const nodes = R.values(graph.nodes);

		it(f3('should create edges'), () => {
			assert(edges.length === 1);
			assert(edges[0].from === 'source');
			assert(edges[0].to === 'target');
		});

		it(f3('should create locations'), () => {
			assert(nodes.length === 1);
			assert(nodes[0].id === 'location');
		});

		it(f3('should put predicates, policies, etc. into `other`'), () => {
			assert(other.policies.length === 1);
			// assert(other.predicates.length === 1);
		});

		// TODO: predicates
	});

	describe(f2('modelFromGraph()'), () => {
		const nodes = [
			{ id: 'node-1', modelComponentType: 'item', atLocations: ['location'] },
			{ id: 'node-2', modelComponentType: 'data', value: 'value', atLocations: ['location'] },
			{ id: 'node-3', modelComponentType: 'predicate', arity: '2', value: ['value'] }
		];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			// TODO: edges
		};
		const model = modelHelpers.modelFromGraph(graph);

		it(f3('should create elements'), () => {
			assert(model.system.items.length === 1);
			assert(model.system.data.length === 1);
			assert(model.system.predicates.length === 1);
		});

		// TODO: more
	});
});
