'use strict';

module.exports = function (di)
{
	di = di || {};

	// load dependencies
	var WS = (di.WS !== undefined)? di.WS : require('ws');

	function LobbyServer ()
	{
		this.socket = new WS.Server();
		this.socket.on('connection', this.on_connect.bind(this));

		this.endpoints = {};
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
		if (this.endpoints[message.endpoint_id] !== undefined)
		{
			client_socket.close
			(
				JSON.stringify
				({
					error: 'endpoint-already-announced'
				})
			);
		}

		this.endpoints[message.endpoint_id] = { socket: client_socket };
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

		delete this.endpoints[endpoint_id];
	};

	return LobbyServer;
};
