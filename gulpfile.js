// based on generator-gulp-webapp 1.0.2

var gulp = require('gulp');
var path = require('path');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var wiredep = require('wiredep').stream;
var notifier = require('node-notifier');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

function _dir(name, p) {
	p = p || '';
	return path.join(name, p);
}
const dirs = require('./variables.js').dirs;
function distDir(p) { return _dir(dirs['dist'], p); }
function tempDir(p) { return _dir(dirs['temp'], p); }
function appDir(p) { return _dir(dirs['app'], p); }
function stylesDir(p) { return _dir(dirs['styles'], p); }
function jadeDir(p) { return _dir(dirs['jade'], p); }
function scriptsDir(p) { return _dir(dirs['scripts'], p); }
function imagesDir(p) { return _dir(dirs['images'], p); }
function dataDir(p) { return _dir('data', p); }
function fontsDir(p) { return _dir(dirs['fonts'], p); }
function testDir(p) { return _dir(dirs['test'], p); }
function specDir(p) { return _dir(dirs['spec'], p); }

var pkg = require('./package.json');
var projectName = (pkg.name || path.basename(__dirname));

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
// ———
var sourceFile = appDir(scriptsDir('main.js'));
var destFileName = 'bundle.js';
// ———
var bundler = browserify({
	entries: [sourceFile],
	transform: [babelify],
	debug: true,
	insertGlobals: true,
	cache: {},
	packageCache: {},
	fullPaths: true
});

gulp.task('scripts', function() {
	bundler = watchify(bundler);
	bundler.on('update', rebundle);
	bundler.on('log', $.util.log);
	return rebundle();
});

gulp.task('build:scripts', ['lint'], function() {
	return bundler.add(sourceFile)
		.bundle()
		.pipe(source(destFileName))

		.pipe(buffer()) // convert from stream to buffered vinyl file object
		// .pipe($.sourcemaps.init())
		.pipe($.uglify())
		// .pipe($.sourcemaps.write())

		.pipe(gulp.dest(distDir(scriptsDir())));
});

function rebundle() {
	return bundler.bundle()
		// log errors if they happen
		.on('error', function() {
			notifier.notify({
				title: 'gulp: '+projectName,
				message: 'browserify error',
			});
		})
		.on('error', $.util.log.bind($.util, 'browserify error'))
		.pipe(source(destFileName))
		.pipe(gulp.dest(tempDir(scriptsDir())))
		.on('end', function() {
			reload();
		});
}


gulp.task('stylus', function() {
	var stream = gulp.src(appDir(stylesDir('*.styl')));
	stream = stylesPipelinePre(stream);
	stream = stream.pipe($.stylus({
			paths: ['.']
		}))
		.on('error', function() {
			notifier.notify({
				title: 'gulp: '+projectName,
				message: 'stylus error',
			});
		});
	return stylesPipelinePost(stream);
});


gulp.task('sass', function() {
	var stream = gulp.src(appDir(stylesDir('*.{sass,scss}')));
	stream = stylesPipelinePre(stream);
	stream = stream.pipe($.sass.sync({
				outputStyle: 'expanded',
				indentedSyntax: true,
				includePaths: ['.']
			})
			.on('error', $.sass.logError)
			.on('error', function() {
				notifier.notify({
					title: 'gulp: '+projectName,
					message: 'sass error',
				});
			})
		);
	return stylesPipelinePost(stream);
});

function stylesPipelinePre(stream) {
	return stream
		.pipe($.plumber())
		.pipe($.sourcemaps.init());
}
function stylesPipelinePost(stream) {
	return stream
		.pipe($.autoprefixer({ browsers: ['last 2 versions'] }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(tempDir(stylesDir())))
		.pipe(reload({ stream: true }));
}

gulp.task('styles', ['sass', 'stylus']);


function lint(files, options) {
	return function() {
		return gulp.src(files)
			.pipe(reload({ stream: true, once: true }))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}
var testLintOptions = {
	env: {
		mocha: true
	},
	globals: {
		assert: false,
		expect: false,
		should: false
	}
};
gulp.task('lint', lint(appDir(scriptsDir('**/*.js'))));
gulp.task('lint:test', lint(testDir(specDir('**/*.js')), testLintOptions));


gulp.task('jade', function () {
	return gulp.src(appDir('*.jade'))
		.pipe($.jade({ pretty: true }))
		.pipe(gulp.dest(tempDir()))
		.pipe(reload({ stream: true }));
});


gulp.task('html', ['jade', 'styles'], function() {
	var assets = $.useref.assets({ searchPath: [tempDir(), appDir(), '.']});

	return gulp.src([appDir('*.html'), tempDir('*.html')])
		.pipe(assets)
		.pipe($.if('*.js', $.uglify()))
		// .pipe($.if('*.css', $.minifyCss({ compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		// .pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
		.pipe(gulp.dest(distDir()));
});


gulp.task('images', function() {
	return gulp.src(appDir(imagesDir('**/*')))
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{ cleanupIDs: false }]
		}))
		.on('error', function (err) {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest(distDir(imagesDir())));
});


