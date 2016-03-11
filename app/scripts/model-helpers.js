'use strict';

const update = require('react-addons-update');
const _ = require('lodash');
const R = require('ramda');
const properCase = require('mout/string/properCase');
const trespass = require('trespass.js');
const helpers = require('./helpers.js');
const constants = require('./constants.js');


const collectionNames =
module.exports.collectionNames =
trespass.model.collectionNames;

const collectionNamesSingular =
module.exports.collectionNamesSingular =
trespass.model.collectionNamesSingular;

const nonDirectedRelationTypes =
module.exports.nonDirectedRelationTypes =
['network', 'connects'];

const nonGraphCollectionNames =
module.exports.nonGraphCollectionNames =
['predicates', 'policies', 'processes'];

const graphComponentSingular =
module.exports.graphComponentSingular = {
	'nodes': 'node',
	'edges': 'edge',
	'groups': 'group',
};

const graphComponentPlural =
module.exports.graphComponentPlural =
R.invertObj(graphComponentSingular);

const origin = { x: 0, y: 0 };


const createFragment =
module.exports.createFragment =
function createFragment(data={}) {
	return _.defaults(
		data,
		{
			nodes: {},
			edges: {},
			groups: {},
		}
	);
}


const _duplicate =
module.exports._duplicate =
function _duplicate(it={}, defaults, keepId=false, itsType) {
	const id = (it.id && keepId === true)
		? it.id
		: helpers.makeId(itsType);
	return _.defaults(
		_.merge({}, it, { id }),
		defaults
	);
};


const duplicateNode =
module.exports.duplicateNode =
function duplicateNode(node={}, keepId=false) {
	const defaults = { x: 0, y: 0, };
	return _duplicate(node, defaults, keepId, 'node');
};


const duplicateEdge =
module.exports.duplicateEdge =
function duplicateEdge(edge={}, keepId=false) {
	const defaults = {};
	return _duplicate(edge, defaults, keepId, 'edge');
};


const duplicateGroup =
module.exports.duplicateGroup =
function duplicateGroup(group={}, keepId=false) {
	const defaults = {
		nodeIds: []
	};
	return _duplicate(group, defaults, keepId, 'group');
};


/*
deeply clones a fragment, and creates new ids for everything inside.
→ returns a new fragment
*/
const duplicateFragment =
module.exports.duplicateFragment =
function duplicateFragment(_fragment) {
	const fragment = _.merge({}, _fragment);

	const oldToNewNodeId = {};
	fragment.nodes = R.values(fragment.nodes || {})
		.reduce((acc, _node) => {
			const node = duplicateNode(_node);
			acc[node.id] = node;
			oldToNewNodeId[_node.id] = node.id;
			return acc;
		}, {});

	fragment.edges = R.values(fragment.edges || {})
		.reduce((acc, _edge) => {
			const edge = duplicateEdge(_edge);
			replaceIdInEdge(oldToNewNodeId, edge);
			acc[edge.id] = edge;
			return acc;
		}, {});

	fragment.groups = R.values(fragment.groups || {})
		.reduce((acc, _group) => {
			const group = duplicateGroup(_group);
			replaceIdInGroup(oldToNewNodeId, group);
			acc[group.id] = group;
			return acc;
		}, {});

	return fragment;
};


const nodeAsFragment =
module.exports.nodeAsFragment =
function nodeAsFragment(node) {
	return createFragment({
		nodes: helpers.toHashMap('id', [node])
	});
};


const nodeAsFragmentInclEdges =
module.exports.nodeAsFragmentInclEdges =
function nodeAsFragmentInclEdges(node, edges) {
	const nodeFragment = nodeAsFragment(node);
	const nodeEdges = getNodeEdges(node, edges)
	const edgesFragment = createFragment({
		edges: helpers.toHashMap('id', nodeEdges)
	});
	return combineFragments([nodeFragment, edgesFragment]);
};


const edgeAsFragment =
module.exports.edgeAsFragment =
function edgeAsFragment(edge) {
	return createFragment({
		edges: helpers.toHashMap('id', [edge])
	});
};


const edgeAsFragmentInclNodes =
module.exports.edgeAsFragmentInclNodes =
function edgeAsFragmentInclNodes(edge, nodes) {
	const edgeFragment = edgeAsFragment(edge);
	const {fromNode, toNode} = getEdgeNodes(edge, nodes);
	const nodesFragment = createFragment({
		nodes: helpers.toHashMap('id', [fromNode, toNode])
	});
	return combineFragments([edgeFragment, nodesFragment]);
};


