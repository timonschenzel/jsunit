module.exports = class TestCase
{
	assertEquals(expected, value, message)
	{
		value = this.normalizeValue(value);

		// .is(value, expected, [message])
		test(this.visualError(), async t => {
			await t.deepEqual(value, expected, message);
		});
	}

	assertNotEquals(expected, value, message)
	{
		value = this.normalizeValue(value);

		// .not(value, expected, [message])
		test(this.visualError(), async t => {
			await t.not(value, expected, message);
		});
	}

	assertTrue(value, message)
	{
		value = this.normalizeValue(value);

		// .truthy(value, [message])
		test(this.visualError(), async t => {
			await t.truthy(value, message);
		});
	}

	assertFalse(value, message)
	{
		value = this.normalizeValue(value);

		// .falsy(value, [message])
		test(this.visualError(), async t => {
			await t.falsy(value, message);
		});
	}

	assertDeepEqual(expected, value, message)
	{
		value = this.normalizeValue(value);

		// .deepEqual(value, expected, [message])
		test(this.visualError(), async t => {
			await t.deepEqual(value, expected, message);
		});
	}

	assertNotDeepEqual(expected, value, message)
	{
		value = this.normalizeValue(value);

		// .notDeepEqual(value, expected, [message])
		test(this.visualError(), async t => {
			await t.notDeepEqual(value, expected, message);
		});
	}

	assertCount()
	{
		// ..
	}

	pass(message)
	{
		// .pass([message])
		test(this.visualError(), async t => {
			await t.pass(message);
		});
	}

	fail(message)
	{
		// .fail([message])
		test(this.visualError(), async t => {
			await t.fail(message);
		});
	}

	expectException(func, error, message)
	{
		// .throws(function|promise, [error, [message]])
		test(this.visualError(), async t => {
			await t.throws(func, error, message);
		});
	}

	notExpectException(func, error, message)
	{
		// .notThrows(function|promise, [message])
		test(this.visualError(), async t => {
			await t.notThrows(func, error, message);
		});
	}

	assertRegExp(regex, contents, message)
	{
		// .regex(contents, regex, [message])
		test(this.visualError(), async t => {
			await t.regex(contents, regex, message);
		});
	}

	assertNotRegExp(regex, contents, message)
	{
		// .notRegex(contents, regex, [message])
		test(this.visualError(), async t => {
			await t.notRegex(contents, regex, message);
		});
	}

	takeSnapshot(contents, message)
	{
		// .snapshot(contents, [message])
		test(this.visualError(), async t => {
			await t.snapshot(contents, message);
		});
	}

	normalizeValue(value)
	{
		if (typeof value == 'object' && value.hasOwnProperty('raw')) {
			return value.raw;
		}

		return value;
	}

	visualError(stack = null, name = null)
	{
		const codeExcerpt = require('code-excerpt');
		const equalLength = require('equal-length');
		const truncate = require('cli-truncate');
		const colors = require('ava/lib/colors');
		const indentString = require('indent-string');
		const formatLineNumber = (lineNumber, maxLineNumber) =>
			' '.repeat(Math.max(0, String(maxLineNumber).length - String(lineNumber).length)) + lineNumber;

		const maxWidth = 80;

		if (stack == null) {
			stack = traceback();
		}

		if (name == null) {
			name = this.name;
		}

		let fileName = stack.split("\n").filter(line => {
			return line.includes(name.split(' -> ')[1]);
		})[0];

		if (fileName) {
			fileName.trim();
		}

		let regExp = /\(([^)]+)\)/;
		let matches = regExp.exec(fileName);
		fileName = matches[1];
		let parts = fileName.split(':');
		parts.pop();

		fileName = parts.join(':');

		let rootFolder = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1) + '/';
		let relativeFileName = fileName.replace(rootFolder, '');
		let source = fileName.split(':');
		let lineNumber = source.pop();
		let sourceInput = {};
		sourceInput.file = source.join(':');
		sourceInput.line = parseInt(lineNumber);
		sourceInput.isDependency = false;
		sourceInput.isWithinProject = true;

		let contents = fs.readFileSync(sourceInput.file, 'utf8');
		const excerpt = codeExcerpt(contents, sourceInput.line, {maxWidth: process.stdout.columns, around: 1});

		if (!excerpt) {
			return null;
		}

		const file = sourceInput.file;
		const line = sourceInput.line;

		const lines = excerpt.map(item => ({
			line: item.line,
			value: truncate(item.value, maxWidth - String(line).length - 5)
		}));

		const joinedLines = lines.map(line => line.value).join('\n');
		const extendedLines = equalLength(joinedLines).split('\n');

		let errorContent = lines
			.map((item, index) => ({
				line: item.line,
				value: extendedLines[index]
			}))
			.map(item => {
				const isErrorSource = item.line === line;

				const lineNumber = formatLineNumber(item.line, line) + ':';
				const coloredLineNumber = isErrorSource ? lineNumber : chalk.dim(lineNumber);
				const result = `   ${coloredLineNumber} ${item.value}`;

				return isErrorSource ? chalk.bgRed(result) : result;
			})
			.join('\n');

		return name + ' on ' + sourceInput.file + ':' + sourceInput.line;

		// return this.name + '\n  ' + chalk.dim(relativeFileName) + '\n\n' + errorContent;
	}
}
