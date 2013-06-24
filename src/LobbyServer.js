var WS = require('ws');

module.exports = function LobbyServer ()
{
	this.socket = new WS.Server();

	this.socket.on
	(
		'connection', function (client_socket)
		{
			client_socket.once
			(
				'message', function (message)
				{
				}
			);
		}
	);
};
