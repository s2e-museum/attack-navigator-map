'use strict';

var $ = require('jquery');
var R = require('ramda');
var Q = require('q');
const constants = require('./constants.js');


// var requests = {};
// function abortRequests(requests, key) {
// 	requests[key] = requests[key] || [];
// 	requests[key].forEach(function(req) { req.abort(); });
// 	requests[key].length = 0;
// }


function handleError(err) {
	if (err.statusText === 'abort') { return; }
	console.error(err.stack);
}

// ——————————


module.exports.setEditorElem =
function setEditorElem(elem) {
	return {
		type: constants.ACTION_setEditorElem,
		elem,
	};
};


module.exports.showContextMenu =
function showContextMenu(event, context, menuItems) {
	return {
		type: constants.ACTION_showContextMenu,
		contextMenu: {
			x: event.offsetX,
			y: event.offsetY,
			context,
			menuItems
		}
	};
};


module.exports.hideContextMenu =
function hideContextMenu(event, context, menuItems) {
	return {
		type: constants.ACTION_hideContextMenu,
		contextMenu: null
	};
};


module.exports.importModelFragment =
function importModelFragment(fragment, xy) {
	return {
		type: constants.ACTION_importModelFragment,
		fragment,
		xy
	};
};


module.exports.select =
function select(it, itsType) {
	return {
		type: constants.ACTION_select,
		selected: it,
		itsType // TODO: is this used?
	};
};


module.exports.setShowImages =
function setShowImages(yesno) {
	return {
		type: constants.ACTION_setShowImages,
		yesno
	};
};


module.exports.setShowGroups =
function setShowGroups(yesno) {
	return {
		type: constants.ACTION_setShowGroups,
		yesno
	};
};


module.exports.setShowEdges =
function setShowEdges(yesno) {
	return {
		type: constants.ACTION_setShowEdges,
		yesno
	};
};


module.exports.addGroupBackgroundImage =
function addGroupBackgroundImage(group, dataURI, aspectRatio, width) {
	return {
		type: constants.ACTION_addGroupBackgroundImage,
		group, dataURI, aspectRatio, width
	};
};


module.exports.setTransformation =
function setTransformation(transformation) {
	return {
		type: constants.ACTION_setTransformation,
		transformation
	};
};


module.exports.setPreviewEdge =
function setPreviewEdge(previewEdge) {
	return {
		type: constants.ACTION_setPreviewEdge,
		previewEdge
	};
};


module.exports.setDrag =
function setDrag(data) {
	return {
		type: constants.ACTION_setDrag,
		data
	};
};


module.exports.setDragNode =
function setDragNode(node) {
	return {
		type: constants.ACTION_setDragNode,
		node
	};
};


module.exports.setHoverNode =
function setHoverNode(node) {
	return {
		type: constants.ACTION_setHoverNode,
		node
	};
};


module.exports.setHoverGroup =
function setHoverGroup(group) {
	return {
		type: constants.ACTION_setHoverGroup,
		group
	};
};


module.exports.setSpacePressed =
function setSpacePressed(yesno) {
	return {
		type: constants.ACTION_setSpacePressed,
		yesno
	};
};


module.exports.setMouseOverEditor =
function setMouseOverEditor(yesno) {
	return {
		type: constants.ACTION_setMouseOverEditor,
		yesno
	};
};


module.exports.setPanning =
function setPanning(yesno) {
	return {
		type: constants.ACTION_setPanning,
		yesno
	};
};


module.exports.setPannable =
function setPannable(yesno) {
	return {
		type: constants.ACTION_setPannable,
		yesno
	};
};


module.exports.selectWizardStep =
function selectWizardStep(name) {
	return {
		type: constants.ACTION_selectWizardStep,
		name
	};
};


// ——————————
/*
module.exports.openDir =
function openDir(dirName) {
	return function(dispatch, getState) {
		Q().then(function() {
				const action = {
					type: constants.OPEN_DIR,
					selectedSubdir: dirName,
				};
				dispatch(action);
			})
			.catch(handleError);
	};
};
*/
