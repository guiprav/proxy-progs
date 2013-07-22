'use strict';

function Client ()
{
	this.state = 'initial';
	this.connected_to_peer = false;
	this.peer = null;
	this.socket = {};
}

module.exports = Client;
