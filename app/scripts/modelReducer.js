'use strict';

const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const trespass = require('trespass.js');
const helpers = require('./helpers.js');
const modelHelpers = require('./model-helpers.js');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const initialState = {
	metadata: {
		id: null,
	},

	graph: {
		nodes: {},
		edges: {},
		groups: {},
	},

	// other
	predicates: {},
	// ...
};


const modelFromGraph = _.debounce(
	modelHelpers.modelFromGraph,
	1000,
	{ leading: true, trailing: true }
);


module.exports =
function reducer(state=initialState, action) {
	const mergeWithState = R.partial(mergeWith, [state]);

	// once, in the other reducer, is enough
	// console.log(action);

	switch (action.type) {
		case constants.ACTION_initMap: {
			const {modelId} = action;

			// - clone initial state
			// - set model id
			const newState = _.merge(
				{},
				initialState,
				{
					metadata: {
						id: modelId
					}
				}
			);
			return newState;
		}

		case constants.ACTION_addGroupBackgroundImage: {
			const {groupId, dataURI, aspectRatio/*, width*/} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			group._bgImage = group._bgImage || {};
			group._bgImage.url = dataURI;
			group._bgImage.width = 550;
			group._bgImage.height = 550 / aspectRatio;

			return newState;
		}

		case constants.ACTION_resizeGroupBackgroundImage: {
			const {groupId, width, height} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			if (!group._bgImage) {
				return state;
			}

			const minSize = 100;
			group._bgImage.width = Math.max(width, minSize);
			group._bgImage.height = Math.max(height, minSize);

			return newState;
		}

		case constants.ACTION_moveGroupBackgroundImage: {
			const {groupId, groupCenterOffsetXY} = action;

			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);

			if (!group._bgImage) {
				return state;
			}

			group._bgImage.groupCenterOffsetX = groupCenterOffsetXY.x;
			group._bgImage.groupCenterOffsetY = groupCenterOffsetXY.y;

			return newState;
		}

		case constants.ACTION_removeGroupBackgroundImage: {
			const {groupId} = action;
			const newState = mergeWithState(state);
			let group = helpers.getItemById(newState.graph.groups, groupId);
			delete group._bgImage;
			return newState;
		}

		case constants.ACTION_importFragment: {
			const {fragment, xy} = action;
			const newGraph = modelHelpers.importFragment(
				state.graph,
				modelHelpers.duplicateFragment(fragment),
				xy
			);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_updateModel: {
			const model = modelFromGraph(state.graph);
			if (!model) { // debounced
				return state;
			}
			return mergeWithState({ model });
		}

		// case constants.ACTION_loadXML:
		// 	return state; // noop

		case constants.ACTION_loadXML_DONE: {
			const {graph, other, metadata} = action.result;
			return _.assign(
				{},
				initialState,
				{ graph, metadata },
				other
			);
		}

		case constants.ACTION_downloadAsXML: {
			const model = modelHelpers.modelFromGraph(state.graph);
			modelHelpers.downloadAsXML( // TODO: do this elsewhere
				model,
				`${model.system.title.replace(/\s/g, '-')}.xml`
			);
			return state;
		}

		// case constants.ACTION_addNode: {
		// 	const {node} = action;
		// 	let newState = _.merge({}, state);
		// 	newState.graph = modelHelpers.addNode(newState.graph, node);
		// 	return newState;
		// }

		case constants.ACTION_addNodeToGroup: {
			const {nodeId, groupId} = action;
			const newGraph = modelHelpers.addNodeToGroup(state.graph, nodeId, groupId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_cloneNode: {
			const {nodeId} = action;
			const newGraph = modelHelpers.cloneNode(state.graph, nodeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_removeNode: {
			const {nodeId} = action;
			const newGraph = modelHelpers.removeNode(state.graph, nodeId);
			return mergeWithState({ graph: newGraph });
		}

		case constants.ACTION_moveNode: {
			const {nodeId, xy} = action;

			// const node = state.graph.nodes[nodeId];
			// const newNode = udpate(node, { $merge: xy });
			// state.graph.nodes[nodeId] = newNode;
			// return state;

			return update(
				state,
				{ graph: { nodes: { [nodeId]: { $merge: xy } } } }
			);
		}

		case constants.ACTION_ungroupNode: {
			const {nodeId} = action;

			// TODO: do this in modelHelpers
			const groups = R.values(state.graph.groups);
			const updateGroups = groups
				.reduce((acc, group) => {
					if (R.contains(nodeId, group.nodeIds)) {
						const newNodeIds = R.without([nodeId], group.nodeIds);
						acc[group.id] = { nodeIds: { $set: newNodeIds } }
					}
					return acc;
				}, {});

			console.log(updateGroups);

			return update(
				state,
				{ graph: { groups: updateGroups } }
			);
		}

		case constants.ACTION_moveGroup: {
			const {groupId, posDelta} = action;

			const group = state.graph.groups[groupId];
			const updateNodes = group.nodeIds
				.reduce((acc, id) => {
					const node = state.graph.nodes[id];
					const coords = {
						x: node.x + posDelta.x,
						y: node.y + posDelta.y,
					}
					acc[id] = { $merge: coords };
					return acc;
				}, {});

			return update(
				state,
				{ graph: { nodes: updateNodes } }
			);
		}

		case constants.ACTION_addEdge: {
			// TODO: do this in modelHelpers

			const {edge} = action;

			if (edge.from === edge.to) {
				console.warn('edge.from and edge.to cannot be the same');
				return state;
			}

			const newState = mergeWithState(state);
			newState.graph.edges = [
				...newState.graph.edges,
				_.merge(edge, { id: helpers.makeId('edge') })
				// TODO: use modelHelpers.createEdge()
			]
			return newState;
		}

		case constants.ACTION_removeEdge: {
			const {edge} = action;
			// TODO: do this in modelHelpers
			const without = R.omit([edge.id], state.graph.edges);
			return update(
				state,
				{ graph: { edges: { $set: without } } }
			);
		}

		case constants.ACTION_addGroup: {
			// TODO: do this in modelHelpers

			const {group} = action;
			const newState = mergeWithState(state);
			newState.graph.groups = [
				...newState.graph.groups,
				_.merge(group, { // TODO: use modelHelpers.createGroup()
					id: helpers.makeId('group'),
					name: 'new group', // TODO: should be label
					nodeIds: []
				})
			];
			return newState;
		}

		case constants.ACTION_cloneGroup: {
			const {groupId} = action;
			const newState = mergeWithState(state);
			newState.graph = modelHelpers.cloneGroup(newState.graph, groupId);
			return newState;
		}

		case constants.ACTION_removeGroup: {
			const {groupId, removeNodes} = action;
			const graph = modelHelpers.removeGroup(
				state.graph,
				groupId,
				removeNodes
			);
			console.log(graph);
			return mergeWithState({	graph });
		}

		// TODO: fix this
		case constants.ACTION_updateComponentProperties: {
			const {componentId, graphComponentType, newProperties} = action;
			let newState = _.merge({}, state);
			newState.graph = modelHelpers.updateComponentProperties(
				newState.graph,
				graphComponentType,
				componentId,
				newProperties
			);
			return newState;
		}

		default: {
			return state;
		}
	}
};
