const gulpStringSrc = require('gulp-string-src');
const nodeHttpsRequest = require('node-https-request');
const stream = require('stream');

class HttpRequestTransform extends stream.Transform {
	constructor(options, httpsOptions, payload) {
		super(options);
		this.httpsOptions = httpsOptions;
		this.payload = payload;
	}

	_transform(file, encoding, callback) {
		const httpsOptions = typeof this.httpsOptions === 'function' ? this.httpsOptions(file) : this.httpsOptions;
		const payload = typeof this.payload === 'function' ? this.payload(file) : this.payload;

		nodeHttpsRequest(httpsOptions, payload).then(({ data }) => {
			file.contents = Buffer.from(data, 'utf-8');
			this.push(file);
			callback();
		});
	}
}

/**
 * Transforms a stream from the HTTPS request data.
 * @param {(Object|Function)} httpsOptions
 * @param {(String|Function)} [payload]
 * @returns {Vinyl}
 */
function plugin(httpsOptions, payload) {
	return new HttpRequestTransform({ objectMode: true }, httpsOptions, payload);
}

/**
 * Starts a stream from the HTTPS request data.
 * @param {string} fileName
 * @param {(Object|Function)} httpsOptions
 * @param {(String|Function)} [payload]
 * @returns {Vinyl}
 */
function pluginSrc(fileName, httpsOptions, payload) {
	return gulpStringSrc(fileName).pipe(plugin(httpsOptions, payload));
}

module.exports = {
	plugin,
	pluginSrc
};
