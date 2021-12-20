const del = require('del');
const dotenv = require('dotenv');
const gulp = require('gulp');
const gulpStringSrc = require('gulp-string-src');

const gulpHttpsRequest = require('./index');

dotenv.config();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

function clean() {
	return del('dist');
}

function test1() {
	return gulpHttpsRequest.pluginSrc('test-2.json', {
		headers: { 'Accept': 'application/json' },
		host: process.env.BASE_HOST,
		method: 'POST',
		path: process.env.BASE_PATH
	}, { test: 'test' })
		.pipe(gulp.dest('dist'));
}

function test2() {
	return gulpStringSrc('test-1.json')
		.pipe(gulpHttpsRequest.plugin({
			headers: { 'Accept': 'application/json' },
			host: process.env.BASE_HOST,
			method: 'GET',
			path: process.env.BASE_PATH
		}))
		.pipe(gulp.dest('dist'));
}

const test = gulp.series(test1, test2);

module.exports = {
	test: gulp.series(clean, test)
};
