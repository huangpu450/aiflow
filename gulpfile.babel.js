/**
 * gulp项目编译脚本
 *
 * @author: yunzhi li
 * @version: 2016/9/26 21:55
 *           $Id$
 */
// 任务流程库引入
import gulp from 'gulp';
import del from 'del';
import merge from 'merge-stream';
import vinyPaths from 'vinyl-paths';
import concat from 'gulp-concat';
import fs from 'fs';
import path from 'path';
import plumber from 'gulp-plumber';
import chmod from 'gulp-chmod';
import zip from 'gulp-zip';
import decompress from 'gulp-decompress';
import gutil from 'gulp-util';
import moment from 'moment';
import color from 'colors-cli/safe';
let cError = color.red.bold;
let cWarn = color.yellow;
let cNotice = color.blue;
let cSuccess = color.green;
let cInfo = color.cyan;
let cTitle = color.magenta.bold;
import browserS from 'browser-sync';
let browserSync = browserS.create();
import nodeUnique from 'node-unique-array';
import jsbeautify from 'js-beautify';
let beautify = jsbeautify.js_beautify;
import jseditor from 'gulp-json-editor';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';

/**
 * 以某元素为索引数组去重
 * @param key
 * @returns {[*]}
 */
Array.prototype.unique = function (key) {
    let arr = this;
    let n = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        if (key === undefined) {
            if (n.indexOf(arr[i]) == -1) n.push(arr[i]);
        } else {
            let has = false;
            inner: {
                for (let j = 0; j < n.length; j++) {
                    if (arr[i][key] == n[j][key]) {
                        has = true;
                        // 使用靠后的值作为新值
                        n[j] = arr[i];
                        break inner;
                    }
                }
            }
            if (!has) {
                n.push(arr[i]);
            }
        }
    }
    return n;
}

// 项目配置信息
import packageConf from './package.json';
import initList from './src/common/config/initpro';
import appConfig from './src/common/config/config';
// 配置信息常量
const aiproConfPath = './src/common/config';
const aiproConfPre = appConfig.pro_conf_pref; //aipro
const tmpAiproConfPath = './src/common/config/pro';
// 定义项目相关路径常量
const rootDir = './';
const logicDir = 'src';
const viewDir = 'view';
const wwwDir = 'www';
const archiveDir = 'archive';
const releaseRootDir = rootDir + 'releases';
const initSrcDir = logicDir + '/init';
const initViewDir = viewDir + '/init';
const initWwwDir = wwwDir + '/static/init';
const gulpAction = gutil.env._[0];

let proList = {};

/**
 * 获取所有项目配置信息
 * @return {*}
 */
function getAllProConf() {
    let proArr = new nodeUnique();
    try {
        // 装入初始化项目配置文件
        proArr.add(initList.pro);

        let aiProInfo = fs.statSync(aiproConfPath);
        if (aiProInfo.isDirectory()) {
            // 读取已归档项目的配置信息
            // 这种情况放在最前面
            let archiveDirs = fs.readdirSync(archiveDir);
            archiveDirs.forEach(function (dirName, k) {
                let tmpProArchivePath = path.join(archiveDir, dirName);
                if (fs.statSync(tmpProArchivePath).isDirectory()) {
                    let tmpInfo = {};
                    let tmpInfoArr = dirName.split('-');
                    let proSn = tmpInfoArr[0] + '-' + tmpInfoArr[1];
                    let proName = tmpInfoArr[2];
                    let proTitle = tmpInfoArr[3];
                    for (let i = 4; i < tmpInfoArr.length; i++) {
                        proTitle += '-' + tmpInfoArr[i];
                    }
                    tmpInfo.sn = proSn;
                    tmpInfo.name = proName;
                    tmpInfo.title = proTitle;
                    let tmpArchiveConfPath = path.join(archiveDir, dirName, aiproConfPre + '-' + proSn + '-' + proName + '-conf.json');
                    if (fs.existsSync(tmpArchiveConfPath)) {
                        // 使用 require 语法时，路径必须带 ./
                        let tmpConf = require('./' + tmpArchiveConfPath);
                        if (!proArr.contains(tmpConf)) {
                            proArr.add(tmpConf);
                        }
                    } else {
                        if (!proArr.contains(tmpInfo)) {
                            proArr.add(tmpInfo);
                        }
                    }
                }
            });

            // 读取批量项目配置信息
            let tempFiles = fs.readdirSync(aiproConfPath);
            tempFiles.forEach(function (fileName, k) {
                // 判断是否为项目配置前缀
                if (fileName.indexOf(aiproConfPre) == 0) {
                    let tmpPath = path.join(aiproConfPath, fileName);
                    if (fs.statSync(tmpPath).isFile()) {
                        // 使用 require 语法时，路径必须带 ./
                        let aiList = require('./' + tmpPath).default;
                        for (let pro of aiList.pro) {
                            if (proArr.contains(pro)) {
                                proArr.remove(pro);
                            }
                            proArr.add(pro);
                        }
                    }
                }
            });

            // 读取单个项目配置文件 xxxx.json
            let reloadProConfFiles = fs.readdirSync(tmpAiproConfPath);
            reloadProConfFiles.forEach(function (fileName, k) {
                if (fileName.indexOf(aiproConfPre) == 0) {
                    let tmpPath = path.join(tmpAiproConfPath, fileName);
                    if (fs.statSync(tmpPath).isFile()) {
                        // 使用 require 语法时，路径必须带 ./
                        let tmpConf = require('./' + tmpPath);
                        // console.log(tmpConf);
                        if (!proArr.contains(tmpConf)) {
                            proArr.add(tmpConf);
                        }
                    }
                }
            });
        } else if (aiProInfo.isFile()) {
            let aiList = require(aiproConfPath).default;
            for (let pro of aiList.pro) {
                if (proArr.contains(pro)) {
                    proArr.remove(pro);
                }
                proArr.add(pro);
            }
        }
    } catch (err) {
        // console.log(err);
    }
    return proArr.get();
}

