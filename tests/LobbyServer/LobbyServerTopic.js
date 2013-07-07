'use strict';

var util = require('util');
var s = require('sinon');
var Topic = require('../common/Topic');
var require_inject_create = require('../common/require_inject_create');

function LobbyServerTopic ()
{
	Topic.call(this);

	// basic stubbing of WS module
	this.server_socket =
	{
		on: s.stub()
	};

	this.di.WS =
	{
		Server: s.stub().returns(this.server_socket)
	};
}

util.inherits(LobbyServerTopic, Topic);

LobbyServerTopic.prototype.create_lobby = function ()
{
	this.lobby = require_inject_create('src/LobbyServer', this.di, 5555);
};

module.exports = LobbyServerTopic;