const groupAsFragment =
module.exports.groupAsFragment =
function groupAsFragment(graph, group) {
	const nodes = getGroupNodes(group, graph.nodes);

	const edges = group.nodeIds
		.reduce((acc, nodeId) => {
			const node = graph.nodes[nodeId];
			const nodeEdges = getNodeEdges(node, graph.edges);
			return acc.concat(nodeEdges);
		}, []);

	return createFragment({
		nodes: helpers.toHashMap('id', nodes),
		edges: helpers.toHashMap('id', edges),
		groups: helpers.toHashMap('id', [group]),
	});
};


const replaceIdInGroup =
module.exports.replaceIdInGroup =
function replaceIdInGroup(mapping, group) {
	group.nodeIds = (group.nodeIds || [])
		.map((nodeId) => {
			return (mapping[nodeId] || nodeId);
		});
	return group;
};


const replaceIdInEdge =
module.exports.replaceIdInEdge =
function replaceIdInEdge(mapping, edge) {
	const oldIds = R.keys(mapping);
	if (R.contains(edge.from, oldIds)) {
		edge.from = mapping[edge.from];
	}
	if (R.contains(edge.to, oldIds)) {
		edge.to = mapping[edge.to];
	}
	return edge;
};


const combineFragments =
module.exports.combineFragments =
function combineFragments(fragments) {
	return fragments
		.reduce((acc, fragment) => {
			return update(
				acc,
				{
					nodes: { $merge: (fragment.nodes || {}) },
					edges: { $merge: (fragment.edges || {}) },
					groups: { $merge: (fragment.groups || {}) },
				}
			);
		}, createFragment());
};


const importFragment =
module.exports.importFragment =
function importFragment(graph, fragment, atXY=origin) {
	// TODO:
	R.keys(fragment)
		.forEach((key) => {
			const item = fragment[key];
			if (_.isArray(item)) {
				fragment[key] = helpers.toHashMap('id', item);
			}
		});

	function offsetNodes(nodes) {
		const xOffset = 60;
		const yOffset = 30;
		return R.values(nodes)
			.reduce((acc, node, index) => {
				const coords = {
					x: atXY.x + (node.x || index * xOffset),
					y: atXY.y + (node.y || index * yOffset),
				};
				acc[node.id] = update(node, { $merge: coords });
				return acc;
			}, {});
	}

	return combineFragments([
		graph,
		update(fragment, { nodes: { $apply: offsetNodes } })
	]);
};


const XMLModelToGraph = // TODO: test
module.exports.XMLModelToGraph =
function XMLModelToGraph(xmlStr, done) {
	trespass.model.parse(xmlStr, (err, model) => {
		if (err) { return done(err); }
		done(null, graphFromModel(model));
	});
};


const layoutGraphByType =
module.exports.layoutGraphByType =
function layoutGraphByType(_graph) {
	let graph = update(
		createFragment(),
		{ $merge: _graph }
	);

	let colCounter = 0;
	let rowCounter = 0;
	let lastGroupIndex = 0;
	const maxNodesPerCol = 7;
	let isShifted = true;
	const spacing = 100;
	let xOffset = spacing / 2;
	const yOffset = spacing / 2;
	let groupIndex = -1;

	// create groups for the different types
	collectionNames
		.forEach((collectionName) => {
			const selection = R.values(graph.nodes)
				.filter((node) => {
					return (node.modelComponentType === collectionNamesSingular[collectionName]);
				});

			if (!selection.length) {
				return;
			}

			const group = duplicateGroup({
				name: collectionName,
			});
			groupIndex++;

			selection.forEach((node) => {
				group.nodeIds.push(node.id);

				// basic auto-layout
				if (rowCounter > maxNodesPerCol || lastGroupIndex !== groupIndex) {
					if (lastGroupIndex !== groupIndex) {
						lastGroupIndex = groupIndex;
						isShifted = true;
						xOffset += spacing / 2;
					} else {
						isShifted = !isShifted;
					}

					rowCounter = 0;
					colCounter++;
				}
				node.label = node.id;
				node.modelComponentType = collectionNamesSingular[collectionName];
				node.x = xOffset + colCounter * spacing;
				node.y = yOffset + rowCounter * spacing + ((isShifted) ? 0 : 20);
				rowCounter++;
			});

			if (group.nodeIds.length) {
				const setGroup = { $set: group };
				graph = update(graph, { groups: { [group.id]: setGroup } });
			}
		});

	return graph;
};


