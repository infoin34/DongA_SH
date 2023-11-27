const gulp = require('gulp');
const { src, dest, watch, lastRun, parallel, series } = require('gulp');
const pkg = require("./package.json");
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const sass = require('gulp-sass')(require('sass'));
const dartSass = require('gulp-dart-sass');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const pretty = require('gulp-pretty-html');
const removeEmptyLines = require('gulp-remove-empty-lines');
const newer = require('gulp-newer');
const copy = require('gulp-copy');
const ifElse = require('gulp-if-else');
const preprocess = require('gulp-preprocess');
const htmlreplace = require('gulp-html-replace');
const rename = require('gulp-rename');
//gulp-debug, gulp-uglify(js 압축), gulp-plumber()

const includePath = pkg.includePath;
const paths = pkg.paths;

process.env.NODE_ENV = 'development';

function set_dev_env(done) {
	process.env.NODE_ENV = 'development';
	done();
};

function set_prod_env(done) {
	process.env.NODE_ENV = 'production';
	done();
};

//시작
function serverInit(done) {
	browserSync.init({
		port: 9000,
		files: [paths.pc.css.output],
		server: { "baseDir": "./" },
		startPath: "./src/markup.html",
		browser: "chrome"
	});
	done();
}

function markupList(done) {
	return src('./src/markup.html')
		.pipe(htmlreplace({
			css: 'markup/markup.css',
			js: 'markup/markup.js'
		}))
		.pipe(rename('index.html'))
		.pipe(dest('./'))
	done();
}


// css 파일 클린
function css_pc_clean(done) {
	var url;
	if (process.env.NODE_ENV === "development") {
		url = paths.pc.css.output+'*.css'
	} else {
		url = paths.pc.css.dest+'*.css'
	}

	return src(url, {read: false})
		.pipe(clean());

	done();
};

// Compile SCSS
//   - path : 경로
//   - output : output 빌드 스타일(nested, expanded, compact, compressed)
//   - bool : sourcemap 추가 여부
/*
	sassGlob({ignorePaths: [
	'**\/_f1.scss',
	'recursive/*.scss',
	'import/**'

]}); 무시할 경로 배열 설정
*/
function css_compile(path, output, bool, done) { 
	return src(path.src + '/*.scss', { sourcemaps: bool, since: lastRun(css_compile) })
		// .pipe(plumber({
		// 	errorHandler: notify.onError('Error: <%= error.message %>')
		// }))		
		//.pipe(sassGlob())	
		.pipe(dartSass({
			outputStyle: 'compressed',
			includePaths: includePath
		}).on('error', sass.logError))				
		.pipe(autoprefixer()) // Autoprefixer 브라우져리스트 - https://github.com/ai/browserslist, package.json에 포함
		.pipe(
			ifElse( 
				(process.env.NODE_ENV === "development"),
				function() { return dest(path.output, { sourcemaps: true }) },
				function() { return dest(path.dest, {sourcemaps: false }) }
			)
		)
	done();
};

function css_pc_dev(done) {
	css_compile(paths.pc.css, 'compressed', false);
	done();
};
function css_pc_build(done) {
	css_compile(paths.pc.css, 'compressed', false);
	done();
};


// html파일 삭제
function html_pc_clean(done) {
	var url;
	if (process.env.NODE_ENV === "development") {
		url = paths.pc.html.output+'*'
	} else {
		url = paths.pc.html.dest+'*'
	}
	console.log(process.env.NODE_ENV, url);

	return src(url, {read: false}).pipe(clean());
	done();
};

// Compile html
//   - head, header, footer 등 모든 페이지에 공통적으로 들어가는 부분을 위한 컴파일
//   - path : 경로
function html_compile(path, done) {
	return src(path.src + "**/*.html", { since:lastRun(html_compile) })
		.pipe(fileinclude({
			prefix : '@@',
			basepath : '@file'
		}))
		.pipe(pretty({
			indent_size: 1,
			indent_char: "	",
			end_with_newlines: true
		}))
		.pipe(
			ifElse(
				(process.env.NODE_ENV === "development"),
				function() { return dest(path.output, { sourcemaps: true }) },
				function() { return dest(path.dest, { sourcemaps: false }) }
			)
		)

	done();
}
function html_newer_compile(path, done) {
	return src(path.src + "**/*.html", { since: lastRun(html_compile) })
		.pipe(newer(path.output))
		.pipe(fileinclude({
			prefix : '@@',
			basepath : '@file'
		}))
		.pipe(pretty({
			indent_size: 1,
			indent_char: "	",
			end_with_newlines: true
		}))
		// .pipe(removeEmptyLines())
		.pipe(dest(path.output));

	done();
}
function html_pc(done) {
	html_compile(paths.pc.html);

	done();
}

function html_newer_pc(done) {
	html_newer_compile(paths.pc.html);

	done();
}


// watch 감시
function watch_pc(done) {
	watch(paths.pc.css.src, css_pc_dev);
	watch(paths.pc.html.include, html_pc);
	watch(paths.pc.html.src, html_newer_pc);
	watch(paths.pc.js.src).on('change', browserSync.reload);
	watch(paths.pc.html.output).on('change', browserSync.reload);
	done();
}


// 리소스 카피
function filecopy(url, done) {
	return src(url.dest + "*", {read: false})
		.pipe(clean())
		.pipe(src(url.src + "**/*"))
		.pipe(dest(url.dest))
	done();
}
function filecopy_pc_images(done) {
	filecopy(paths.pc.images);
	done();
}
function filecopy_pc_js(done) {
	filecopy(paths.pc.js);
	done();
}
function filecopy_pc_css(done) {
	src(paths.pc.css.dest + "*", {read: false})
	.pipe(clean())
	.pipe(src([paths.pc.css.src2 + "/!(common)*.css", paths.pc.css.src2 + "/!(guide)*.css"]))
	.pipe(dest(paths.pc.css.dest));
	done();
}

function filecopy_pc_font(done) {
	//filecopy(paths.pc.font);
	done();
}


function sos(done) {
	console.log('--- 프로젝트 Gulp 명령어 ----')
	console.group()
		console.log('dev', ':  작업용 빌드 - watch, browserSync 포함');
		console.log('build', ': 배포용 빌드');
		console.group('기타 명령어')
		console.log('css_clean, css_dev, css_build, html_pc');
		console.groupEnd();
	console.groupEnd();
	console.log('----------------------------');

	done();
}


// 빌드 집합
exports.default = sos;
exports.sos = sos;

exports.set_dev_env = set_dev_env;
exports.set_prod_env = set_prod_env;

exports.dev = series(set_dev_env, html_pc_clean, parallel(css_pc_dev, html_pc), serverInit, watch_pc);
exports.html = html_pc;
exports.css_clean = css_pc_clean;
exports.css_dev = css_pc_dev;
exports.css_build = series(css_pc_build);
exports.build = series(set_prod_env, html_pc_clean, parallel(css_pc_dev, html_pc), markupList, filecopy_pc_images, filecopy_pc_css, filecopy_pc_js, filecopy_pc_font);






