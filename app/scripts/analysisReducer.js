const update = require('react-addons-update');
const R = require('ramda');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const initialState = {
	showAnalysisOverlay: false,
	analysisResults: null,
	resultsSelectedTool: undefined,
	resultsSelectedAttackIndex: undefined,
	resultsAttacktree: undefined,
	analysisSnapshots: [],
	subtreeCache: {},
	highlightNodeIds: [],
};


module.exports.reducer =
function reducer(state=initialState, action) {
	const mergeWithState = R.partial(mergeWith, [state]);

	switch (action.type) {
		case constants.ACTION_resetAnalysis:
			return initialState;

		// case constants.ACTION_runAnalysis: {
		// 	const { toolChainId } = action;
		// 	return state;
		// }

		case constants.ACTION_setAnalysisResults:
			return mergeWithState({
				analysisResults: action.analysisResults,
			});

		case constants.ACTION_showAnalysisOverlay: {
			return mergeWithState({
				showAnalysisOverlay: action.yesno
			});
		}

		case constants.ACTION_setTaskStatusCategorized:
			return mergeWithState({
				taskStatusCategorized: action.taskStatusCategorized,
			});

		case constants.ACTION_resultsSelectTool: {
			const { toolName } = action;
			return mergeWithState({
				resultsSelectedTool: toolName,
				resultsSelectedAttackIndex: undefined,
			});
		}

		case constants.ACTION_resultsSelectAttack: {
			const { index, attacktree } = action;
			return mergeWithState({
				resultsSelectedAttackIndex: index,
				resultsAttacktree: attacktree,
				highlightNodeIds: [],
			});
		}

		case constants.ACTION_highlightAttackTreeNodes: {
			const { nodeIds } = action;
			return mergeWithState({
				highlightNodeIds: nodeIds,
			});
		}

		case constants.ACTION_setAnalysisResultsSnapshots: {
			const { snapshots } = action;
			return mergeWithState({
				analysisSnapshots: snapshots,
			});
		}

		case constants.ACTION_cacheSubtree: {
			const { selectedTool, index, attacktree, nodeIds } = action;
			const newCache = Object.assign(
				{},
				state.subtreeCache
			);
			if (!newCache[selectedTool]) {
				newCache[selectedTool] = {};
			}
			newCache[selectedTool][index] = { attacktree, nodeIds };
			return update(
				state,
				{ subtreeCache: { $set: newCache } }
			);
		}

		default:
			return state;
	}
};
