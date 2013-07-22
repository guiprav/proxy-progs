'use strict';

var assert = require('assert');
var vows = require('vows');
var s = require('sinon');

var Client = require('../src/Client');
var SocketStub = require('./common/SocketStub');

vows.describe('A Client').addBatch
(
	{
	}
).export(module);