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
	return gulpStringSrc('test-1.json')
		.pipe(gulpHttpsRequest.process({
			headers: { 'Accept': 'application/json' },
			host: process.env.BASE_HOST,
			method: 'GET',
			path: process.env.BASE_PATH
		}))
		.pipe(gulp.dest('dist'));
}

function test2() {
	return gulpHttpsRequest.src('test-2.json', {
		headers: { 'Accept': 'application/json' },
		host: process.env.BASE_HOST,
		method: 'POST',
		path: process.env.BASE_PATH
	}, { test: 'test' })
		.pipe(gulp.dest('dist'));
}

function test3() {
	return gulpStringSrc('test-3.json', { test: 'test' })
		.pipe(gulpHttpsRequest.process({
			headers: { 'Accept': 'application/json' },
			host: process.env.BASE_HOST,
			method: 'POST',
			path: process.env.BASE_PATH
		})) // TODO ADD PAYLOAD
		.pipe(gulp.dest('dist'));
}

function test4() {
	return gulpStringSrc('test-4.json', { test: 'test' })
		.pipe(gulpHttpsRequest.dest({
			headers: { 'Accept': 'application/json' },
			host: process.env.BASE_HOST,
			method: 'POST',
			path: process.env.BASE_PATH
		}))
		.pipe(gulp.dest('dist'));
}

const test = gulp.series(test1, test2, test3, test4);

module.exports = {
	test: gulp.series(clean, test)
};
