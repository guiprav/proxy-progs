'use strict';

var SocketStub = require('./SocketStub');

function EndpointStub ()
{
	this.socket = new SocketStub();
}

module.exports = EndpointStub;
