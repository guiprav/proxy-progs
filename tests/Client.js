'use strict';

var assert = require('assert');
var vows = require('vows');
var s = require('sinon');

var Client = require('../src/Client');
var SocketStub = require('./common/SocketStub');

function make_topic ()
{
	return new Client();
}

vows.describe('A Client').addBatch
(
	{
		'during bootstrap':
		{
			topic: make_topic,

			'is not connected to any peer': function (t)
			{
				assert.isFalse(t.connected_to_peer, '`connected_to_peer` should be false.');
				assert.isNull(t.peer, '`peer` should be null.');
			},

			'has a socket object': function (t)
			{
				assert.isObject(t.socket);
				assert.isFunction(t.socket.on, '`socket` should have function "on".');
				assert.isFunction(t.socket.once, '`socket` should have function "once".');
				assert.isFunction(t.socket.send, '`socket` should have function "send".');
				assert.isFunction(t.socket.close, '`socket` should have function "close".');
			}
		},

		'is a state machine':
		{
			topic: make_topic,

			'starting on state "initial"': function (t)
			{
				assert.strictEqual(t.state, 'initial', '`state` should be "initial".');
			},

			'which can go to state "announced"': function (t)
			{
				t.goAnnounced();
				assert.strictEqual(t.state, 'announced', '`state` should be "announced".');

				// TODO: Assert goAnnounced is undefined now
				// TODO: Make each state its own context or batch
			}
		}
	}
).export(module);