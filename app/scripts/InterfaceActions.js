'use strict';

var flummox = require('flummox');
var Actions = flummox.Actions;


module.exports =
class InterfaceActions extends Actions {

	setEditorElem(elem) {
		return {elem};
	}

	showContextMenu(event, context, menuItems) {
		return {event, context, menuItems};
	}
	hideContextMenu() {
		return {};
	}

	select(it, type) {
		if (!it) { return null; }
		return {it, type};
	}

	setShowImages(yesno) {
		return {yesno};
	}

	setShowEdges(yesno) {
		return {yesno};
	}

	setShowGroups(yesno) {
		return {yesno};
	}

	addGroupBackgroundImage(group, dataURI, aspectRatio, width) {
		return {group, dataURI, aspectRatio, width};
	}

	removeGroupBackgroundImage(group) {
		return {group};
	}

	resizeGroupBackgroundImage(group, width, height) {
		return {group, width, height};
	}

	backgroundImageToNodes(group) {
		return {group};
	}

	setTransformation(transformation) {
		return {transformation};
	}

	_autoLayout() {
		return {};
	}

	setPreviewEdge(edge) {
		return {edge};
	}

	setDrag(data) {
		return data;
	}

	setDragNode(node) {
		return {node};
	}

	setHoverNode(node) {
		return {node};
	}

	moveNode(node, newPos) {
		return {node, newPos};
	}

	moveGroup(group, posDelta) {
		return {group, posDelta};
	}

	moveImage(group, newPos) {
		return {group, newPos};
	}

};
