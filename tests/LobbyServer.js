var vows = require('vows');
var assert = require('assert');

var SuperMock = require('supermock').SuperMock;
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
			}
		}
	}
).export(module);