// 读取所有配置信息
proList.pro = getAllProConf();

// 对合并后的项目信息进行去重
proList.pro = proList.pro.unique('sn');

// 引入执行终端命令库
import cmd from 'child_process';
let exec = cmd.exec;

// 处理CSS
import postcss from 'gulp-postcss';
import cssgrace from 'cssgrace';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';
import cssimport from 'postcss-import';
import cusmedia from 'postcss-custom-media';
import csscalc from 'postcss-calc';
import px2rem from 'postcss-px2rem';
import cssrmcomments from 'postcss-discard-comments';
import groupFiles from 'gulp-group-files';
import less from 'gulp-less';
import sourcemaps from 'gulp-sourcemaps';

// 接收任务参数
// 项目名称、标题、支持设备类型、CSS编译方式
let proSn = '',
    proName = '',
    proTitle = '',
    deviceType = '',
    remUnit = '',
    compileCssType = '',
    minImg = false, // 是否开启图片压缩
    minLevel = 3, // 压缩等级 0-7，值越大越压缩大
    proConf = '';
// 项目序列号
proSn = gutil.env.sn ? gutil.env.sn : '';
// 传入项目名称方式执行任务
proName = gutil.env.pro ? gutil.env.pro : '';

if (proSn === '') {
    for (let pro of proList.pro) {
        if (pro.name === proName) {
            proConf = pro;
            proSn = pro.sn;
            proTitle = pro.title;
            deviceType = pro.dev;
            remUnit = pro.remUnit;
            compileCssType = pro.compileCss ? pro.compileCss : 'css';
            proConf.compileCssType = compileCssType;
            minImg = (pro.minImg != undefined) ? pro.minImg : false;
            proConf.minImg = minImg;
            minLevel = (pro.minLevel && pro.minLevel >= 0 && pro.minLevel <= 7) ? pro.minLevel : 3;
            proConf.minLevel = minLevel;
            break;
        }
    }
} else {
    // 传入项目序列号方式执行任务
    for (let pro of proList.pro) {
        if (pro.sn === proSn) {
            proConf = pro;
            proName = pro.name;
            proTitle = pro.title;
            deviceType = pro.dev;
            remUnit = pro.remUnit;
            compileCssType = pro.compileCss ? pro.compileCss : 'css';
            proConf.compileCssType = compileCssType;
            minImg = (pro.minImg != undefined) ? pro.minImg : false;
            proConf.minImg = minImg;
            minLevel = (pro.minLevel && pro.minLevel >= 0 && pro.minLevel <= 7) ? pro.minLevel : 3;
            proConf.minLevel = minLevel;
            break;
        }
    }
}

