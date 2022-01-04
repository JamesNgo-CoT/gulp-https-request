const gulpStringSrc = require('gulp-string-src');
const nodeHttpsRequest = require('node-https-request');
const stream = require('stream');
const Vinyl = require('vinyl');

class HttpRequestTransform extends stream.Transform {
	constructor(options, httpsOptions, payload, fileContentsSetter) {
		super(options);
		this.httpsOptions = httpsOptions;
		this.payload = payload;
		this.fileContentsSetter = fileContentsSetter;
	}

	_transform(file, encoding, callback) {
		Promise.all([
			typeof this.httpsOptions === 'function' ? this.httpsOptions(file, encoding) : this.httpsOptions,
			typeof this.payload === 'function' ? this.payload(file, encoding) : this.payload
		]).then(([httpsOptions, payload]) => {
			return nodeHttpsRequest(httpsOptions, payload).then(({ data }) => {
				return Promise.resolve().then(() => {
					return this.fileContentsSetter(data, file, encoding);
				}).then((fileContents) => {
					if (file === fileContents) {
						// Do nothing.
					} else if (Vinyl.isVinyl(fileContents)) {
						file = fileContents;
					} else if (Buffer.isBuffer(fileContents)) {
						file.contents = fileContents;
					} else {
						file.contents = Buffer.from(JSON.stringify(fileContents), 'utf-8');
					}
					callback(null, file);
				});
			});
		}, (error) => {
			callback(error, file);
		});
	}
}

/**
 * Transforms a stream from the HTTPS request data.
 * @param {(Object|Function)} httpsOptions
 * @param {(String|Function)} [payload]
 * @param {Function} [fileContentsSetter]
 * @returns {Vinyl}
 */
function process(httpsOptions, payload, fileContentsSetter = (data) => data) {
	return new HttpRequestTransform({ objectMode: true }, httpsOptions, payload, fileContentsSetter);
}

/**
 * Starts a stream from the HTTPS request data.
 * @param {string} fileName
 * @param {(Object|Function)} httpsOptions
 * @param {(String|Function)} [payload]
 * @param {Function} [fileContentsSetter]
 * @returns {Vinyl}
 */
function src(fileName, httpsOptions, payload, fileContentsSetter) {
	return gulpStringSrc(fileName).pipe(process(httpsOptions, payload, fileContentsSetter));
}

/**
 * Starts a stream from the HTTPS request data.
 * @param {(Object|Function)} httpsOptions
 * @param {(String|Function)} [payload]
 * @param {Function} [fileContentsSetter]
 * @returns {Vinyl}
 */
function dest(
	httpsOptions,
	payload = (file, encoding) => file.contents.toString(encoding),
	fileContentsSetter = (data, file) => file
) {
	return new HttpRequestTransform({ objectMode: true }, httpsOptions, payload, fileContentsSetter);
}

module.exports = { process, src, dest };
