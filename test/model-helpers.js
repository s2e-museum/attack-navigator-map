const assert = require('assert');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const _ = require('lodash');

const common = require('./common.js');

const trespass = require('trespass.js');
const constants = require('../app/scripts/constants.js');
const helpers = require('../app/scripts/helpers.js');
const modelHelpers = require('../app/scripts/model-helpers.js');


describe(common.f1('model-helpers.js'), () => {
	describe(common.f2('getNodeGroups()'), () => {
		const node = { id: 'node-id' };
		const groups = {
			'group-1': { id: 'group-1', nodeIds: ['a', 'b', 'c'] },
			'group-2': { id: 'group-2', nodeIds: ['d', 'node-id', 'e'] },
			'group-3': { id: 'group-3', nodeIds: ['f', 'g', 'h'] },
			'group-4': { id: 'group-4', nodeIds: ['node-id', 'i', 'j'] },
		};

		it(common.f3('should return the groups'), () => {
			const nodeGroups = modelHelpers.getNodeGroups(node, groups);
			assert(nodeGroups.length === 2);
			assert(nodeGroups[0].id === 'group-2');
			assert(nodeGroups[1].id === 'group-4');
		});

		it(common.f3('should return empty list'), () => {
			const wrongNode = { id: 'non-existing-node' };
			const nodeGroups = modelHelpers.getNodeGroups(wrongNode, groups);
			assert(nodeGroups.length === 0);
		});
	});

	describe(common.f2('getNodeEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = {
			'edge-1': { id: 'edge-1', from: node.id, to: 'aaa' },
			'edge-2': { id: 'edge-2', from: 'bbb', to: node.id },
			'edge-3': { id: 'edge-3', from: 'bbb', to: 'aaa' },
		};
		const nodeEdges = modelHelpers.getNodeEdges(node, edges);

		it(common.f3('should return the right edges'), () => {
			assert(nodeEdges.length === 2);
			assert(nodeEdges[0].from === node.id);
			assert(nodeEdges[1].to === node.id);
		});
	});

	describe(common.f2('getEdgeNodes()'), () => {
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

		it(common.f3('should return the nodes'), () => {
			const edgeNodes = modelHelpers.getEdgeNodes(edge, nodes);
			assert(edgeNodes.fromNode.id === 'node-1');
			assert(edgeNodes.toNode.id === 'node-2');
		});
	});

	describe(common.f2('inferEdgeType()'), () => {
		it(common.f3('edges between locations should have type `undefined`'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'location');
			assert(edgeType === constants.RELTYPE_PHYSICAL_CONNECTION);
		});

		it(common.f3('edges between items should have type "networkConnection"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'item');
			assert(edgeType === constants.RELTYPE_NETWORK);
		});

		it(common.f3('edges between items and locations should have type "atLocation"'), () => {
			const edgeType = modelHelpers.inferEdgeType('item', 'location');
			assert(edgeType === constants.RELTYPE_ATLOCATION);
		});

		it(common.f3('edges between data and items should have type "atLocation"'), () => {
			const edgeType = modelHelpers.inferEdgeType('data', 'item');
			assert(edgeType === constants.RELTYPE_ATLOCATION);
		});

		// it(common.f3('spread operator test'), () => {
		// 	const edges = [
		// 		{ type: 'location' },
		// 		{ type: 'location' },
		// 	];
		// 	const edgeType = modelHelpers.inferEdgeType(...(edges.map(R.prop('type'))));
		// 	assert(edgeType === 'connection');
		// });

		it(common.f3('edge types that cannot be inferred should be undefined'), () => {
			const edgeType = modelHelpers.inferEdgeType('location', 'item');
			assert(!edgeType);
		});
	});

	describe(common.f2('impossibleEdgeTypes()'), () => {
		it(common.f3('should work'), () => {
			const impossibleTypes = modelHelpers.impossibleEdgeTypes(
				'item',
				'data'
			);
			assert(R.contains(constants.RELTYPE_PHYSICAL_CONNECTION, impossibleTypes));
		});
	});

	describe(common.f2('replaceIdInGroup()'), () => {
		const group = {
			id: 'group-id',
			nodeIds: ['node-1', 'node-2', 'node-3']
		};
		const mapping = {
			'node-2': 'a',
			'node-3': 'b',
			'bla': 'c',
		};

		it(common.f3('should change the ids'), () => {
			const changedGroup = modelHelpers.replaceIdInGroup(mapping, group);
			assert(changedGroup.nodeIds[0] === 'node-1');
			assert(changedGroup.nodeIds[1] === 'a');
			assert(changedGroup.nodeIds[2] === 'b');
		});
	});

	describe(common.f2('replaceIdInPolicy()'), () => {
		const policy = {
			atLocations: [
				'laptop',
				'RoomDatacenter',
			],
		};
		const mapping = {
			'laptop': 'new-id',
		};

		it(common.f3('should change the ids'), () => {
			const changedPolicy = modelHelpers.replaceIdInPolicy(mapping, policy);
			assert(changedPolicy.atLocations[0] === 'new-id');
			assert(changedPolicy.atLocations[1] === 'RoomDatacenter');
		});
	});

	describe(common.f2('replaceIdInEdge()'), () => {
		it(common.f3('should stay the same'), () => {
			const mapping = {};
			const edge = { from: 'a', to: 'b' };
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === edge.from);
		});

		it(common.f3('should work with `from`'), () => {
			const mapping = { 'a': 'something' };
			const edge = { from: 'a', to: 'b' };
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.from === 'something');
		});

		it(common.f3('should work with `to`'), () => {
			const mapping = { 'b': 'something' };
			const edge = { from: 'a', to: 'b' };
			const newEdge = modelHelpers.replaceIdInEdge(mapping, edge);
			assert(newEdge.to === 'something');
		});
	});

	describe(common.f2('duplicateNode()'), () => {
		const nodeId = 'old-id';
		const node = { id: nodeId };

		it(common.f3('should keep id'), () => {
			const keepId = true;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id === nodeId);
		});

		it(common.f3('should create new id'), () => {
			const keepId = false;
			const newNode = modelHelpers.duplicateNode(node, keepId);
			assert(newNode.id !== nodeId);
		});
	});

	describe(common.f2('duplicateEdge()'), () => {
		const edgeId = 'old-id';
		const edge = { id: edgeId, from: 'x', to: 'y' };

		it(common.f3('should keep id'), () => {
			const keepId = true;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id === edgeId);
		});

		it(common.f3('should create new id'), () => {
			const keepId = false;
			const newEdge = modelHelpers.duplicateEdge(edge, keepId);
			assert(newEdge.id !== edgeId);
		});
	});

	describe(common.f2('duplicateGroup()'), () => {
		const groupId = 'old-id';
		const group = { id: groupId, nodeIds: ['x', 'y'] };

		it(common.f3('should keep id'), () => {
			const keepId = true;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id === groupId);
		});

		it(common.f3('should create new id'), () => {
			const keepId = false;
			const newGroup = modelHelpers.duplicateGroup(group, keepId);
			assert(newGroup.id !== groupId);
		});
	});

	describe(common.f2('combineFragments()'), () => {
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
			policies: {
				'policy-1': { id: 'policy-1' },
			},
		};
		const combinedFragement = modelHelpers.combineFragments([fragment1, fragment2]);

		it(common.f3('should have the right number of things'), () => {
			assert(R.keys(combinedFragement.nodes).length === 3);
			assert(R.keys(combinedFragement.edges).length === 2);
			assert(R.keys(combinedFragement.groups).length === 2);
		});

		it(common.f3('should have correct values'), () => {
			assert(combinedFragement.nodes['node-1'] === fragment1.nodes['node-1']);
			assert(combinedFragement.nodes['node-3'] === fragment2.nodes['node-3']);
			assert(combinedFragement.nodes['edge-1'] === fragment1.nodes['edge-1']);
			assert(combinedFragement.nodes['edge-2'] === fragment2.nodes['edge-2']);
			assert(combinedFragement.nodes['group-2'] === fragment2.nodes['group-2']);
		});

		it(common.f3('should merge everything — not only nodes, groups, and edges'), () => {
			assert(R.keys(combinedFragement.policies).length === 1);
		});
	});

	describe(common.f2('nodeAsFragment()'), () => {
		const node = { id: 'node-id' };

		it(common.f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragment(node);
			assert(R.keys(fragment.nodes).length === 1);
			assert(fragment.nodes[node.id]);
		});
	});

	describe(common.f2('nodeAsFragmentInclEdges()'), () => {
		const node = { id: 'node-id' };
		const edges = {
			'edge-1': { id: 'edge-1', from: 'node-id', to: 'aaa' },
			'edge-2': { id: 'edge-2', from: 'bbb', to: 'node-id' },
			'edge-3': { id: 'edge-3', from: 'bbb', to: 'aaa' },
		};

		it(common.f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.nodeAsFragmentInclEdges(node, edges);
			assert(R.keys(fragment.nodes).length === 1);
			assert(fragment.nodes[node.id] === node);
			assert(R.keys(fragment.edges).length === 2);
			assert(fragment.edges['edge-1'] === edges['edge-1']);
			assert(fragment.edges['edge-2'] === edges['edge-2']);
		});
	});

	describe(common.f2('edgeAsFragment()'), () => {
		const edge = { id: 'edge-id' };

		it(common.f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragment(edge);
			assert(R.keys(fragment.edges).length === 1);
		});
	});

	describe(common.f2('edgeAsFragmentInclNodes()'), () => {
		const edge = { id: 'edge-id', from: 'node-2', to: 'node-1' };
		const nodes = {
			'node-1': { id: 'node-1' },
			'node-2': { id: 'node-2' },
		};

		it(common.f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.edgeAsFragmentInclNodes(edge, nodes);
			assert(R.keys(fragment.edges).length === 1);
			assert(R.keys(fragment.nodes).length === 2);
		});
	});

	describe(common.f2('groupAsFragment()'), () => {
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

		it(common.f3('should create a proper fragment'), () => {
			const fragment = modelHelpers.groupAsFragment(graph, group);
			assert(R.keys(fragment.groups).length === 1);
			assert(fragment.groups[group.id] === group);
			assert(R.keys(fragment.nodes).length === 3);
			assert(fragment.nodes['node-1'] === nodes['node-1']);
			assert(fragment.nodes['node-2'] === nodes['node-2']);
			assert(fragment.nodes['node-3'] === nodes['node-3']);
		});
	});

	describe(common.f2('duplicateFragment()'), () => {
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
		const policies = {
			'policy-1': { id: 'policy-1' },
			'policy-2': { id: 'policy-2' },
			'policy-3': { id: 'policy-3' },
		};
		const processes = {
			'process-1': { id: 'process-1' },
			'process-2': { id: 'process-2' },
			'process-3': { id: 'process-3' },
		};

		const fragment = { nodes, edges, groups };

		const dupFragment = modelHelpers.duplicateFragment(fragment);
		const dupEdges = R.values(dupFragment.edges);
		const dupNodes = R.values(dupFragment.nodes);
		const dupGroups = R.values(dupFragment.groups);
		const dupPolicies = R.values(dupFragment.policies);
		const dupProcesses = R.values(dupFragment.processes);

		it(common.f3('should contain the right number of things'), () => {
			assert(R.keys(dupNodes).length === R.keys(fragment.nodes).length);
			assert(R.keys(dupEdges).length === R.keys(fragment.edges).length);
			assert(R.keys(dupGroups).length === R.keys(fragment.groups).length);
			assert(R.keys(dupPolicies).length === R.keys(fragment.policies).length);
			assert(R.keys(dupProcesses).length === R.keys(fragment.processes).length);
		});

		it(common.f3('should create new ids for everything inside'), () => {
			R.keys(dupNodes)
				.forEach((key) => assert(nodes[key] === undefined));
			R.keys(dupEdges)
				.forEach((key) => assert(edges[key] === undefined));
			R.keys(dupGroups)
				.forEach((key) => assert(groups[key] === undefined));
			R.keys(dupPolicies)
				.forEach((key) => assert(policies[key] === undefined));
			R.keys(dupProcesses)
				.forEach((key) => assert(processes[key] === undefined));
		});

		it(common.f3('should use new node ids in edges'), () => {
			assert(dupEdges[0].from === dupNodes[0].id);
			assert(dupEdges[0].to === dupNodes[1].id);
			assert(dupEdges[1].from === dupNodes[2].id);
			assert(dupEdges[1].to === dupNodes[1].id);
			assert(dupEdges[2].from === 'node-x');
			assert(dupEdges[2].to === dupNodes[0].id);
		});

		it(common.f3('should use new node ids in groups'), () => {
			const dupGroup = dupGroups[0];
			assert(dupGroup.nodeIds[0] === dupNodes[0].id);
			assert(dupGroup.nodeIds[1] === dupNodes[1].id);
		});
	});

	describe(common.f2('importFragment()'), () => {
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
			},
			policies: {
				'policy-1': { id: 'policy-1' },
				'policy-2': { id: 'policy-2' },
			},
		};
		const graph = {};
		const newGraph = modelHelpers.importFragment(graph, fragment);

		it(common.f3('should import everything'), () => {
			assert(R.keys(newGraph.nodes).length === R.keys(fragment.nodes).length);
			assert(R.keys(newGraph.edges).length === R.keys(fragment.edges).length);
			assert(R.keys(newGraph.groups).length === R.keys(fragment.groups).length);
			assert(R.keys(newGraph.policies).length === R.keys(fragment.policies).length);
		});

		// TODO: processes
		// TODO: predicates?
	});

	describe(common.f2('addNodeToGroup()'), () => {
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

		it(common.f3('should work'), () => {
			const groups = R.values(newGraph.groups);
			const nodes = R.values(newGraph.nodes);
			assert(groups[0].nodeIds.length === 1);
			assert(groups[0].nodeIds[0] === nodes[0].id);
		});
	});

	describe(common.f2('removeNode()'), () => {
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

		it(common.f3('should remove node'), () => {
			assert(R.keys(newGraph.nodes).length === 0);
		});

		it(common.f3('should remove edges to / from node'), () => {
			assert(R.keys(newGraph.edges).length === 1);
		});

		it(common.f3('should remove node from groups'), () => {
			const groups = R.values(newGraph.groups);
			assert(groups[0].nodeIds.length === 0);
		});
	});

	describe(common.f2('removeGroup()'), () => {
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
		it(common.f3('should remove group'), () => {
			assert(R.keys(newGraph.groups).length === 0);
		});
		it(common.f3('should remove nodes'), () => {
			assert(R.keys(newGraph.nodes).length === 0);
		});

		it(common.f3('should leave nodes alone'), () => {
			const removeNodes = false;
			const newGraph = modelHelpers.removeGroup(graph, group.id, removeNodes);
			assert(R.keys(newGraph.nodes).length === 1);
		});
	});

	describe(common.f2('cloneNode()'), () => {
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

		it(common.f3('should create a new node'), () => {
			assert(newNodes.length === nodes.length + 1);
		});

		it(common.f3('should create a new edge'), () => {
			assert(newEdges.length === edges.length + 1);
		});

		const origNode = node1;
		const clonedNodeId = R.symmetricDifference(
			R.keys(newGraph.nodes),
			R.keys(graph.nodes)
		)[0];

		it(common.f3('should give cloned node a new id'), () => {
			assert(!!clonedNodeId);
		});

		const clonedNode = newGraph.nodes[clonedNodeId];
		const clonedNodeEdges = modelHelpers.getNodeEdges(clonedNode, newGraph.edges);
		const clonedEdge = clonedNodeEdges[0];

		it(common.f3('cloned node should have original edges'), () => {
			assert(clonedEdge.from === clonedNode.id);
			assert(clonedEdge.to === node2.id);
		});

		it(common.f3('cloned node should be in original group'), () => {
			const group = R.values(newGraph.groups)[0];
			assert( R.contains(clonedNode.id, group.nodeIds) );
		});
	});

	describe(common.f2('cloneGroup()'), () => {
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

		it(common.f3('should create a new group'), () => {
			assert(!!clonedGroupId);
			assert(newGroups.length === 2);
		});

		it(common.f3('should give cloned group a new id'), () => {
			assert(clonedGroupId !== groupId);
		});

		it(common.f3('original group and cloned group should contain the same number of nodes'), () => {
			assert(newGroups[0].nodeIds.length === newGroups[1].nodeIds.length);
		});

		it(common.f3('should give cloned nodes a new id'), () => {
			newGroups[1].nodeIds
				.forEach((nodeId) => {
					assert(!R.contains(nodeId, newGroups[0].nodeIds));
				});
		});

		it(common.f3('all nodes should exist afterwards'), () => {
			assert(newNodes.length === 6);
		});

		it(common.f3('all original nodes should be in original group'), () => {
			const origGroup = newGraph.groups[groupId];
			const origNodeIds = origGroup.nodeIds;
			const origNodes = nodes;
			assert(origGroup.nodeIds.length === 3);
			assert(R.contains(origNodes[0].id, origNodeIds));
			assert(R.contains(origNodes[1].id, origNodeIds));
			assert(R.contains(origNodes[2].id, origNodeIds));
		});

		it(common.f3('all new nodes should be in new group'), () => {
			assert(clonedGroup.nodeIds.length === 3);
		});

		it(common.f3('edges should stay intact, and be cloned as well'), () => {
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

		it(common.f3('should clone only one group'), () => {
			const newNewGraph = modelHelpers.cloneGroup(newGraph, clonedGroupId);
			assert(R.values(newNewGraph.groups).length === 3);
		});
	});

	describe(common.f2('updateComponentProperties()'), () => {
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

		it(common.f3('should work with nodes'), () => {
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

		it(common.f3('should work with edges'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				graph,
				'edge',
				'edge-1',
				{ from: 'node-3', to: 'node-4' }
			);
			assert(updatedGraph.edges['edge-1'].from === 'node-3');
			assert(updatedGraph.edges['edge-1'].to === 'node-4');
		});

		it(common.f3('should work with groups'), () => {
			const updatedGraph = modelHelpers.updateComponentProperties(
				graph,
				'group',
				'group-2',
				{ nodeIds: ['node-3', 'node-4'] }
			);
			assert(updatedGraph.groups['group-2'].nodeIds.length === 2);
		});
	});

	describe(common.f2('layoutGraphByType()'), () => {
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

		it(common.f3('should be immutable'), () => {
			assert(graph !== newGraph);
		});

		const groups = R.values(newGraph.groups);

		it(common.f3('should group the nodes'), () => {
			assert(groups.length === 3);
		});

		// TODO: more
	});

	describe(common.f2('graphFromModel()'), () => {
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

		const { graph } = modelHelpers.graphFromModel(model);
		const edges = R.values(graph.edges);
		const nodes = R.values(graph.nodes);
		// const predicates = R.values(graph.predicates);
		const policies = R.values(graph.policies);
		// const processes = R.values(graph.processes);

		it(common.f3('should produce hash-maps, not arrays'), () => {
			assert(!_.isArray(graph.edges));
			assert(!_.isArray(graph.nodes));
			assert(!_.isArray(graph.groups));
		});

		it(common.f3('should create edges'), () => {
			assert(edges[0].from === 'source');
			assert(edges[0].to === 'target');
		});

		it(common.f3('should turn predicates into edges'), () => {
			assert(edges.length === 2);
			assert(edges[1].from === 'val1');
			assert(edges[1].to === 'val2');
			assert(edges[1].relation === 'predicate');
		});

		it(common.f3('should create locations'), () => {
			assert(nodes.length === 1);
			assert(nodes[0].id === 'location');
		});

		it(common.f3('should contain policies, etc.'), () => {
			assert(policies.length === 1);
		});
	});

	describe(common.f2('modelFromGraph()'), () => {
		const nodes = [
			{
				id: 'node-1',
				modelComponentType: 'item',
			},
			{
				id: 'node-2',
				modelComponentType: 'data',
				value: 'value',
			},
		];
		const edges = [
			{ id: 'edge-1', relation: constants.RELTYPE_PHYSICAL_CONNECTION, from: 'a1', to: 'b1' },
			{ id: 'edge-2', relation: constants.RELTYPE_PHYSICAL_CONNECTION, from: 'a2', to: 'b2' },
			{ id: 'edge-3', relation: constants.RELTYPE_NETWORK, from: 'a3', to: 'b3' },
			{
				id: 'edge-5',
				relation: 'predicate',
				from: 'a5',
				to: 'b5'
			},
			{
				id: 'edge-4',
				relation: constants.RELTYPE_ATLOCATION,
				from: 'node-1',
				to: 'node-2'
			},
			{
				id: 'edge-6',
				relation: constants.RELTYPE_ATLOCATION,
				from: 'node-2',
				to: 'node-98'
			},
			{
				id: 'edge-7',
				relation: constants.RELTYPE_ATLOCATION,
				from: 'node-2',
				to: 'node-99'
			},
		];
		const graph = {
			nodes: helpers.toHashMap('id', nodes),
			edges: helpers.toHashMap('id', edges),
			// TODO: groups
		};
		const metadata = {
			title: 'test-model',
			'version': '0.2.1',
		};
		const state = {
			interface: {
				attackerGoal: '1234'
			}
		};
		const model = modelHelpers.modelFromGraph(graph, metadata, state);
		const system = model.system;

		it(common.f3('should include metadata'), () => {
			assert(system.title === metadata.title);
			assert(system.version === metadata.version);
		});

		it(common.f3('should include anm_data'), () => {
			assert(!_.isEmpty(system.anm_data));
			const anmData = JSON.parse(system.anm_data);
			assert(anmData.interface.attackerGoal === state.interface.attackerGoal);
		});

		it(common.f3('should create elements'), () => {
			assert(system.items.length === 1);
			assert(system.data.length === 1);
		});

		it(common.f3('should turn some edges into model edges, and others into predicates'), () => {
			assert(system.predicates.length === 1);
			assert(system.edges.length === 3);

			assert(!system.edges[0].kind);
			assert(system.edges[0].source === 'a1');
			assert(system.edges[0].target === 'b1');

			assert(system.edges[1].source === 'a2');
			assert(system.edges[1].target === 'b2');

			assert(system.edges[2].source === 'a3');
			assert(system.edges[2].target === 'b3');
		});

		it(common.f3('should convert `atLocation` type edges to `atLocations`'), () => {
			const itemAtLocations = system.items[0].atLocations;
			assert(itemAtLocations.length === 1);
			assert(R.contains('node-2', itemAtLocations));

			const dataAtLocations = system.data[0].atLocations;
			assert(dataAtLocations.length === 2);
			assert(R.contains('node-98', dataAtLocations));
			assert(R.contains('node-99', dataAtLocations));
		});

		it(common.f3('should set edge directedness'), () => {
			system.edges
				.forEach((edge) => {
					assert(edge.directed !== undefined);
				});
		});

		// TODO: more
	});


	describe(common.f2('humanizeModelIds()'), () => {
		const graph = {
			nodes: {
				'id': {
					modelComponentType: 'node',
					id: 'id',
					label: 'label',
					was: 'id',
				},

				'id-dup': {
					modelComponentType: 'node',
					id: 'id-dup',
					label: 'label',
					was: 'id-dup',
				},
			},

			policies: {
				'policy1': {
					modelComponentType: 'policy',
					id: 'policy1',
					label: 'label',
					was: 'policy1',
					// —————
					'atLocations': [
						'id'
					],
					'credentials': {
						'credPredicate': [
							{
								'name': 'is-user-id-at',
								'value': 'id',
								'variable': 'X'
							},
							{
								'name': 'is-password-of',
								'variable': ['X', 'Y']
							}
						]
					},
					'enabled': {
						'out': {
							'loc': 'id',
							'tuple': {
								'value': 'get',
								'wildcard': ['', '']
							},
							'variable': ['X', 'Y']
						}
					},
				},
			},

			edges: {
				'edge1': {
					modelComponentType: 'edge',
					id: 'edge1',
					label: 'label',
					was: 'edge1',
					from: 'id',
					to: 'id-dup',
				},
			},

			groups: {
				'group1': {
					modelComponentType: 'group',
					id: 'group1',
					label: 'label',
					was: 'group1',
					nodeIds: ['id', 'id-dup']
				},
			},
		};
		const { newGraph/*, idReplacementMap*/ } = modelHelpers.humanizeModelIds(graph);


		it(common.f3('should rename node ids'), () => {
			assert(
				newGraph.nodes['node__label']
				&& newGraph.nodes['node__label'].was === 'id'
			);
		});

		it(common.f3('should rename ids in edges'), () => {
			assert(newGraph.edges['edge1'].from === 'node__label');
			assert(newGraph.edges['edge1'].to === 'node__label-2');
		});

		it(common.f3('should rename ids in groups'), () => {
			assert(R.equals(newGraph.groups['group1'].nodeIds, ['node__label', 'node__label-2']));
		});

		// TODO: revisit this for processes
		// predicates are covered by edges

		it(common.f3('should rename ids in policies'), () => {
			const p = newGraph.policies['policy1'];
			assert(p.atLocations[0] === 'node__label');
			assert(p.credentials.credPredicate[0].name === 'is-user-id-at');
			assert(p.credentials.credPredicate[0].value === 'node__label');
			assert(p.enabled.out.loc === 'node__label');
		});

		// it(common.f3('should rename ids in processes'), () => {
		// 	assert(false);
		// });

		it(common.f3('should make sure new labels remain unique'), () => {
			assert(newGraph.nodes['node__label-2'].was === 'id-dup');
		});
	});
});


// ——————
describe(common.f1('model-helpers.js'), () => {
	describe(common.f2('predicates library'), () => {
		const testFilePath = path.join('test', 'data', 'predicates-import.xml');
		const xmlStr = fs.readFileSync(testFilePath).toString();
		modelHelpers.xmlModelToGraph(xmlStr, (err, result) => {
			const { predicates } = result;

			it(common.f3('should get all pred. types from model'), () => {
				assert(predicates.length === 2);
			});

			it(common.f3('should create a label'), () => {
				const predicatesMap = helpers.toHashMap('id', predicates);
				assert(predicatesMap['has-values'].label === 'has values');
				assert(predicatesMap['is-empty'].label === 'is empty');
			});
		});
	});
});
