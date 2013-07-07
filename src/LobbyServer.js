'use strict';

module.exports = function (di)
{
	di = di || {};

	// load dependencies
	var WS = (di.WS !== undefined)? di.WS : require('ws');

	function LobbyServer ()
	{
		this.socket = new WS.Server();
		this.socket.on('connection', this.on_connect);

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

		this.endpoints[message.endpoint_id] = {};
	};

	LobbyServer.prototype.on_connect_message = function ()
	{
	};

	return LobbyServer;
};
