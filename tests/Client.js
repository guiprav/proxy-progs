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
				assert.deepEqual(t.connected_to_peer, false, '`connected_to_peer` should be false.');
				assert.deepEqual(t.peer, null, '`peer` should be null.');
			},

			'has a socket object': function (t)
			{
				assert.typeOf(t.socket, 'object');
				assert.typeOf(t.socket.on, 'function', '`socket` should have function "on".');
				assert.typeOf(t.socket.once, 'function', '`socket` should have function "once".');
				assert.typeOf(t.socket.send, 'function', '`socket` should have function "send".');
				assert.typeOf(t.socket.close, 'function', '`socket` should have function "close".');
			}
		},

		'is a state machine':
		{
			topic: make_topic,

			'starting on state "initial"': function (t)
			{
				assert.deepEqual(t.state, 'initial', '`state` should be "initial".');
			},

			'which can go to state "announced"': function (t)
			{
				t.goAnnounced();
				assert.deepEqual(t.state, 'announced', '`state` should be "announced".');

				// TODO: Assert goAnnounced is undefined now
				// TODO: Make each state its own context or batch
			}
		}
	}
).export(module);