// 当前
const srcDir = wwwDir + '/static/' + proName + '/src';
const distDir = wwwDir + '/static/' + proName + '/dist';
const proSrcDir = logicDir + '/' + proName;
const proViewDir = viewDir + '/' + proName;
const proWwwDir = wwwDir + '/static/' + proName;
const proArchiveDir = archiveDir + '/' + proSn + '-' + proName + '-' + proTitle;
const archiveConfFileName = aiproConfPre + '-' + proSn + '-' + proName + '-conf.json';

/**
 * 读取归档后的项目配置信息
 * @return {Array}
 */
function getArchiveList() {
    let archiveDirs = fs.readdirSync(archiveDir);
    let archiveProArr = [];
    archiveDirs.forEach(function (dirName, k) {
        let tmpInfo = {};
        let tmpInfoArr = dirName.split('-');
        let proSn = tmpInfoArr[0] + '-' + tmpInfoArr[1];
        let proName = tmpInfoArr[2];
        let proTitle = tmpInfoArr[3];
        for (let i = 4; i < tmpInfoArr.length; i++) {
            proTitle += '-' + tmpInfoArr[i];
        }
        tmpInfo.sn = proSn;
        tmpInfo.name = proName;
        tmpInfo.title = proTitle;
        let tmpArchiveConfPath = path.join(archiveDir, dirName, archiveConfFileName);
        if (fs.existsSync(tmpArchiveConfPath)) {
            // 使用 require 语法时，路径必须带 ./
            let tmpConf = require('./' + tmpArchiveConfPath);
            archiveProArr.push(tmpConf);
        } else {
            archiveProArr.push(tmpInfo);
        }
    });
    return archiveProArr;
}

/**
 * 错误处理
 * @param err
 */
function errHandle(err) {
    gutil.log(cError(err.message));
    gutil.log(cError('Error detail::'));
    console.log(err);
    console.log('');
    // 表示调用已结束，否则数据无法进入下一个 pipe操作
    this.emit('end');
}

/**
 * 打印项目任务参数信息
 */
function printProHead() {
    // 显示项目基础信息
    console.log('------------------------------------------------------------------');
    console.log('-- Gulp task params');
    console.log('------------------------------------------------------------------');
    console.log('Project title:: ' + cInfo(proTitle));
    console.log('Project SN:: ' + cInfo(proSn));
    console.log('Project Name:: ' + cInfo(proName));
    console.log('Device Type:: ' + cInfo(deviceType));
    console.log('------------------------------------------------------------------');
}

/**
 * 打印某一项目信息
 * @param proInfo
 */
function printProInfo(proInfo) {
    console.log('------------------------------------------------------------------');
    console.log('-- ' + cTitle(proInfo.title) + ' 项目信息');
    console.log('------------------------------------------------------------------');
    console.log('Project title:: ' + cInfo(proInfo.title));
    console.log('Project SN:: ' + cInfo(proInfo.sn));
    console.log('Project Name:: ' + cInfo(proInfo.name));
    console.log('Surport Device Type:: ' + cInfo(proInfo.dev));
    console.log('------------------------------------------------------------------');
}

/**
 * 检查项目参数是否正确
 */
function checkProParam() {
    if (proName === '' || proSn === '') {
        console.log('ERR:: ' + cError('The project param is error, or the project config is gone, please check!'));
        process.exit();
    }
}

/**
 * 检查 重加载任务 参数是否正确
 */
function checkReloadParam() {
    if (proName === '' && proSn === '') {
        console.log('ERR:: ' + cError('The project param is error, or the project config is gone, please check!'));
        process.exit();
    } else {
        // 传入了 项目名称
        if (proName != '' && proSn === '') {

        }

        // 传入了 项目编码
        if (proName === '' && proSn != '') {
        }
    }
}

/**
 * 检查项目目录是否存在
 */
function checkProDir() {
    try {
        let srcDirStat = fs.statSync(srcDir);
        if (!srcDirStat.isDirectory()) {
            console.log('ERR:: ' + cError('The project name is error, please check!'));
            process.exit();
        }
    } catch (err) {
        console.log('ERR:: ' + cError('The project name is error, please check!'));
        process.exit();
    }
}

