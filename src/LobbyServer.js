'use strict';

module.exports = function (di)
{
	di = di || {};

	// load dependencies
	var WS = (di.WS !== undefined)? di.WS : require('ws');
	var log = (di.log !== undefined)? di.log : console.log;

	function LobbyServer (port)
	{
		this.socket = new WS.Server({ port: port });
		this.socket.on('connection', this.on_connect.bind(this));

		this.endpoints = {};

		log('Listening on port ' + port + '.');
	};

	LobbyServer.prototype.endpoint = function (id)
	{
		if (this.endpoints[id] === undefined)
		{
			throw new ReferenceError('Endpoint not announced in lobby.');
		}

		return this.endpoints[id];
	};

	LobbyServer.prototype.on_connect = function (client_socket)
	{
		client_socket.once('message', this.on_message.bind(this, client_socket));
		client_socket.on('close', this.on_socket_close.bind(this, client_socket));

		log('Client connected.');
	};

	LobbyServer.prototype.on_message = function (client_socket, message)
	{
		message = JSON.parse(message);

		switch (message.command)
		{
			case 'announce':
				this.on_announce_message(client_socket, message);
				break;

			case 'connect':
				this.on_connect_message(client_socket, message);
				break;

			default:
				client_socket.close();
				break;
		}
	};

	LobbyServer.prototype.on_announce_message = function (client_socket, message)
	{
		var endpoint_id = message.endpoint_id;

		if (this.endpoints[endpoint_id] !== undefined)
		{
			client_socket.send
			(
				JSON.stringify
				({
					error: 'endpoint-already-announced'
				})
			);

			client_socket.close();

			log('Client tried to announce endpoint "' + endpoint_id + "', but it was already announced.");
			log('Client disconnected.');

			return;
		}

		this.endpoints[endpoint_id] = { socket: client_socket };

		log('Endpoint "' + endpoint_id + '" announced.');
	};

	LobbyServer.prototype.on_connect_message = function (client_socket, message)
	{
		var endpoint_id = message.endpoint_id;

		var endpoint = this.endpoint(endpoint_id);

		var connected_event_message = JSON.stringify
		({
			'event': 'connected'
		});

		endpoint.socket.send(connected_event_message);
		client_socket.send(connected_event_message);

		endpoint.socket.on
		(
			'message', function (message)
			{
				client_socket.send(message);
			}
		);

		client_socket.on
		(
			'message', function (message)
			{
				endpoint.socket.send(message);
			}
		);

		endpoint.socket.bound_to_peer = true;
		endpoint.socket.peer = client_socket;

		client_socket.bound_to_peer = true;
		client_socket.peer = endpoint.socket;

		delete this.endpoints[endpoint_id];

		log('Endpoint "' + endpoint_id + '" bound to a client.');
	};

	LobbyServer.prototype.on_socket_close = function (client_socket)
	{
	};

	return LobbyServer;
};
