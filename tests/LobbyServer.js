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

			'creates a new WebSocket server on the specified port': function (topic)
			{
				var WS = topic.di.WS;

				s.assert.calledOnce(WS.Server);
				s.assert.calledWithNew(WS.Server);
				s.assert.calledWithExactly(WS.Server, s.match({ port: 5555 }));
			},

			'starts listening for connections': function (topic)
			{
				var lobby = topic.lobby;
				var on = topic.server_socket.on;

				s.assert.calledOnce(on);
				s.assert.calledWithExactly(on, 'connection', s.match.func);

				// TODO: find a way to make sure the connection handler
				// calls lobby.on_connect
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

				var client_socket =
				{
					once: once,
					close: function () {}
				};

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

				var socket_a = {};
				var socket_b = {};

				lobby.on_announce_message(socket_a, { endpoint_id: 'test-a' });
				lobby.on_announce_message(socket_b, { endpoint_id: 'test-b' });

				var endpoint_a = lobby.endpoint('test-a');
				var endpoint_b = lobby.endpoint('test-b');

				assert.isObject(endpoint_a);
				assert.equal(endpoint_a.socket, socket_a);
				assert.isObject(endpoint_b);
				assert.equal(endpoint_b.socket, socket_b);
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

				lobby.on_announce_message({}, { endpoint_id: 'test' });
				lobby.on_announce_message(client_socket, { endpoint_id: 'test' });

				s.assert.calledOnce(close);

				s.assert.calledWithExactly
				(
					close, JSON.stringify
					({
						error: 'endpoint-already-announced'
					})
				);
			}
		},

		'has a connect command handler':
		{
			topic: function ()
			{
				safe_topic_setup.call
				(
					this, function ()
					{
						var topic = new LobbyServerTopic();
						topic.create_lobby();

						// mock an endpoint announcement
						topic.lobby.on_announce_message({}, { endpoint_id: 'prepared-1' });
						topic.lobby.on_announce_message({}, { endpoint_id: 'prepared-2' });
						topic.lobby.on_announce_message({}, { endpoint_id: 'prepared-3' });

						return topic;
					}
				);
			},

			'which connects clients to announced endpoints': function (topic)
			{
				var lobby = topic.lobby;

				var endpoint_id = 'prepared-1';

				var endpoint =
				{
					socket:
					{
						send: function () {},
						on: function () {}
					}
				};

				var endpoint_send = s.stub(endpoint.socket, 'send');

				var endpoint_getter = s.stub(lobby, 'endpoint').returns(endpoint);

				var client_socket =
				{
					send: function () {},
					on: function () {}
				};

				var client_send = s.stub(client_socket, 'send');

				lobby.on_connect_message(client_socket, { endpoint_id: endpoint_id });

				s.assert.calledOnce(endpoint_getter);
				s.assert.calledWithExactly(endpoint_getter, endpoint_id);

				s.assert.calledOnce(endpoint_send);

				s.assert.calledWithExactly
				(
					endpoint_send, JSON.stringify
					({
						'event': 'connected'
					})
				);

				s.assert.calledOnce(client_send);

				s.assert.calledWithExactly
				(
					client_send, JSON.stringify
					({
						'event': 'connected'
					})
				);

				endpoint_getter.restore();
			},

			'which sets up message relaying for connected endpoints': function (topic)
			{
				var lobby = topic.lobby;

				var endpoint =
				{
					socket:
					{
						send: function () {},
						on: function () {}
					}
				};

				var endpoint_socket_send = s.stub(endpoint.socket, 'send');
				var endpoint_socket_on = s.stub(endpoint.socket, 'on');

				var proper_endpoint_getter = lobby.endpoint;
				lobby.endpoint = function () { return endpoint; };

				var client_socket =
				{
					send: function () {},
					on: function () {}
				};

				var client_socket_send = s.stub(client_socket, 'send');
				var client_socket_on = s.stub(client_socket, 'on');

				lobby.on_connect_message(client_socket, { endpoint_id: 'prepared-2' });

				lobby.endpoint = proper_endpoint_getter;

				// reset spy state, we don't care about previous calls
				client_socket_send.reset();
				endpoint_socket_send.reset();

				function test_relaying (sending_peer_on, receiving_peer_send)
				{
					var message = 'What is this program? A miserable little pile of tests!';

					s.assert.calledOnce(sending_peer_on);
					s.assert.calledWithExactly(sending_peer_on, 'message', s.match.func);

					var on_message_handler = sending_peer_on.lastCall.args[1];

					on_message_handler(message);

					s.assert.calledOnce(receiving_peer_send);
					s.assert.calledWithExactly(receiving_peer_send, message);
				}

				// endpoint -> client
				test_relaying(endpoint_socket_on, client_socket_send);

				// client -> endpoint
				test_relaying(client_socket_on, endpoint_socket_send);
			},

			'which frees up connected endpoint IDs': function (topic)
			{
				var lobby = topic.lobby;

				var subject_endpoint_id = 'prepared-3';

				assert.doesNotThrow
				(
					function ()
					{
						lobby.endpoint(subject_endpoint_id);
					},

					ReferenceError,

					'Endpoint is not announced.'
				);

				var endpoint =
				{
					socket:
					{
						send: function () {},
						on: function () {}
					}
				};

				var endpoint_getter = s.stub(lobby, 'endpoint').returns(endpoint);

				var client_socket =
				{
					send: function () {},
					on: function () {}
				};

				lobby.on_connect_message(client_socket, { endpoint_id: subject_endpoint_id });

				endpoint_getter.restore();

				assert.throws
				(
					function ()
					{
						lobby.endpoint(subject_endpoint_id);
					},

					ReferenceError,

					'Endpoint is still announced.'
				);
			}
		}
	}
).export(module);