// 判断任务参数是否正确，如：项目名称
switch (gulpAction) {
    case 'init':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目初始化');
        checkProParam();
        printProHead();
        break;
    case 'archive':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目归档');
        checkProParam();
        printProHead();
        break;
    case 'delpro':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目删除');
        checkProParam();
        printProHead();
        break;
    case 'reload':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目重加载');
        checkProParam();
        printProHead();
        break;
    case 'release':
        console.log('==================================================================');
        console.log('-- ' + cTitle(packageConf.name + ' 打包自动发布 v' + packageConf.version + ' 版'));
        console.log('------------------------------------------------------------------');
        break;
    case 'make':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目编译');
        checkProParam();
        checkProDir();
        printProHead();
        break;
    case 'dist':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目发布');
        checkProParam();
        checkProDir();
        printProHead();
        break;
    case 'test':
        console.log('==================================================================');
        console.log('-- 脚本测试任务');
        break;
    case 'list':
        console.log('==================================================================');
        console.log('-- 项目列表');
        break;
    case 'clear:cache':
        console.log('==================================================================');
        console.log('-- 清除图片压缩处理缓存');
        break;
    case 'listpages':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目包含页面列表');
        checkProParam();
        // checkProDir();
        printProHead();
        break;
    case 'search':
        console.log('==================================================================');
        console.log('-- 搜索项目');
        break;
    case 'update':
        console.log('==================================================================');
        console.log('-- 软件升级');
        break;
    default :
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目自动监控');
        checkProParam();
        checkProDir();
        printProHead();
        break;
}

// 列出当前工程下所管理的所有项目信息
gulp.task('list', function () {
    console.log('-- ' + cTitle('项目总数:: ') + cSuccess(proList.pro.length));
    for (let pro of proList.pro) {
        printProInfo(pro);
        console.log(' ');
    }
});

// 列出以关键词搜索到的项目信息
gulp.task('search', function () {
    let searchKey = gutil.env.key ? gutil.env.key : '';
    console.log('-- 搜索关键词为:: ' + cWarn(searchKey));
    console.log(' ');
    if (searchKey != '') {
        for (let pro of proList.pro) {
            if (pro.title.indexOf(searchKey) >= 0 || pro.sn.indexOf(searchKey) >= 0 || pro.name.indexOf(searchKey) >= 0) {
                printProInfo(pro);
                console.log('-- ' + cTitle('Project configuration detail::'));
                console.log('------------------------------------------------------------------');
                console.log(pro);
                console.log('------------------------------------------------------------------');
                console.log(' ');
            }
        }
    } else {
        console.log('ERR:: ' + cError('The search keywords is empty, please check!'));
        process.exit();
    }
});

// 列出项目所包含的页面信息
gulp.task('listpages', function () {
    let confPath = './src/' + proName + '/config/data.js';
    let archiveConfPath = './archive/' + proSn + '-' + proName + '-' + proTitle + '/src/' + proName + '/config/data.js';
    let confExist = fs.existsSync(confPath);
    let archiveConfExist = fs.existsSync(archiveConfPath);
    let realPath;
    if (confExist) {
        realPath = confPath;
    } else if (archiveConfExist) {
        realPath = archiveConfPath;
    }
    let pagesData = require(realPath);
    console.log('------------------------------------------------------------------');
    console.log('-- ' + proTitle + ' 项目页面信息');
    let pagesCount = Object.keys(pagesData.default.pages).length;
    console.log('-- ' + cTitle('页面总数:: ') + cSuccess(pagesCount));
    for (let page in pagesData.default.pages) {
        let pageObj = pagesData.default.pages[page];
        console.log('------------------------------------------------------------------');
        console.log('-- Page title:: ' + cInfo(pageObj.title));
        console.log('-- Page file name:: ' + cInfo(pageObj.action + '.html'));
        console.log('-- ');
        console.log('------------------------------------------------------------------');
    }
});

// 清除原有目录
gulp.task('clean', function () {
    return gulp.src(distDir + '/*')
        .pipe(gulp.dest(distDir))
        .pipe(vinyPaths(del));
});

// 发布到新的目录
gulp.task('copy', ['clean'], function () {
    let lib = gulp.src(srcDir + '/lib/**')
        .pipe(gulp.dest(distDir + '/lib/'));
    let img;
    if (minImg) {
        img = gulp.src(srcDir + '/images/**')
            .pipe(cache(imagemin({
                // optimizationLevel: minLevel, // 0-7，优化等级，默认3
                progressive: true, // 无损压缩JPG图片，默认 false
                interlaced: true, // 隔行扫描gif进行渲染，默认 false
                multipass: true, // 多次优化SVG直到完全优化 默认 false
            })))
            .pipe(gulp.dest(distDir + '/images/'));
    } else {
        img = gulp.src(srcDir + '/images/**')
            .pipe(gulp.dest(distDir + '/images/'));
    }
    let js = gulp.src(srcDir + '/js/**')
        .pipe(gulp.dest(distDir + '/js/'));
    return merge(lib, img, js);
});

