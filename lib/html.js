
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('./utils')
  , mu = require('mu2')
  , util = require('util');

/**
 * Expose `Html`.
 */

exports = module.exports = Html;

/**
 * Initialize a new `Html` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function Html(runner) {
	Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , indents = 2;

  var oldLog = console.log.bind(console);
	var result = "";
  console.log = function() {
  	result += util.format.call(util, [].slice.call(arguments));
	};

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('end', function() {
  	var model = {
			passes : stats.passes,
			tests: stats.tests,
		  failed : stats.failures,
		  failures : [],
			results : result
		};
		for (var i = 0; i < this.failures.length; i++) {
			model.failures.push({
				index : i,
				test : utils.escape(this.failures[i].title)
			});
		}

		oldLog(mu.compileAndRender('template.mustache', model));

		
	});

  runner.on('suite', function(suite){
    if (suite.root) return;
    ++indents;
    console.log('%s<section class="suite">', indent());
    ++indents;
    console.log('%s<h1>%s</h1>', indent(), utils.escape(suite.title));
    console.log('%s<dl>', indent());
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    console.log('%s</dl>', indent());
    --indents;
    console.log('%s</section>', indent());
    --indents;
  });

  runner.on('pass', function(test){
    console.log('%s  <dt>%s</dt>', indent(), utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);
  });
  runner.on('fail', function(test){
    console.log('%s  <dt class="fail"><a name="error_%s">%s</a></dt>', indent(), stats.failures - 1, utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);
  });
}
