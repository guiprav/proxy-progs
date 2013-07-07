'use strict';

var assert = require('assert');
var vows = require('vows');

var Topic = require('./common/Topic');

vows.describe('A Topic').addBatch
(
	{
		'during construction':
		{
			topic: new Topic(),

			'should create a "di" property object to hold injected dependencies': function (t)
			{
				assert.isObject(t.di);
			}
		}
	}
).export(module);
