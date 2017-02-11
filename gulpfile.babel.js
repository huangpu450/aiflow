/**
 * gulp项目编译脚本
 *
 * @author: yunzhi li
 * @version: 2016/9/26 21:55
 *           $Id$
 */
// 项目配置信息
import proList from './src/common/config/aipro';

// 任务流程库引入
import gulp from 'gulp';
import del from 'del';
import merge from 'merge-stream';
import vinyPaths from 'vinyl-paths';
import concat from 'gulp-concat';
import fs from 'fs';
import plumber from 'gulp-plumber';
import browserS from 'browser-sync';
var browserSync = browserS.create();

// 接收任务参数
// 项目序列号
var proSn = gulp.env.sn ? gulp.env.sn : '';
// 项目名称、标题、支持设备类型
var proName, proTitle, deviceType;
if (proSn === '') {
    // 传入项目名称方式执行任务
    proName = gulp.env.pro ? gulp.env.pro : 'sxwt';
    for (let pro of proList.pro) {
        if (pro.name === proName) {
            proSn = pro.sn;
            proTitle = pro.title;
            deviceType = pro.dev;
            break;
        }
    }
} else {
    // 传入项目序列号方式执行任务
    for (let pro of proList.pro) {
        if (pro.sn === proSn) {
            proName = pro.name;
            proTitle = pro.title;
            deviceType = pro.dev;
            break;
        }
    }
}

// 显示项目基础信息
console.log('-------------------------------------------');
console.log('-- Gulp task params');
console.log('-------------------------------------------');
console.log('Project title:: ' + proTitle);
console.log('Project SN:: ' + proSn);
console.log('Project Name:: ' + proName);
console.log('Device Type:: ' + deviceType);
console.log('-------------------------------------------');

// 定义项目相关路径常量
const logicDir = 'src';
const viewDir = 'view';
const wwwDir = 'www';
const srcDir = wwwDir + '/static/' + proName + '/src';
const distDir = wwwDir + '/static/' + proName + '/dist';

// 判断项目名称是否正确
if (gulp.env._[0] !== 'init') {
    var proExist = fs.existsSync(srcDir);
    if (!proExist) {
        console.log('The project name is error, please check!');
        process.exit();
    }
}

// 清除原有目录
gulp.task('clean', function () {
    var lib = gulp.src(distDir + '/lib/*')
        .pipe(gulp.dest(distDir + '/lib'))
        .pipe(vinyPaths(del));
    var img = gulp.src(distDir + '/images/*')
        .pipe(gulp.dest(distDir + '/images/'))
        .pipe(vinyPaths(del));
    var zipFile = gulp.src(distDir + '/*.zip')
        .pipe(gulp.dest(distDir + '/'))
        .pipe(vinyPaths(del));
    return merge(lib, img, zipFile);
});

// 发布到新的目录
gulp.task('copy', ['clean'], function () {
    var lib = gulp.src(srcDir + '/lib/**')
        .pipe(gulp.dest(distDir + '/lib/'))
    var img = gulp.src(srcDir + '/images/**')
        .pipe(gulp.dest(distDir + '/images/'))
    var js = gulp.src(srcDir + '/js/**')
        .pipe(gulp.dest(distDir + '/js/'))
    return merge(lib, img, js);
});

// 处理CSS
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssgrace from 'cssgrace';
import cssnext from 'cssnext';
import cssnano from 'cssnano';
import cssimport from 'postcss-import';
import cusmedia from 'postcss-custom-media';
import csscalc from 'postcss-calc';
import px2rem from 'postcss-px2rem';
import cssrmcomments from 'postcss-discard-comments';
// 项目打包库
import zip from 'gulp-zip';

// CSS压缩处理配置
var distProcessors = [
    cssrmcomments,
    cssnano
];

// CSS合并
var devProcessors_concat;
var devProcessors_grace;

// switch the device type
switch (deviceType) {
    // 针对PC端设备的任务配置
    case 'pc':
        devProcessors_concat = [
            cssimport,
            csscalc,
            cusmedia,
            cssnext(),
            autoprefixer({
                browsers: ['>1%'],
                cascade: true,
                remove: true
            }),
        ];

        devProcessors_grace = [
            cssgrace,
        ];
        break;
    // 针对移动端设备的任务配置
    case 'phone':
        devProcessors_concat = [
            cssimport,
            csscalc,
            cusmedia,
            cssnext(),
            autoprefixer({
                browsers: ['not ie <= 8'],
                cascade: true,
                remove: true
            }),
        ];

        devProcessors_grace = [
            cssgrace,
            px2rem({remUnit: 20}),
        ];
        break;
}

