
/**
 * Module dependencies.
 */

var Base = require('./base')
  , utils = require('./utils')
  , mustache = require('mustache')
  , fs = require('fs')
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

var template = mustache.compile(fs.readFileSync(__dirname + "/template.mustache").toString());

function Html(runner) {
	Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total
    , indents = 2
    , failures = this.failures;

	var result = "";

  function indent() {
    return Array(indents).join('  ');
  }

  runner.on('end', function() {
  	var model = {
			passes : stats.passes,
			tests: stats.tests,
		  failed : stats.failures,
		  failures : [],
			results : result,
			successPercentage : stats.passes/stats.tests * 100,
			failurePercentage : stats.failures/stats.tests * 100
		};
		for (var i = 0; i < failures.length; i++) {
			model.failures.push({
				index : i,
				test : utils.escape(failures[i].fullTitle())
			});
		}
		console.log(template(model));
	});

  runner.on('suite', function(suite){
    if (suite.root) return;
    ++indents;
    result += util.format('%s<section class="suite">', indent());
    ++indents;
    result += util.format('%s<h%d>%s</h%d>', indent(), indents, utils.escape(suite.title), indents);
    result += util.format('%s<dl>', indent());
  });

  runner.on('suite end', function(suite){
    if (suite.root) return;
    result += util.format('%s</dl>', indent());
    --indents;
    result += util.format('%s</section>', indent());
    --indents;
  });

  runner.on('pass', function(test){
    result += util.format('%s  <dt>%s</dt>', indent(), utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    result += util.format('%s  <dd><pre class="prettyprint"><code class="lang-javascript">%s</code></pre></dd>', indent(), code);
  });
  runner.on('fail', function(test){
    result += util.format('%s  <dt class="fail"><a name="error_%s">%s</a></dt>', indent(), stats.failures - 1, utils.escape(test.title));
    var code = utils.escape(utils.clean(test.fn.toString()));
    result += util.format('%s  <dd><pre class="prettyprint"><code class="lang-javascript">%s</code></pre></dd>', indent(), code);
  });
}
