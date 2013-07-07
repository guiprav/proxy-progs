'use strict';

// this module is untested
// it will be removed once I find a better way to handle topic setup exceptions

module.exports = function safe_topic_setup (fn)
{
	try
	{
		var topic = fn();

		if (topic !== undefined)
		{
			this.callback(null, topic);
		}
	}
	catch (e)
	{
		this.callback(e);
	}
};
