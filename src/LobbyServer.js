var WS = require('ws');

module.exports = function LobbyServer ()
{
	this.socket = new WS.Server();
};
