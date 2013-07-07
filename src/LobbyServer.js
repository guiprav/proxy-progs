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
	};

	LobbyServer.prototype.on_connect = function (client_socket)
	{
		client_socket.once('message', this.on_message);
	};

	LobbyServer.prototype.on_message = function (client_socket, message)
	{
		message = JSON.parse(message);

		switch (message.command)
		{
			case 'announce':
				this.on_announce_message();
				break;

			case 'connect':
				this.on_connect_message();
				break;

			default:
				client_socket.close();
				break;
		}
	};

	LobbyServer.prototype.on_announce_message = function ()
	{
	};

	LobbyServer.prototype.on_connect_message = function ()
	{
	};

	return LobbyServer;
};
