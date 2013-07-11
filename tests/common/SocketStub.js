'use strict';

var s = require('sinon');
var nop = require('./nop');

function SocketStub ()
{
	this.stubs =
	{
		on: s.stub(this, 'on'),
		once: s.stub(this, 'once'),
		send: s.stub(this, 'send'),
		close: s.stub(this, 'close')
	};
};

SocketStub.prototype.on = nop();
SocketStub.prototype.once = nop();
SocketStub.prototype.send = nop();
SocketStub.prototype.close = nop();

module.exports = SocketStub;