// CSS编译任务
gulp.task('css', function () {
    return gulp.src(srcDir + '/css/*.css')
        .pipe(plumber())
        .pipe(postcss(distProcessors))
        .pipe(gulp.dest(distDir + '/css'));
});

// 配置需要打包合并的CSS源文件路径
var srcArr = [
    srcDir + '/css/src/main.css',
];

// the task for concat css into comm.css
gulp.task('concat', function () {
    console.log('-------------------------------------------');
    return gulp.src(srcArr)
        .pipe(plumber())
        .pipe(postcss(devProcessors_concat))
        .pipe(concat('comm.css'))
        .pipe(gulp.dest(srcDir + '/css'));
});

// the task of grace css
gulp.task('grace', ['concat'], function () {
    return gulp.src(srcDir + '/css/comm.css')
        .pipe(plumber())
        .pipe(postcss(devProcessors_grace))
        .pipe(gulp.dest(srcDir + '/css'));
});

// 监控文件改动实现浏览器自动刷新任务
// proxy server
gulp.task('browser-sync', function () {
    var files = [
        // logic files
        logicDir + '/**/*.html',
        logicDir + '/**/*.css',
        logicDir + '/**/*.js',
        // view files
        viewDir + '/**/*.html',
        viewDir + '/**/*.css',
        viewDir + '/**/*.js',
        // statics files
        wwwDir + '/**/*.html',
        wwwDir + '/**/*.css',
        wwwDir + '/**/*.js',
    ];
    browserSync.init(files, {
        proxy: "localhost:1234/" + proName
    });
});

// 监控CSS变化
gulp.task('watch', ['grace'], function () {
    gulp.watch(srcDir + '/css/src/*.css', ['grace']);
});

// 引入执行终端命令库
import cmd from 'child_process';
var exec = cmd.exec;

// the init task
gulp.task('init', function () {
    let tagFile = proSn + '.' + proTitle;
    let initDir = [
        // 初始化时的逻辑层代码路径结构
        logicDir + '/' + proName,
        logicDir + '/' + proName + '/config',
        logicDir + '/' + proName + '/controller',
        // 初始化时的视图层代码路径结构
        viewDir + '/' + proName,
        viewDir + '/' + proName + '/public',
        viewDir + '/' + proName + '/public/block',
        viewDir + '/' + proName + '/public/frame',
        // 初始化时的资源层代码路径组织结构
        wwwDir + '/static/' + proName,
        wwwDir + '/static/' + proName + '/dist',
        wwwDir + '/static/' + proName + '/src',
        wwwDir + '/static/' + proName + '/src/css',
        wwwDir + '/static/' + proName + '/src/css/src',
        wwwDir + '/static/' + proName + '/src/js',
        wwwDir + '/static/' + proName + '/src/images',
        wwwDir + '/static/' + proName + '/src/lib',
    ];

    // 定义对应目录下初始化时文件名称，以及相应的写入内容
    let initFile = [
        {
            'path': logicDir + '/' + proName + '/' + tagFile,
            // 'content': '',
        }, {
            'path': viewDir + '/' + proName + '/' + tagFile,
        }, {
            'path': wwwDir + '/static/' + proName + '/' + tagFile,
        }
    ];

    // make dir
    for (let dir of initDir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, '0755');
        }
    }

    // make file
    for (let f of initFile) {
        fs.open(f.path, "w", '0755', function (err, fd) {
            if (err) {
                throw err;
            }

            if (f.content !== undefined && f.content !== '') {
                fs.write(fd, f.content, function (e) {
                    if (e) {
                        throw e;
                    }
                    fs.closeSync(fd);
                })
            }

        });
    }
});

// the dist task
gulp.task('dist', ['copy', 'css'], function () {
    var distRs = exec('node www/development.js ' + proName + '/app/make');
    distRs.stdout.on('data', function (data) {
        console.log('-------------------------------------------');
        console.log('-- Dist result data');
        console.log('-------------------------------------------');
        console.log('-- ' + data);
        // make zip file
        gulp.src(distDir + '/**/*.*')
            .pipe(zip(proSn + '.' + proTitle + '.zip'))
            .pipe(gulp.dest(distDir))
            .on('end', function () {
                process.exit();
            });
    });
});

// the default task
gulp.task('default', ['watch', 'browser-sync']);
