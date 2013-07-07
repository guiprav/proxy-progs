'use strict';

// this module lacks testing

module.exports = function require_inject_create (path, di)
{
	var args = Array.prototype.concat.apply([], arguments);

	// remove require_inject_create arguments
	args.shift();
	args.shift();

	var Constructor = require('../../' + path)(di);

	// this is needed in order to forward arguments to the `new Constructor` call
	function ArgsForwarder ()
	{
		Constructor.apply(this, args);
	}

	ArgsForwarder.prototype = Constructor.prototype;

	return new ArgsForwarder();
};
