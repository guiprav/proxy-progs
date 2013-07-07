'use strict';

// this module lacks testing

module.exports = function require_inject_create (path, di)
{
	return new (require('../../' + path)(di))();
};
