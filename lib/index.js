/**
 * Module dependencies.
 */
var meow = require('meow');
var press = require('./press');

/**
 * Local libs
 */
var converter = require('./converter.js');

var cli = meow(
  `
	Usage
	  $ medium2gatsby <src_file_or_folder>

	Options
      --output, -o Destination folder for output files. Defaults to './'.
      --template, -t Template used to generate post files.
      --drafts, -d set flag to export drafts along with other posts. Default, false.
	  --help, -h Shows usage instructions

	Examples
	  $ medium2gatsby . -o posts -t template.js
      $ medium2gatsby 2018-04-02_Introducing-the-react-testing-library----e3a274307e65.html -o output -t template.js

`,
  {
    flags: {
      drafts: {
        type: 'boolean',
        alias: 'd',
        default: false
      },
      output: {
        type: 'string',
        alias: 'o',
      },
      template: {
        type: 'string',
        alias: 't',
      },
    },
  },
);
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

// show help if no args passed
if (cli.input.length < 1) {
  cli.showHelp();
}

var srcPath = cli.input[0];
var destPath = cli.flags.output;
var templatePath = cli.flags.template;
var export_drafts = cli.flags.drafts;

/* ====================================================================================== */
/* Execution starts from here                                                             */
/* ====================================================================================== */

press.print('=======================  💥 Welcome to Medium to md(x) converter 💥  =======================', true, true);

press.print('💡 Following context has been initialized:');
press.printItem(`⬇️ INPUT: ${srcPath}`, true);
press.printItem(`⬆️ OUTPUT (-o): ${destPath}`);
press.printItem(`💅 TEMPLATE (-t): ${templatePath}`);
press.printItem(`🚧 SHOULD EXPORT DRAFTS? (-d): ${export_drafts}`);

converter.convert(srcPath, destPath, templatePath, export_drafts);
// foo(cli.input[0], cli.flags);