gulp.task('fonts', function() {
	// fontawesome
	gulp.src('bower_components/fontawesome/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	return gulp.src(require('main-bower-files')({
		filter: '**/*.{ eot,svg,ttf,woff,woff2 }'
	}).concat(appDir(fontsDir('**/*'))))
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));
});


gulp.task('data', function() {
	return gulp.src([
			appDir(dataDir('**/*'))
		])
		.pipe(gulp.dest(distDir(dataDir())));
});


gulp.task('extras', ['data'], function() {
	return gulp.src([
		appDir('*.*'),
		'!'+appDir('*.html'),
		'!'+appDir('*.jade')
	], {
		dot: true
	}).pipe(gulp.dest(distDir()));
});


gulp.task('clean', del.bind(null, [tempDir(), distDir()]));


gulp.task('serve', ['jade', 'scripts', 'styles', 'fonts'], function() {
	browserSync.create().init({
			notify: false,
			// port: 9000,
			server: {
				baseDir: [tempDir(), appDir()],
				routes: {
					'/bower_components': 'bower_components'
				}
			}
		},
		function() {
			// notifier.notify({
			// 	title: 'gulp: '+projectName,
			// 	message: 'server running',
			// });
		}
	);

	gulp.watch([
		appDir('*.html'),
		tempDir('*.html'),
		// appDir(scriptsDir('**/*.js')),
		appDir(imagesDir('**/*')),
		tempDir(fontsDir('**/*'))
	]).on('change', reload);

	gulp.watch(appDir('**/*.jade'), ['jade']);
	gulp.watch(appDir(stylesDir('**/*.{sass,scss,styl}')), ['styles']);
	gulp.watch(appDir(fontsDir('**/*')), ['fonts']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});


gulp.task('serve:dist', function() {
	browserSync.create().init({
		notify: false,
		// port: 9000,
		server: {
			baseDir: [distDir()]
		}
	});
});


gulp.task('serve:test', function() {
	browserSync.create().init({
		notify: false,
		// port: 9000,
		ui: false,
		server: {
			baseDir: testDir(),
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch(testDir(specDir('**/*.js'))).on('change', reload);
	gulp.watch(testDir(specDir('**/*.js')), ['lint:test']);
});


// inject bower components
gulp.task('wiredep', function() {
	gulp.src(appDir(stylesDir('*.{sass,scss,styl}')))
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest(appDir(stylesDir())));

	// gulp.src(appDir('*.html'))
	gulp.src(appDir(jadeDir('layouts/*.jade')))
		.pipe(wiredep({
			exclude: ['bootstrap-sass', 'bootstrap-stylus'],
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest(appDir()));
});


gulp.task('npm-init', function(cb) {
	var pkg = require('./package.json');
	if (!pkg.name) { pkg.name = path.basename(__dirname); }
	if (!pkg.version) { pkg.version = '0.0.0'; }
	if (!pkg.private) { pkg.private = false; }

	var fs = require('fs');
	fs.writeFile(
		path.join(__dirname, 'package.json'),
		JSON.stringify(pkg, null, '  '),
		function(err) {
			if (err) throw err;
			return cb();
		}
	);
});


gulp.task('version-bump', ['npm-init'], function(cb) {
	var execSync = require('child_process').execSync;
	var moment = require('moment');
	var chalk = require('chalk');

	// bump version
	try {
		execSync(
			'git add -A && git commit -m "pre version bump"',
			{ /*cwd: dir*/ }
		);
	} catch (e) {}
	execSync(
		'npm version prerelease',
		{ /*cwd: dir*/ }
	);

	// rename dist dir
	var date = moment().format('YYYY-MM-DD');
	var pkg = require('./package.json');
	var version = pkg.version;
	console.log('version bump:', chalk.bgGreen.black(version));
	var from = distDir();
	var to = from+'__v'+version+'__'+date;
	execSync(
		'mv "'+from+'" "'+to+'"',
		{ /*cwd: dir*/ }
	);

	return cb();
});


gulp.task('freeze', ['build'], function() {
	gulp.start('version-bump');
});


gulp.task('build', ['build:scripts', 'html', 'images', 'fonts', 'extras'], function() {
	return gulp.src(distDir('**/*'))
		.pipe($.size({ title: 'build', gzip: true }));
});


gulp.task('default', ['clean'], function() {
	gulp.start('build');
});