// 清除缓存
// 当图片压缩的配置参数修改后，需要清除一次缓存
gulp.task('clear:cache', function () {
    return cache.clearAll();
});

// 项目归档，将已开发完成的项目归档到对应的文件夹中
// task action:: archive
let archiveFileArr = [proSrcDir + '/**/*', proViewDir + '/**/*', proWwwDir + '/**/*'];
let archiveDirArr = [proSrcDir, proViewDir, proWwwDir, './src/common/config/pro/' + archiveConfFileName];
gulp.task('archive:copy', function () {
    return gulp.src(
        archiveFileArr, {
            base: './'
        }
    ).pipe(gulp.dest(proArchiveDir));
});

// task action:: export configuration
gulp.task('archive:conf', ['archive:copy'], function () {
    let confStr = JSON.stringify(proConf);
    confStr = beautify(confStr, {indent_size: 2});
    fs.writeFileSync(proArchiveDir + '/' + archiveConfFileName, confStr);
});

// task action:: zip
gulp.task('archive:zip', ['archive:conf'], function () {
    let timeStr = moment().format('YYYYMMDDHHmmss');
    gulp.src([proArchiveDir + '/**/*', '!' + proArchiveDir + '/*.zip'], {base: archiveDir})
        .pipe(chmod(0o755, 0o40755))
        .pipe(zip(proSn + '-' + proName + '-' + proTitle + '-' + timeStr + '.zip'))
        .pipe(gulp.dest(proArchiveDir))
        .on('end', function () {
            process.exit();
        });
});

// task action:: del
gulp.task('archive:del', ['archive:zip'], function () {
    del(archiveDirArr);
});

gulp.task('archive', ['archive:zip']);

// 删除项目源码，请注意，本操作有风险，删除后无法找回
let proDirArr = [proSrcDir, proViewDir, proWwwDir, './src/common/config/pro/' + archiveConfFileName];
// task action:: delpro
gulp.task('delpro', function () {
    del(proDirArr);
});

// 项目重新加载，项目归档操作的反操作。将已归档的项目源码，重新加载到开发环境中，便于持续开发。
// task action:: reload
gulp.task('reload', function () {
    gulp.src(
        [proArchiveDir + '/**/*', '!' + proArchiveDir + '/*.zip', '!' + proArchiveDir + '/*.json'], {
            base: proArchiveDir
        }
    ).pipe(gulp.dest('./'));
    gulp.src(
        [proArchiveDir + '/*.json'], {
            base: proArchiveDir
        }
    ).pipe(gulp.dest('./src/common/config/pro/'));
});

// CSS压缩处理配置
let distProcessors = [
    cssrmcomments,
    cssnano({
        zindex: false
    })
];

// CSS合并
let devProcessors_concat;
// concat config for pc
let devProcessors_concat_pc = [
    cssimport,
    csscalc,
    cusmedia,
    cssnext({
        browsers: ['>1%'],
    }),
];
// concat config for phone
let devProcessors_concat_phone = [
    cssimport,
    csscalc,
    cusmedia,
    cssnext({
        browsers: ['not ie <= 8'],
    }),
];

// 优雅CSS
let devProcessors_grace;
// grace config for pc
let devProcessors_grace_pc = [
    cssgrace
];
// grace config for phone
let devProcessors_grace_phone = [
    cssgrace,
    px2rem({remUnit: remUnit}),
];

// switch the device type
switch (deviceType) {
    // 针对PC端设备的任务配置
    case 'pc':
        devProcessors_concat = devProcessors_concat_pc;
        devProcessors_grace = devProcessors_grace_pc;
        break;
    // 针对移动端设备的任务配置
    case 'phone':
        devProcessors_concat = devProcessors_concat_phone;
        devProcessors_grace = devProcessors_grace_phone;
        break;
}

/**
 * 根据设备类型返回 concat 配置数组
 * @param devType
 * @return {*}
 */
function getDevProcessorConcatConf(devType) {
    let confArr;
    switch (devType) {
        // 针对PC端设备的任务配置
        case 'web':
            confArr = devProcessors_concat_pc;
            break;
        // 针对移动端设备的任务配置
        case 'wap':
            confArr = devProcessors_concat_phone;
            break;
        default:
            confArr = devProcessors_concat;
    }

    return confArr;
}

