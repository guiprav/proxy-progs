'use strict';

var assert = require('assert');
var vows = require('vows');
var s = require('sinon');

var Client = require('../src/Client');
var SocketStub = require('./common/SocketStub');

vows.describe('A Client').addBatch
(
	{
		'is a state machine':
		{
			topic: function ()
			{
				return new Client(new SocketStub());
			},

			'starting on state "initial"': function (t)
			{
				assert.deepEqual(t.state, 'initial');
			}
		}
	}
).export(module);