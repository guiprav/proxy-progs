var vows = require('vows');
var assert = require('assert');

var SuperMock = require('supermock').SuperMock;
var Anything = SuperMock.Anything;

var patch = require('supermock').patch;

var WS = patch('ws');
WS.Server = new SuperMock({ mockName: 'WS.Server' });

var LobbyServer = require('../src/LobbyServer');

vows.describe('Lobby').addBatch
(
	{
		'A Lobby Server':
		{
			topic: new LobbyServer(),

			'should have a server socket': function (lobby)
			{
				assert.notEqual(lobby.socket, null);
				assert.equal(lobby.socket.getName(), 'WS.Server()');
			},

			'should handle incoming connections': function (lobby)
			{
				var socket_on = lobby.socket.on;

				assert.equal
				(
					socket_on.getCallsWith('connection', Anything).length, 1,
					'there should be exactly one connection handler'
				);
			},

			'should handle a single message command': function (lobby)
			{
				var event_registration_call = lobby.socket.on.getCallsWith('connection', Anything)[0];
				var event_handler = event_registration_call[1];

				var client_socket = new SuperMock({ mockName: 'client_socket' });
				event_handler(client_socket);

				var call_count = client_socket.once.getCallsWith('message', Anything).length;

				assert.equal
				(
					call_count, 1,
					'there should be exactly one message handler (got ' + call_count + ')'
				);
			}
		}
	}
).export(module);
