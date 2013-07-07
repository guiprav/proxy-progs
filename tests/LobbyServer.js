'use strict';

var assert = require('assert');
var vows = require('vows');
var s = require('sinon');

var LobbyServerTopic = require('./LobbyServer/LobbyServerTopic');
var safe_topic_setup = require('./common/safe_topic_setup');

vows.describe('A LobbyServer').addBatch
(
	{
		'during bootstrap':
		{
			topic: function ()
			{
				safe_topic_setup.call
				(
					this, function ()
					{
						var topic = new LobbyServerTopic();
						topic.create_lobby();

						return topic;
					}
				);
			},

			'creates a new WebSocket server': function (topic)
			{
				var WS = topic.di.WS;

				s.assert.calledOnce(WS.Server);
				s.assert.calledWithNew(WS.Server);
			},

			'starts listening for connections': function (topic)
			{
				var lobby = topic.lobby;
				var on = topic.server_socket.on;

				s.assert.calledOnce(on);
				s.assert.calledWithExactly(on, 'connection', lobby.on_connect);
			}
		},

		'has a connection handler':
		{
			topic: function ()
			{
				safe_topic_setup.call
				(
					this, function ()
					{
						var topic = new LobbyServerTopic();
						topic.create_lobby();

						return topic;
					}
				);
			},

			'which is a function': function (topic)
			{
				assert(typeof topic.lobby.on_connect === 'function', 'on_connect must be a function');
			},

			'which handles a single client socket message': function (topic)
			{
				var lobby = topic.lobby;

				var on_message = s.stub(lobby, 'on_message');

				// test 'once' handler registration
				var once = s.stub();
				var client_socket = { once: once, close: function () {} };

				lobby.on_connect(client_socket);

				s.assert.calledOnce(once);
				s.assert.calledWithExactly(once, 'message', s.match.func);

				// test handler call to lobby.on_message
				var message = '{}';
				var handler = once.lastCall.args[1];

				handler(message);

				s.assert.calledOnce(on_message);

				// test handler call forwards right arguments
				s.assert.calledWithExactly(on_message, client_socket, message);

				on_message.restore();
			}
		},

		'has a message handler':
		{
			topic: function ()
			{
				safe_topic_setup.call
				(
					this, function ()
					{
						var topic = new LobbyServerTopic();
						topic.create_lobby();

						return topic;
					}
				);
			},

			'which is a function': function (topic)
			{
				assert(typeof topic.lobby.on_message === 'function', 'on_message must be a function');
			},

			'which handles "announce" commands': function (topic)
			{
				var lobby = topic.lobby;

				var on_announce_message = s.stub(lobby, 'on_announce_message');

				var client_socket = {};

				var message = JSON.stringify
				({
					command: 'announce',
					endpoint_id: 'test'
				});

				lobby.on_message(client_socket, message);

				s.assert.calledOnce(on_announce_message);

				s.assert.calledWithExactly
				(
					on_announce_message,

					client_socket,
					s.match({ endpoint_id: 'test' })
				);

				on_announce_message.restore();
			},

			'which handles "connect" commands': function (topic)
			{
				var lobby = topic.lobby;

				var on_connect_message = s.stub(lobby, 'on_connect_message');

				var client_socket = {};

				var message = JSON.stringify
				({
					command: 'connect',
					endpoint_id: 'test'
				});

				lobby.on_message(client_socket, message);

				s.assert.calledOnce(on_connect_message);

				s.assert.calledWithExactly
				(
					on_connect_message,

					client_socket,
					s.match({ endpoint_id: 'test' })
				);

				on_connect_message.restore();
			},

			'which disconnects clients that send unsupported commands': function (topic)
			{
				var lobby = topic.lobby;

				var close = s.stub();
				var client_socket = { close: close };

				lobby.on_message
				(
					client_socket, JSON.stringify
					({
						command: '*unsupported*'
					})
				);

				s.assert.calledOnce(close);
			}
		},

		'has announced endpoints':
		{
			topic: function ()
			{
				safe_topic_setup.call
				(
					this, function ()
					{
						var topic = new LobbyServerTopic();
						topic.create_lobby();

						return topic;
					}
				);
			},

			'created when clients announce': function (topic)
			{
				var lobby = topic.lobby;

				var message_a =
				{
					endpoint_id: 'test-a'
				};

				lobby.on_announce_message({}, message_a);

				var message_b =
				{
					endpoint_id: 'test-b'
				};

				lobby.on_announce_message({}, message_b);

				assert.isObject(lobby.endpoint('test-a'));
				assert.isObject(lobby.endpoint('test-b'));
			},

			'whose getter throws if the ID is not announced': function (topic)
			{
				assert.throws
				(
					function ()
					{
						topic.lobby.endpoint('*unannounced-id*');
					},

					ReferenceError
				);
			},

			'which cannot have duplicate IDs': function (topic)
			{
				var lobby = topic.lobby;

				var close = s.stub();
				var client_socket = { close: close };

				var message =
				{
					endpoint_id: 'test'
				};

				lobby.on_announce_message(client_socket, message);
				lobby.on_announce_message(client_socket, message);

				s.assert.calledOnce(close);

				s.assert.calledWithExactly
				(
					close, JSON.stringify
					({
						error: 'endpoint-already-announced'
					})
				);
			}
		}
	}
).export(module);