const downloadAsXML =
module.exports.downloadAsXML =
function downloadAsXML(model, fileName='model.xml') {
	const xml = trespass.model.toXML(model);
	const blob = new Blob(
		[xml],
		{ type: 'text/plain;charset=utf-8' }
	);
	if (document) { // only in browser
		const saveAs = require('browser-saveas');
		saveAs(blob, fileName);
	}
	return blob;
};


const graphFromModel =
module.exports.graphFromModel =
function graphFromModel(model) {
	let graph = createFragment();

	// for each edge in model, create edge in graph
	graph.edges = model.system.edges
		.map((edge) => {
			return duplicateEdge({
				from: edge.source,
				to: edge.target,
				directed: edge.directed
			});
		});

	// set model component type
	const nonEdges = R.without(['edges'], collectionNames);
	nonEdges
		.forEach((collectionName) => {
			model.system[collectionName]
				.forEach((item) => {
					item.modelComponentType = collectionNamesSingular[collectionName];
				});
		});

	const nonGraphComponents = [...nonGraphCollectionNames, 'edges'];
	R.without(nonGraphComponents, collectionNames)
		.forEach((collectionName) => {
			// TODO: warn or s.th.
			const coll = (_.isArray(model.system[collectionName]))
				? helpers.toHashMap('id', model.system[collectionName])
				: model.system[collectionName];
			graph = update(graph, { nodes: { $merge: coll } });
		});

	const other = nonGraphCollectionNames
		.reduce((result, collectionName) => {
			result[collectionName] = model.system[collectionName];
			return result;
		}, {});

	// predicates
	other.predicates = other.predicates
		.reduce((result, predicate) => {
			predicate.value
				.forEach((value) => {
					result.push({ id: predicate.id, value });
				});
			return result;
		}, []);

	const metadata = R.pick(trespass.model.knownAttributes.system, model.system);

	return {graph, other, metadata};
};


const modelFromGraph =
module.exports.modelFromGraph =
function modelFromGraph(graph, metadata={}) {
	const model = trespass.model.create();

	// embed entire graph in model
	model.system.anm_data = JSON.stringify(graph);

	// include metadata
	model.system = _.merge(
		{},
		model.system,
		metadata
	);

	R.values(graph.edges || {})
		.forEach((edge) => {
			trespass.model.addEdge(model, {
				source: edge.from,
				target: edge.to,
				directed: edge.directed,
			});
		});

	const keysToOmit = [
		/*'name', */
		'label',
		'x',
		'y',
		'modelComponentType',
		'kbType'
	];
	R.values(graph.nodes || {})
		.forEach((node) => {
			const type = node.modelComponentType;
			const fnName = `add${properCase(type)}`;
			const addFn = trespass.model[fnName];
			if (!addFn) {
				console.warn(`${fnName}()`, 'not found');
			} else {
				addFn(model, R.omit(keysToOmit, node));
			}
		});

	return model;
};


const removeNode =
module.exports.removeNode =
function removeNode(graph, nodeId) {
	// remove node
	const node = graph.nodes[nodeId];
	const updateNodes = { nodes: { $set: R.omit([nodeId], graph.nodes) } };

	// and also all edges connected to it
	const nodeEdgesIds = getNodeEdges(node, graph.edges)
		.map(item => item.id);
	const updateEdges = { edges: { $set: R.omit(nodeEdgesIds, graph.edges) } };

	// remove from groups
	const nodeGroups = getNodeGroups(node, graph.groups);
	const updateGroupsNodeIds = nodeGroups
		.reduce((acc, group) => {
			acc[group.id] = { nodeIds: { $set: R.without([nodeId], group.nodeIds) } }
			return acc;
		}, {});
	const updateGroups = { groups: updateGroupsNodeIds };

	return update(
		graph,
		_.assign({}, updateNodes, updateEdges, updateGroups)
	);
};


