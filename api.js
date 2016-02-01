'use strict';

var path = require('path');
var urljoin = require('url-join');
var constants = require('./app/scripts/constants.js');

var dataPath = './app/data';
var urlPrefix = '/api';
module.exports.serverDomain = 'localhost';
module.exports.serverPort = 4000;

module.exports.api = {
	'components': {
		url: urljoin(urlPrefix, 'components'),
		file: path.join(dataPath, constants.MODEL_COMPONENTS_LIBRARY),
	},
	'relations': {
		url: urljoin(urlPrefix, 'relations'),
		file: path.join(dataPath, constants.MODEL_RELATIONS_LIBRARY),
	},
	'patterns': {
		url: urljoin(urlPrefix, 'patterns'),
		file: path.join(dataPath, constants.MODEL_PATTERNS_LIBRARY),
	},
	'knowledgebase': {
		url: urljoin(urlPrefix, 'knowledgebase'),
		file: path.join(dataPath, constants.MODEL_KNOWLEDGEBASE),
	},

	// 'analysis-tools': {
	// 	url: urljoin(urlPrefix, 'analysis-tools'),
	// 	file: path.join(dataPath, constants.ANALYSIS_TOOLS),
	// },
};


module.exports.knowledgebase = {
	url: 'http://127.0.0.1:8080/tkb/'
};