/**
 * 根据设备类型返回 grace 配置数组
 * @param devType
 * @returns {*}
 */
function getDevProcessorsGraceConf(devType) {
    let confArr;
    switch (devType) {
        // 针对PC端设备的任务配置
        case 'web':
            confArr = devProcessors_grace_pc;
            break;
        // 针对移动端设备的任务配置
        case 'wap':
            confArr = devProcessors_grace_phone;
            break;
        default:
            confArr = devProcessors_grace;
    }

    return confArr;
}

// CSS编译任务
gulp.task('css', ['clean'], function () {
    return gulp.src(srcDir + '/css/*.css')
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(postcss(distProcessors))
        .pipe(gulp.dest(distDir + '/css'));
});

// 配置需要打包合并的CSS源文件路径
let cssArr = [
    srcDir + '/css/src/main*.css',
    srcDir + '/css/src/comm*.css',
];

let lessArr = [
    srcDir + '/css/less/main*.less',
    srcDir + '/css/less/comm*.less',
];

let cssSrc = {
    'comm': [
        srcDir + '/css/src/main*.css',
        srcDir + '/css/src/comm*.css'
    ],
    'web': [
        srcDir + '/css/src/web*.css'
    ],
    'wap': [
        srcDir + '/css/src/wap*.css'
    ]
};

let lessSrc = {
    'comm': [
        srcDir + '/css/less/main*.less',
        srcDir + '/css/less/comm*.less'
    ],
    'web': [
        srcDir + '/css/less/web*.less'
    ],
    'wap': [
        srcDir + '/css/less/wap*.less'
    ]
};

// the task for concat css into comm.css
gulp.task('concat', function () {
    console.log('------------------------------------------------------------------');
    return gulp.src(cssArr)
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(postcss(devProcessors_concat))
        .pipe(concat('comm.css'))
        .pipe(gulp.dest(srcDir + '/css'));
});

// LESS编译任务
gulp.task('less', function () {
    return gulp.src(lessArr)
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        // concat
        .pipe(postcss(devProcessors_concat))
        .pipe(concat('comm.css'))
        .pipe(gulp.dest(srcDir + '/css'));
});

// the task for group concat css into every on file
gulp.task('groupConcat', groupFiles(cssSrc, function (name, files) {
    return gulp.src(files)
        .pipe(plumber({
            errorHandler: errHandle
        }))
        // .pipe(postcss(devProcessors_concat))
        .pipe(postcss(getDevProcessorConcatConf(name)))
        .pipe(concat(name + '.css'))
        .pipe(gulp.dest(srcDir + '/css'));
}));

// group compile the less files
gulp.task('groupLess', groupFiles(lessSrc, function (name, files) {
    return gulp.src(files)
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        // concat
        // .pipe(postcss(devProcessors_concat))
        .pipe(postcss(getDevProcessorConcatConf(name)))
        .pipe(concat(name + '.css'))
        .pipe(gulp.dest(srcDir + '/css'));
}));

let cssConcatSrc = {
    'comm': [
        srcDir + '/css/comm.css'
    ],
    'web': [
        srcDir + '/css/web.css'
    ],
    'wap': [
        srcDir + '/css/wap.css'
    ]
};

// the task of grace css
gulp.task('grace', ['concat'], function () {
    return gulp.src(srcDir + '/css/comm.css')
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(postcss(devProcessors_grace))
        .pipe(gulp.dest(srcDir + '/css'));
});

// the task of group grace css
let beforeGraceWorks = [];
switch (compileCssType) {
    case 'css':
        beforeGraceWorks = ['groupConcat'];
        break;
    case 'less':
        beforeGraceWorks = ['groupLess'];
        break;
    default:
        beforeGraceWorks = ['groupConcat'];
        break;
}

// 成组 grace 任务
gulp.task('groupGrace', beforeGraceWorks, groupFiles(cssConcatSrc, function (name, files) {
    return gulp.src(files)
        .pipe(plumber({
            errorHandler: errHandle
        }))
        .pipe(postcss(getDevProcessorsGraceConf(name)))
        .pipe(gulp.dest(srcDir + '/css'));
}));

// 项目编译任务，包括CSS、JS等
// task action:: make
gulp.task('make', ['groupGrace']);