const removeGroup =
module.exports.removeGroup =
function removeGroup(graph, groupId, removeNodes=false) {
	const group = graph.groups[groupId];

	const g = (!removeNodes)
		? graph
		: group.nodeIds
			.reduce((graph, nodeId) => {
				return removeNode(graph, nodeId);
			}, graph);

	const newGroups = R.omit([groupId], g.groups);
	return update(g, { groups: { $set: newGroups } });
};


const cloneNode =
module.exports.cloneNode =
function cloneNode(graph, origNodeId) {
	const origNode = graph.nodes[origNodeId];

	const fragment = duplicateFragment(
		nodeAsFragmentInclEdges(origNode, graph.edges)
	);
	const newNode = R.values(fragment.nodes)[0];

	// if node is in a group, so is the clone
	const nodeGroups = getNodeGroups(origNode, graph.groups);
	const g = nodeGroups
		.reduce((graph, group) => {
			const pushNewNode = { $push: [newNode.id] };
			return update(graph, { groups: { [group.id]: { nodeIds: pushNewNode } } });
		}, graph);

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// add fragment
	return importFragment(g, fragment, xy);
};


const cloneGroup =
module.exports.cloneGroup =
function cloneGroup(graph, groupId) {
	const origGroup = graph.groups[groupId];

	const fragment = duplicateFragment(
		groupAsFragment(graph, origGroup)
	);

	const xy = {
		x: constants.CLONE_OFFSET,
		y: constants.CLONE_OFFSET,
	};

	// add fragment; returns new graph
	return importFragment(graph, fragment, xy);
};


const addNodeToGroup =
module.exports.addNodeToGroup =
function addNodeToGroup(graph, nodeId, groupId) {
	const group = graph.groups[groupId];
	const newNodeIds = R.uniq([...group.nodeIds, nodeId]);
	return update(
		graph,
		{ groups: { [groupId]: { nodeIds: { $set: newNodeIds } } } }
	);
};


const getNodeGroups =
module.exports.getNodeGroups =
function getNodeGroups(node, groupsMap) {
	return R.values(groupsMap)
		.filter((group) => {
			return R.contains(node.id, group.nodeIds);
		});
};


const getNodeEdges =
module.exports.getNodeEdges =
function getNodeEdges(node, edgesMap) {
	return R.values(edgesMap)
		.filter((edge) => {
			return R.contains(node.id, [edge.from, edge.to]);
		});
};


const getEdgeNodes =
module.exports.getEdgeNodes =
function getEdgeNodes(edge, nodesMap) {
	const edgeNodes = {
		fromNode: nodesMap[edge.from],
		toNode: nodesMap[edge.to],
	};
	return edgeNodes;
};


const getGroupNodes =
module.exports.getGroupNodes =
function getGroupNodes(group, nodesMap) {
	return group.nodeIds
		.map(nodeId => nodesMap[nodeId]);
};


const inferEdgeType =
module.exports.inferEdgeType =
function inferEdgeType(fromType, toType) {
	if (fromType === 'location' && toType === 'location') {
		return 'connection';
		// TODO: or should it return all possible options, like
		// ['connection', 'isContainedIn']? (directed-ness could play a role)
	} else if (fromType === 'item' && toType === 'item') {
		return 'networkConnection';
	} else if (fromType === 'item' && toType === 'location') { // TODO: is that always the case?
		return 'atLocation';
	} else {
		return undefined;
	}
};


const updateComponentProperties =
module.exports.updateComponentProperties =
function updateComponentProperties(graph, graphComponentType, componentId, newProperties) {
	const collectionName = graphComponentPlural[graphComponentType];
	const item = graph[collectionName][componentId];
	const updatedItem = update(item, { $merge: newProperties });

	let g = graph;
	if (item.id !== updatedItem.id) {
		const withoutOldId = R.omit([item.id], graph[collectionName]);
		g = update(
			graph,
			{ [collectionName]: { $set: withoutOldId } }
		);
	}

	g = update(
		g,
		{ [collectionName]: { [updatedItem.id]: { $set: updatedItem } } }
	);

	return g;

	list = list.map((item) => {
		if (item.id === componentId) {
			if (graphComponentType === 'edge') {
				newProperties.directed = // TODO: should this be here, or should Edge know how to draw different relations
					(R.contains((newProperties.relation || item.relation), nonDirectedRelationTypes))
						? false
						: true;
			}
			return _.merge(item, newProperties);
		} else {
			return item;
		}
	});

	return graph;
};
