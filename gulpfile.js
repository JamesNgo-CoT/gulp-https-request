const { dest, series } = require('gulp');

const del = require('del');
const gulpStringSrc = require('gulp-string-src');

const gulpHttpsRequest = require('./index');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function clean() {
	return del('dist');
}

function test1() {
	return gulpStringSrc('test1.json')
		.pipe(gulpHttpsRequest.plugin({
			headers: { 'Accept': 'application/json' },
			host: 'httpbin.org',
			method: 'GET',
			path: '/get'
		}))
		.pipe(dest('dist'));
}

function test2() {
	return gulpHttpsRequest.pluginSrc('test2.json', {
		headers: { 'Accept': 'application/json' },
		host: 'httpbin.org',
		method: 'POST',
		path: '/post'
	}, {
		test: 'test'
	})
		.pipe(dest('dist'));
}

module.exports = {
	test1: series(clean, test1),
	test2: series(clean, test2)
};