// 监控文件改动实现浏览器自动刷新任务
// proxy server
gulp.task('browser-sync', function () {
    let files = [
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
gulp.task('watch', ['make'], function () {
    gulp.watch([
            srcDir + '/css/src/*.css',
            srcDir + '/css/src/**/*.css',
            srcDir + '/css/less/*.less',
            srcDir + '/css/less/**/*.less'
        ],
        ['groupGrace']).on('change', function (event) {
            gutil.log(cNotice('File:: ') + cWarn(event.path) + ' was ' + cSuccess(event.type) + ', running tasks...');
        }
    );
});

// the init task
gulp.task('initdir', function () {
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

// 初始化，创建目录结构后，复制基本文件
// task action:: init
gulp.task('init', ['initdir'], function () {
    let src = gulp.src(initSrcDir + '/**/*')
        .pipe(gulp.dest(proSrcDir + '/'));
    let view = gulp.src(initViewDir + '/**/*')
        .pipe(gulp.dest(proViewDir + '/'));
    let www = gulp.src(initWwwDir + '/**/*')
        .pipe(gulp.dest(proWwwDir + '/'));
    return merge(src, view, www);
});

// 项目发布任务，发布到指定的文件夹，以及打包压缩
// task action:: dist
gulp.task('dist', ['copy', 'css'], function () {
    let distRs = exec('node www/development.js ' + proName + '/app/make');
    let timeStr = moment().format('YYYYMMDDHHmmss');
    distRs.stdout.on('data', function (data) {
        console.log('------------------------------------------------------------------');
        console.log('-- Dist result data');
        console.log('------------------------------------------------------------------');
        console.log('-- ' + data);
        // make zip file
        gulp.src(distDir + '/**/*.*')
            .pipe(chmod(0o755, 0o40755))
            .pipe(zip(proSn + '.' + proTitle + '-' + timeStr + '.zip'))
            .pipe(gulp.dest(distDir))
            .on('end', function () {
                process.exit();
            });
    });
});

// the task of release framework
// 用于发布自动化框架构建源码
// task action:: release
gulp.task('release', function () {
    let timeStr = moment().format('YYYYMMDDHHmmss');
    let ver = packageConf.version;
    let subName = packageConf.subname;
    let releaseDir = rootDir + 'releases/' + ver;
    let releaseName = subName + '-' + ver + '-';
    let releaseZipName = releaseName + timeStr + '.zip';

    let releaseSource = [
        rootDir + '/*.*',
        rootDir + '/.*',
        '!' + rootDir + '/.svn',
        '!' + rootDir + '/.idea',
        '!' + rootDir + '/.git',
        rootDir + '/archive',
        rootDir + '/releases',

        logicDir + '/common/**',
        logicDir + '/common/**/*.*',
        logicDir + '/home/**',
        logicDir + '/home/**/*.*',
        logicDir + '/init/**',
        logicDir + '/init/**/*.*',
        '!' + logicDir + '/common/config/pro/*.json',
        '!' + logicDir + '/common/config/' + aiproConfPre + '*.js',

        viewDir + '/common/**',
        viewDir + '/common/**/*.*',
        viewDir + '/home/**',
        viewDir + '/home/**/*.*',
        viewDir + '/init/**',
        viewDir + '/init/**/*.*',

        wwwDir + '/*.*',
        wwwDir + '/commLib/**',
        wwwDir + '/commLib/**/*.*',
        wwwDir + '/static/home/**',
        wwwDir + '/static/home/**/*.*',
        wwwDir + '/static/init/**',
        wwwDir + '/static/init/**/*.*',
    ];

    // step 1
    // update the release date of the software
    gulp.src("./package.json")
        .pipe(jseditor({
            "release-date": timeStr
        }))
        .pipe(gulp.dest(rootDir));

    // step 2
    // create file and directory
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir, '0755');
    } else {
        del([releaseDir + '/*', releaseRootDir + '/' + releaseName + '*']);
    }

    // step 3
    // copy source files to the release directory
    gulp.src(releaseSource, {
        base: './'
    }).pipe(gulp.dest(releaseDir)).on('end', function () {
        // step 3
        // zip the releases
        gulp.src([releaseDir + '/**', releaseDir + '/**/*.*', releaseDir + '/**/.*', releaseDir + '/.*'])
            .pipe(chmod(0o755, 0o40755))
            .pipe(zip(releaseZipName))
            .pipe(gulp.dest(releaseRootDir))
            .on('end', function () {
                process.exit();
            });
    });
});

/**
 * 版本号比较方法
 * 传入两个字符串，当前版本号：curV；比较版本号：reqV
 * 调用方法举例：compareVer("1.1","1.2")，将返回false
 *
 * @param curV
 * @param reqV
 * @return {boolean}
 */
function compareVer(curV, reqV) {
    if (curV && reqV) {
        //将两个版本号拆成数字
        let arr1 = curV.split('.'),
            arr2 = reqV.split('.');
        let minLength = Math.min(arr1.length, arr2.length),
            position = 0,
            diff = 0;
        //依次比较版本号每一位大小，当对比得出结果后跳出循环（后文有简单介绍）
        while (position < minLength && ((diff = parseInt(arr1[position]) - parseInt(arr2[position])) == 0)) {
            position++;
        }
        diff = (diff != 0) ? diff : (arr1.length - arr2.length);
        //若curV大于reqV，则返回true
        return diff > 0;
    } else {
        //输入为空
        console.log('-- ' + cError("版本号不能为空"));
        return false;
    }
}

gulp.task('update', function () {
    let releaseZips = fs.readdirSync(releaseRootDir);
    let curVer = packageConf.version;
    console.log('-- 当前版本号:: ' + cInfo(curVer));
    let curReleaseDate = packageConf['release-date'];
    console.log('-- 当前版本发布日期:: ' + cInfo(curReleaseDate));
    let verInfo = [];
    let isNeedUpdate = false;
    let newVerPath = '';

    // 选出压缩包中的最大版本
    releaseZips.forEach(function (fileName, k) {
        let tmpReleaseFile = path.join(releaseRootDir, fileName);
        let tmpPathObj = path.parse(tmpReleaseFile);
        if (fs.statSync(tmpReleaseFile).isFile() &&
            fileName.indexOf(packageConf.subname) == 0
            && tmpPathObj.ext == '.zip') {
            let tmpVerInfo = tmpPathObj.name.split('-');
            tmpVerInfo.push(tmpReleaseFile);
            if (verInfo.length == 0) {
                verInfo = tmpVerInfo;
            } else {
                // 版本号如果相同，则比较发布日期的先后
                if (verInfo[1] == tmpVerInfo[1]) {
                    isNeedUpdate = parseInt(tmpVerInfo[2]) > parseInt(verInfo[2]);
                } else {
                    isNeedUpdate = compareVer(tmpVerInfo[1], verInfo[1]);
                }

                if (isNeedUpdate) {
                    verInfo = tmpVerInfo;
                }
            }
        }
    });

    // 最大版本与当前版本比较
    if (verInfo.length > 0) {
        if (curVer == verInfo[1]) {
            isNeedUpdate = parseInt(verInfo[2]) > parseInt(curReleaseDate);
        } else {
            isNeedUpdate = compareVer(verInfo[1], curVer);
        }

        if (isNeedUpdate) {
            newVerPath = verInfo[3];
            gulp.src(newVerPath)
                .pipe(decompress())
                .pipe(gulp.dest(rootDir))
                .on('end', function () {
                    // 执行 npm install
                    let updateRs = exec('npm install');
                    updateRs.stdout.on('data', function (data) {
                        console.log('------------------------------------------------------------------');
                        console.log('-- update result data');
                        console.log('------------------------------------------------------------------');
                        gutil.log(data);
                    });
                });
            console.log('-- ');
            console.log('-- ' + cSuccess('当前版本已更新完成！'));
            console.log('-- ');
            console.log('-- 版本号:: ' + cInfo(verInfo[1]));
            console.log('-- 版本发布日期:: ' + cInfo(verInfo[2]));
        } else {
            console.log('-- ');
            console.log('-- ' + cWarn('当前版本已是最新，无需升级！'));
        }
    } else {
        console.log('-- ');
        console.log('-- ' + cWarn('当前版本已是最新，无需升级！'));
    }
    console.log('------------------------------------------------------------------');
});

// the default task
// 默认任务，用户于监控文件的变动，并对变动的文件实时编译，同时刷新所有浏览器终端
// task action:: default
gulp.task('default', ['watch', 'browser-sync']);

// the test task
// 开发过程中，对于任务的相关测试，或是调试性写法，尝试等，可以写在这里
// task action:: test
gulp.task('test', function () {
    // let t = Date.now();
    // console.log(t);
    // console.log(moment().format('YYYYMMDDHHmmss'))
    gutil.log('stuff happened', 'Really it did', gutil.colors.magenta('123'));
    console.log(gutil.env);
});
