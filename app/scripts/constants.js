const constants = {
	GRAPH: 'graph',
	INTERFACE: 'interface',

	MODEL_LIBRARY: 'model-library',
	MODEL_PREDICATES_LIBRARY: 'predicate-lib.json',

	// dnd drop targets
	DND_TARGET_MAP: 'model-map',
	DND_TARGET_DEBUG: 'debug-view',
	// dnd drag sources
	DND_SOURCE_NODE: 'node',
	DND_SOURCE_FRAGMENT: 'fragment',

	// ——— action types ————
	ACTION_getRecentFiles: 'ACTION_getRecentFiles',
	ACTION_initMap: 'ACTION_initMap',
	ACTION_createNewMap: 'ACTION_createNewMap',
	ACTION_resetMap: 'ACTION_resetMap',
	ACTION_deleteModel: 'ACTION_deleteModel',
	ACTION_setEditorElem: 'ACTION_setEditorElem',
	ACTION_select: 'ACTION_select',
	ACTION_showContextMenu: 'ACTION_showContextMenu',
	ACTION_hideContextMenu: 'ACTION_hideContextMenu',
	ACTION_setShowGroups: 'ACTION_setShowGroups',
	ACTION_setShowImages: 'ACTION_setShowImages',
	ACTION_setShowEdges: 'ACTION_setShowEdges',
	ACTION_removeGroupBackgroundImage: 'ACTION_removeGroupBackgroundImage',
	ACTION_addGroupBackgroundImage: 'ACTION_addGroupBackgroundImage',
	ACTION_resizeGroupBackgroundImage: 'ACTION_resizeGroupBackgroundImage',
	ACTION_moveGroupBackgroundImage: 'ACTION_moveGroupBackgroundImage',
	ACTION_backgroundImageToNodes: 'ACTION_backgroundImageToNodes',
	ACTION_setTransformation: 'ACTION_setTransformation',
	ACTION_setPreviewEdge: 'ACTION_setPreviewEdge',
	ACTION_setDrag: 'ACTION_setDrag',
	ACTION_setDragNode: 'ACTION_setDragNode',
	ACTION_setHoverNode: 'ACTION_setHoverNode',
	ACTION_setHoverGroup: 'ACTION_setHoverGroup',
	// ACTION_addNode: 'ACTION_addNode',
	ACTION_addNodeToGroup: 'ACTION_addNodeToGroup',
	ACTION_cloneNode: 'ACTION_cloneNode',
	ACTION_removeNode: 'ACTION_removeNode',
	ACTION_moveNode: 'ACTION_moveNode',
	ACTION_ungroupNode: 'ACTION_ungroupNode',
	ACTION_addGroup: 'ACTION_addGroup',
	ACTION_moveGroup: 'ACTION_moveGroup',
	ACTION_cloneGroup: 'ACTION_cloneGroup',
	ACTION_removeGroup: 'ACTION_removeGroup',
	ACTION_setSpacePressed: 'ACTION_setSpacePressed',
	ACTION_setMouseOverEditor: 'ACTION_setMouseOverEditor',
	ACTION_setPanning: 'ACTION_setPanning',
	ACTION_setPannable: 'ACTION_setPannable',
	ACTION_selectWizardStep: 'ACTION_selectWizardStep',
	ACTION_importFragment: 'ACTION_importFragment',
	ACTION_mergeFragment: 'ACTION_mergeFragment',
	ACTION_downloadModelXML: 'ACTION_downloadModelXML',
	ACTION_downloadZippedScenario: 'ACTION_downloadZippedScenario',
	ACTION_loadModelFile: 'ACTION_loadModelFile',
	ACTION_loadXML: 'ACTION_loadXML',
	// ACTION_updateModel: 'ACTION_updateModel',
	ACTION_addEdge: 'ACTION_addEdge',
	ACTION_removeEdge: 'ACTION_removeEdge',
	ACTION_updateComponentProperties: 'ACTION_updateComponentProperties',
	ACTION_addProcess: 'ACTION_addProcess',
	ACTION_addPolicy: 'ACTION_addPolicy',
	ACTION_addPredicate: 'ACTION_addPredicate',
	ACTION_predicateChanged: 'ACTION_predicateChanged',
	ACTION_attackerProfileChanged: 'ACTION_attackerProfileChanged',
	ACTION_setAttackerActor: 'ACTION_setAttackerActor',
	ACTION_setAttackerGoal: 'ACTION_setAttackerGoal',
	ACTION_setAttackerProfit: 'ACTION_setAttackerProfit',
	ACTION_runAnalysis: 'ACTION_runAnalysis',
	ACTION_humanizeModelIds: 'ACTION_humanizeModelIds',
	ACTION_humanizeModelIds_updateInterfaceState: 'ACTION_humanizeModelIds_updateInterfaceState',
	ACTION_setAnalysisRunning: 'ACTION_setAnalysisRunning',
	ACTION_setAnalysisResults: 'ACTION_setAnalysisResults',
	ACTION_setTaskStatusCategorized: 'ACTION_setTaskStatusCategorized',
	ACTION_setSelectedToolChain: 'ACTION_setSelectedToolChain',
	ACTION_loadToolChains: 'ACTION_loadToolChains',
	ACTION_loadToolChains_DONE: 'ACTION_loadToolChains_DONE',
	ACTION_loadAttackerProfiles: 'ACTION_loadAttackerProfiles',
	ACTION_loadAttackerProfiles_DONE: 'ACTION_loadAttackerProfiles_DONE',
	ACTION_loadComponentTypes: 'ACTION_loadComponentTypes',
	ACTION_loadComponentTypes_DONE: 'ACTION_loadComponentTypes_DONE',
	ACTION_loadModelPatterns: 'ACTION_loadModelPatterns',
	ACTION_loadModelPatterns_DONE: 'ACTION_loadModelPatterns_DONE',
	ACTION_loadRelationTypes: 'ACTION_loadRelationTypes',
	ACTION_loadRelationTypes_DONE: 'ACTION_loadRelationTypes_DONE',

	ACTION_showSaveDialog: 'ACTION_showSaveDialog',
	ACTION_enableLayer: 'ACTION_enableLayer',

	CLONE_OFFSET: 70,
};


module.exports = constants;
