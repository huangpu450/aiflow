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
import console from 'better-console';
import prompt from 'gulp-prompt';
import color from 'colors-cli/safe';
// display message in different color
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

// 项目配置信息
import packageConf from './package.json';
import initList from './src/common/config/initpro';
import appConfig from './src/common/config/config';
// 配置信息常量
const aiproConfPath = './src/common/config';
const aiproConfPre = appConfig.pro_conf_pref; //aipro
const tmpAiproConfPath = './src/common/config/pro';
const combConfPath = aiproConfPath + '/pro.js';
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
const initConfPath = logicDir + '/common/config/initpro.js';
const gulpAction = gutil.env._[0];
const confProBySearchTag = 'setBySearchPro';
const confProEndTag = 'endConfigPro';

// 所有项目信息存储对象
let proList = {};

// 项目任务帮助信息
let taskInfoObj = {
    "init": {
        "name": "init",
        "param": {
            "pro": {
                "name": "pro",
                "desc": "项目名称，用于唯一标识项目的字符串",
                "must": true,
                "eg": "guodanian"
            },
            "sn": {
                "name": "sn",
                "desc": "项目编号，用于唯一标识项目",
                "must": true,
                "eg": "2016-HN026"
            }
        },
        "eg": [{
            "cmd": "gulp init --pro guodanian",
            "desc": "初始化一个叫 guodanian 的项目"
        }, {
            "cmd": "gulp init --sn 2016-HN026",
            "desc": "初始化一个以 2016-HN026 为编号的项目"
        }]
    }
};

// 项目配置信息模板
let confInfoObj = {
    // 必选参数
    "sn": {
        "key": "sn",
        "desc": "项目编号，由英文、数字、-、_组合而成，必须唯一。",
        "eg": "2016-HN001",
        "must": true,
        "default": ''
    },
    "name": {
        "key": "name",
        "desc": "项目编码，由英文、数字、下划线组成的字符串，不区分大小写，必须唯一",
        "eg": "guodanian",
        "must": true,
        "default": ''
    },
    "title": {
        "key": "title",
        "desc": "项目标题",
        "eg": "湖南移动-过大年聚合页",
        "must": true,
        "default": ''
    },
    "dev": {
        "key": "dev",
        "desc": "项目展示的平台类型，可用于决定CSS的编译方式。\n       可选值:: pc/phone\n       只有当CSS开发过程中，将源码编入：\n         " + cNotice('comm*.css or comm*.less') + "\n         " + cNotice("main*.css or main*.less") + "\n       这种情况下系统会根据该参数判断编译方式。\n       其他情况不需要配置。",
        "eg": "phone",
        "must": true,
        "default": 'pc'
    },
    // 可选配置
    "author": {
        "key": "author",
        "desc": "项目作者，及相关的开发人员",
        "eg": "张三，李四",
        "must": false,
        "default": ''
    },
    "type": {
        "key": "type",
        "desc": "项目类型，指定项目属于哪种类型，会在哪种场景下展示。\n       可选值:: web/wap/all",
        "eg": "web",
        "must": false,
        "default": ''
    },
    "date": {
        "key": "date",
        "desc": "项目创建日期",
        "eg": "2016-12-10",
        "must": false,
        "default": ''
    },
    "remUnit": {
        "key": "remUnit",
        "desc": "REM单位换算单元值，即设计稿的宽度除以10。如设计稿宽750，则值为75。",
        "eg": "75",
        "must": false,
        "default": '75'
    },
    "compileCss": {
        "key": "compileCss",
        "desc": "CSS编译方式，指定CSS是以某种方式开发的。\n       可选值：less, css，推荐less方式开发。",
        "eg": "less",
        "must": false,
        "default": 'css'
    },
    "minImg": {
        "key": "minImg",
        "desc": "是否启用图片压缩，配置值：true（开启）， false（关闭）",
        "eg": "false",
        "must": false,
        "default": false
    },
    "minLevel": {
        "key": "minLevel",
        "desc": "图片压缩等级，配置值：0-7，值越大，越压缩比例大。\n       智能判断可压缩的空间，存在最大只能压缩到一定程序，\n       参数值增加不会产生效果。",
        "eg": "3",
        "must": false,
        "default": 3
    },
    "svn": {
        "key": "svn",
        "desc": "项目SVN地址",
        "eg": "http://xx.xxx.x.xx:9999/svn/ui/hn/2017",
        "must": false,
        "default": ''
    },
    "remark": {
        "key": "remark",
        "desc": "项目备注",
        "eg": "本项目必须支持到IE8浏览器",
        "must": false,
        "default": ''
    }
};

/**
 * 以某元素为索引数组去重，如果出现重复则合并
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
                        // n[j] = arr[i];
                        // 合并两个值
                        n[j] = Object.assign(n[j], arr[i]);
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

/**
 * 设置项目配置对象
 * @param pro
 * @return {{}}
 */
function setProConf(pro) {
    let proConf = pro;
    proConf.remUnit = pro.remUnit ? pro.remUnit : 75;
    proConf.compileCss = pro.compileCss ? pro.compileCss : 'css';
    proConf.minImg = (pro.minImg != undefined) ? pro.minImg : false;
    proConf.minLevel = (pro.minLevel && pro.minLevel >= 0 && pro.minLevel <= 7) ? pro.minLevel : 3;
    return proConf;
}

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
            // aipro_xxxx.js
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

/**
 * 格式化单个项目配置参数
 * @param pro
 * @return {{}}
 */
function formatConf(pro) {
    let tmpPro = {};
    // 按标准化的内容及顺序格式化配置内容
    for (let paramKey in confInfoObj) {
        let param = confInfoObj[paramKey];
        tmpPro[param.key] = pro[param.key] ? pro[param.key] : param.default;
    }
    // 合并非标准化参数
    Object.assign(tmpPro, pro);
    return tmpPro;
}

/**
 * 格式化配置文件
 * @param filePath
 */
function formatConfFile(filePath) {
    let tmpPath = filePath;
    // 匹配配置内容的正则
    let confReg = /{[\w\W]*}\s*/gi;
    // 使用 require 语法时，路径必须带 ./
    let aiList = require('./' + tmpPath).default;
    let tmpConf = {};
    tmpConf.pro = [];
    let confCon = fs.readFileSync(tmpPath, 'utf-8');
    for (let pro of aiList.pro) {
        tmpConf.pro.push(formatConf(pro));
    }
    let tmpConfStr = confCon.replace(confReg, '') + JSON.stringify(tmpConf);
    tmpConfStr = beautify(tmpConfStr, {indent_size: 4});
    fs.writeFileSync(tmpPath, tmpConfStr);
    gutil.log(cInfo(path.resolve(tmpPath)) + ' 格式化完成');
}

/**
 * 格式化所有配置信息列表
 * @param proList
 * @return {{}}
 */
function formatAllConf(proList) {
    let combConf = {};
    combConf.pro = [];
    for (let pro of proList.pro) {
        let tmpPro = {};
        tmpPro = formatConf(pro);
        combConf.pro.push(tmpPro);
    }
    return combConf;
}

/**
 * 设置配置文件
 * @param filePath 配置文件路径
 * @param proConf 配置内容对象
 */
function setConfFile(filePath, proConf) {
    let tmpPath = filePath;
    // 匹配配置内容的正则
    let confReg = /{[\w\W]*}\s*/gi;
    // 使用 require 语法时，路径必须带 ./
    let aiList = require('./' + tmpPath).default;
    let tmpConf = {};
    tmpConf.pro = [];
    let confCon = fs.readFileSync(tmpPath, 'utf-8');
    let find = false;
    for (let pro of aiList.pro) {
        if (pro.name == proConf.name) {
            find = true;
            tmpConf.pro.push(formatConf(proConf));
        } else {
            tmpConf.pro.push(formatConf(pro));
        }
    }
    if (find) {
        // 如果找到相应配置参数
        let tmpConfStr = confCon.replace(confReg, '') + JSON.stringify(tmpConf);
        tmpConfStr = beautify(tmpConfStr, {indent_size: 4});
        fs.writeFileSync(tmpPath, tmpConfStr);
        gutil.log(cInfo(path.resolve(tmpPath)) + ' 配置完成');
    }
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
    remUnit = 75,
    compileCssType = '',
    minImg = false, // 是否开启图片压缩
    minLevel = 3, // 压缩等级 0-7，值越大越压缩大
    proConf = {};
// 项目序列号
proSn = gutil.env.prosn ? gutil.env.prosn : '';
// 传入项目名称方式执行任务
proName = gutil.env.pro ? gutil.env.pro : '';

// 从项目列表中提取当前项目配置参数详情
if (proSn === '') {
    for (let pro of proList.pro) {
        if (pro.name === proName) {
            proSn = pro.sn;
            proTitle = pro.title;
            deviceType = pro.dev;
            remUnit = pro.remUnit ? pro.remUnit : 75;
            compileCssType = pro.compileCss ? pro.compileCss : 'css';
            minImg = (pro.minImg != undefined) ? pro.minImg : false;
            minLevel = (pro.minLevel && pro.minLevel >= 0 && pro.minLevel <= 7) ? pro.minLevel : 3;

            proConf = setProConf(pro);
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
            remUnit = pro.remUnit ? pro.remUnit : 75;
            compileCssType = pro.compileCss ? pro.compileCss : 'css';
            minImg = (pro.minImg != undefined) ? pro.minImg : false;
            minLevel = (pro.minLevel && pro.minLevel >= 0 && pro.minLevel <= 7) ? pro.minLevel : 3;

            proConf = setProConf(pro);
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
const archiveConfFilePath = proArchiveDir + '/' + archiveConfFileName;
const devConfFilePath = logicDir + '/common/config/pro/' + archiveConfFileName;

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
    console.log('Project Author:: ' + cInfo(proInfo.author));
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
    // 同者都没有传入
    // 或 传入了 项目名称，但没有匹配到项目编码
    // 或 传入了 项目编码，但没有匹配到项目名称
    if (proName === '' || proSn === '') {
        console.log('ERR:: ' + cError('The project param is error, or the project config is gone, please check!'));
        process.exit();
    } else if (!fs.existsSync(proArchiveDir)) {
        // 项目信息有匹配到，现在检查目录是否存在
        console.log('ERR:: ' + cError('The project archive directory is not exists, please check!'));
        process.exit();
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
        checkReloadParam();
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
    case 'list:pro':
        console.log('==================================================================');
        console.log('-- 项目列表');
        break;
    case 'list:pages':
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目包含页面列表');
        checkProParam();
        printProHead();
        break;
    case 'search':
        console.log('==================================================================');
        console.log('-- 搜索项目');
        break;
    case 'clear:cache':
        console.log('==================================================================');
        console.log('-- 清除图片压缩处理缓存');
        break;
    case 'conf:comb':
        console.log('==================================================================');
        console.log('-- 合并所有项目配置文件为一个');
        break;
    case 'conf:format':
        console.log('==================================================================');
        console.log('-- 项目配置文件格式化');
        if (gutil.env.pro != 'all' && Object.keys(gutil.env).length > 1) {
            checkProParam();
        }
        break;
    case 'conf:get':
        console.log('==================================================================');
        console.log('-- 项目配置信息查询');
        checkProParam();
        break;
    case 'conf:help':
        console.log('==================================================================');
        console.log('-- 项目配置帮助信息');
        break;
    case 'conf':
        console.log('==================================================================');
        console.log('-- 配置项目参数:: ' + cTitle(proName));
        checkProParam();
        break;
    case 'h':
        console.log('==================================================================');
        console.log('-- 系统帮助');
        break;
    case 'c':
        console.log('==================================================================');
        console.log('-- 项目配置');
        break;
    case 'update':
        console.log('==================================================================');
        console.log('-- 软件升级');
        break;
    case 'test':
        console.log('==================================================================');
        console.log('-- 脚本测试任务');
        break;
    default :
        console.log('==================================================================');
        console.log('-- ' + cTitle(proName) + ' 项目自动监控');
        checkProParam();
        checkProDir();
        printProHead();
        break;
}

// ==================================================================
// 列出当前工程下所管理的所有项目信息
gulp.task('list:pro', function () {
    console.log('-- ' + cTitle('项目总数:: ') + cSuccess(proList.pro.length));
    for (let pro of proList.pro) {
        printProInfo(pro);
        console.log(' ');
    }
});

// ==================================================================
// 列出项目所包含的页面信息
gulp.task('list:pages', function () {
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

// ==================================================================
// 列出以关键词搜索到的项目信息
gulp.task('search', function () {
    let searchKey = (gutil.env.key ? gutil.env.key : '');
    searchKey = searchKey == 'true' ? true : searchKey;
    searchKey = searchKey == 'false' ? false : searchKey;

    console.log('-- 搜索关键词为:: ' + cWarn(searchKey));
    console.log(' ');
    let findRs = false;
    if (searchKey !== '') {
        for (let pro of proList.pro) {
            let find = false;
            for (let p in confInfoObj) {
                let tmpV = pro[p];
                if ((typeof tmpV == "string" && tmpV.indexOf(searchKey) >= 0) || (searchKey == tmpV)) {
                    find = true;
                    findRs = true;
                    break;
                }
            }
            if (find) {
                printProInfo(pro);
                console.log('-- ' + cTitle('Project configuration detail::'));
                console.log('------------------------------------------------------------------');
                let proStr = JSON.stringify(pro);
                proStr = beautify(proStr, {indent_size: 4});
                console.log(proStr);
                console.log(' ');
            }
        }
        if (!findRs) {
            console.log('WARN:: ' + cWarn("未找到相关内容！"));
        }
    } else {
        console.log('ERR:: ' + cError('The search keywords is empty, please check!'));
        process.exit();
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

// ==================================================================
// 清除缓存
// 当图片压缩的配置参数修改后，需要清除一次缓存
gulp.task('clear:cache', function () {
    return cache.clearAll();
});

// ==================================================================
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
    proConf = formatConf(proConf);
    let confStr = JSON.stringify(proConf);
    confStr = beautify(confStr, {indent_size: 4});
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

// ==================================================================
// combine all project config to a js file
gulp.task('conf:comb', function () {
    let combConf = formatAllConf(proList);
    let confStr = JSON.stringify(combConf);
    confStr = "'use strict';\nexport default " + beautify(confStr, {indent_size: 4});
    fs.writeFileSync(combConfPath, confStr);
    console.log('-- 合并后存在位置：');
    console.log('-- ' + cSuccess(path.resolve(combConfPath)));
    console.log('');
});

// ==================================================================
// print config project param help infomation
gulp.task('conf:help', function () {
    if (Object.keys(gutil.env).length > 1) {
        // 查询单独参数说明
        if (gutil.env.param) {
            console.log('------------------------------------------------------------------');
            console.log('-- 查看参数：' + cTitle(cError(gutil.env.param)));
            console.log('------------------------------------------------------------------');
            let paramFind = false;
            if (confInfoObj[gutil.env.param] != undefined) {
                let param = confInfoObj[gutil.env.param];
                paramFind = true;
                console.log('[' + cInfo(param.key) + ']');
                console.log(cWarn('必选:  ') + (param.must ? cSuccess('是') : cError('否')));
                console.log(cWarn('说明:  ') + param.desc);
                console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
                console.log(cWarn('eg.    ') + param.eg);
                console.log('');
            }
            if (!paramFind) {
                console.log('-- ' + cError('没有找到该参数，请核实输入！'));
            }
        }
        // 查看配置DEMO
        if (gutil.env.eg) {
            console.log('------------------------------------------------------------------');
            console.log('-- 查看完整参数配置示例');
            console.log('------------------------------------------------------------------');
            let confEg = {};
            for (let param in confInfoObj) {
                confEg[param] = confInfoObj[param].eg;
            }
            let confEgStr = beautify(JSON.stringify(confEg), {indent_size: 4});
            console.log(confEgStr);
        }
        // 查看必选参数
        if (gutil.env.must) {
            // 获取所有配置参数说明
            let confEg = {};
            // 必须参数
            console.log('------------------------------------------------------------------');
            console.log('-- ' + cTitle(cError('必选项：')));
            console.log('------------------------------------------------------------------');
            for (let paramKey in confInfoObj) {
                let param = confInfoObj[paramKey];
                if (param.must) {
                    console.log('[' + cInfo(param.key) + ']');
                    console.log(cWarn('说明:  ') + param.desc);
                    console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
                    console.log(cWarn('eg.    ') + param.eg);
                    console.log('');
                    confEg[param.key] = param.eg;
                }
            }
            let confEgStr = beautify(JSON.stringify(confEg), {indent_size: 4});
            console.log('------------------------------------------------------------------');
            console.log('-- ' + cTitle(cWarn('最小配置示例：')));
            console.log('------------------------------------------------------------------');
            console.log(confEgStr);
        }
    } else {
        // 获取所有配置参数说明
        let confEg = {};
        // 必须参数
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cTitle(cError('必选项：')));
        console.log('------------------------------------------------------------------');
        for (let paramKey in confInfoObj) {
            let param = confInfoObj[paramKey];
            if (param.must) {
                console.log('[' + cInfo(param.key) + ']');
                console.log(cWarn('说明:  ') + param.desc);
                console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
                console.log(cWarn('eg.    ') + param.eg);
                console.log('');
                confEg[param.key] = param.eg;
            }
        }
        // 可选参数
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cTitle(cWarn('可选项：')));
        console.log('------------------------------------------------------------------');
        for (let paramKey in confInfoObj) {
            let param = confInfoObj[paramKey];
            if (!param.must) {
                console.log('[' + cNotice(param.key) + ']');
                console.log(cWarn('说明:  ') + param.desc);
                console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
                console.log(cWarn('eg.    ') + param.eg);
                console.log('');
                confEg[param.key] = param.eg;
            }
        }
        // 配置示例
        let confEgStr = beautify(JSON.stringify(confEg), {indent_size: 4});
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cTitle(cWarn('配置示例：')));
        console.log('------------------------------------------------------------------');
        console.log(confEgStr);
    }
});

// ==================================================================
// format the project config
gulp.task('conf:format', function () {
    if (gutil.env.pro == 'all' || Object.keys(gutil.env).length == 1) {
        // format all
        console.log('------------------------------------------------------------------');
        // 对单独配置文件进行格式化
        // xxxxx.json
        for (let pro of proList.pro) {
            pro = formatConf(pro);
            let confStr = JSON.stringify(pro);
            confStr = beautify(confStr, {indent_size: 4});
            let tmpArchiveConfFileName = aiproConfPre + '-' + pro.sn + '-' + pro.name + '-conf.json';
            let tmpProArchiveDir = archiveDir + '/' + pro.sn + '-' + pro.name + '-' + pro.title;
            let tmpArchiveConfFilePath = tmpProArchiveDir + '/' + tmpArchiveConfFileName;
            if (fs.existsSync(tmpArchiveConfFilePath)) {
                // 如果归档目录中有该项目
                fs.writeFileSync(tmpArchiveConfFilePath, confStr);
            }
            let tmpSrcDir = wwwDir + '/static/' + pro.name + '/src';
            let tmpDevConfFilePath = logicDir + '/common/config/pro/' + tmpArchiveConfFileName;
            if (fs.existsSync(tmpSrcDir)) {
                // 如果该项目存在于开发目录中
                fs.writeFileSync(tmpDevConfFilePath, confStr);
            }
            gutil.log(cInfo(pro.sn + ' ' + pro.title) + ' 配置格式化完成');
        }

        // 格式化项目初始配置文件
        formatConfFile(initConfPath);
        // 批量项目配置格式化
        // aipro_xxxx.js
        let tempFiles = fs.readdirSync(aiproConfPath);
        tempFiles.forEach(function (fileName, k) {
            // 判断是否为项目配置前缀
            if (fileName.indexOf(aiproConfPre) == 0) {
                let tmpPath = path.join(aiproConfPath, fileName);
                if (fs.statSync(tmpPath).isFile()) {
                    formatConfFile(tmpPath);
                }
            }
        });

        console.log('------------------------------------------------------------------');
        console.log('');
    } else {
        // format current
        proConf = formatConf(proConf);
        // write config file
        let confStr = JSON.stringify(proConf);
        confStr = beautify(confStr, {indent_size: 4});
        if (fs.existsSync(archiveConfFilePath)) {
            // 如果归档目录中有该项目
            fs.writeFileSync(archiveConfFilePath, confStr);
        }
        if (fs.existsSync(srcDir)) {
            // 如果该项目存在于开发目录中
            fs.writeFileSync(devConfFilePath, confStr);
        }
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cInfo(proConf.title) + ' 配置格式化完成');
        console.log('------------------------------------------------------------------');
        console.log(confStr);
    }
});

// ==================================================================
// get the project config info
gulp.task('conf:get', function () {
    // format current
    proConf = formatConf(proConf);
    // write config file
    let confStr = JSON.stringify(proConf);
    confStr = beautify(confStr, {indent_size: 4});

    console.log('------------------------------------------------------------------');
    console.log('-- ' + cInfo(proConf.title) + ' 配置内容');
    console.log('------------------------------------------------------------------');
    console.log(confStr);
});

/**
 * 更新配置文件
 */
function updateConfFile(pro) {
    let proConf = formatConf(pro);
    let confStr = JSON.stringify(proConf);
    confStr = beautify(confStr, {indent_size: 4});

    let tmpSrcDir = wwwDir + '/static/' + proConf.name + '/src';
    let tmpProArchiveDir = archiveDir + '/' + proConf.sn + '-' + proConf.name + '-' + proConf.title;
    let tmpArchiveConfFileName = aiproConfPre + '-' + proConf.sn + '-' + proConf.name + '-conf.json';
    let tmpArchiveConfFilePath = tmpProArchiveDir + '/' + tmpArchiveConfFileName;
    let tmpDevConfFilePath = logicDir + '/common/config/pro/' + tmpArchiveConfFileName;

    if (fs.existsSync(tmpArchiveConfFilePath)) {
        // 如果归档目录中有该项目
        fs.writeFileSync(tmpArchiveConfFilePath, confStr);
    }
    if (fs.existsSync(tmpSrcDir)) {
        // 如果该项目存在于开发目录中
        fs.writeFileSync(tmpDevConfFilePath, confStr);
    }

    // 项目初始配置文件设置
    setConfFile(initConfPath, proConf);
    // 批量项目配置文件设置
    // aipro_xxxx.js
    let tempFiles = fs.readdirSync(aiproConfPath);
    tempFiles.forEach(function (fileName, k) {
        // 判断是否为项目配置前缀
        if (fileName.indexOf(aiproConfPre) == 0) {
            let tmpPath = path.join(aiproConfPath, fileName);
            if (fs.statSync(tmpPath).isFile()) {
                setConfFile(tmpPath, proConf);
            }
        }
    });
    console.log('------------------------------------------------------------------');
    console.log('-- ' + cInfo(pro.title) + ' 最新配置值');
    console.log('------------------------------------------------------------------');
    console.log(confStr);
}

// ==================================================================
// config the project
gulp.task('conf', function () {
    let configSuc = false;
    for (let param in gutil.env) {
        // 修复配置值的数据类型
        gutil.env[param] = gutil.env[param] == 'undefined' ? undefined : gutil.env[param];
        gutil.env[param] = gutil.env[param] == 'true' ? true : gutil.env[param];
        gutil.env[param] = gutil.env[param] == 'false' ? false : gutil.env[param];

        // sn, name, title 三个参数不可配置
        // 值不相同时才可配置
        if (param != '_' && param != 'pro' && param != 'sn' && !['sn', 'name', 'title'].includes(param) && proConf[param] != gutil.env[param]) {
            proConf[param] = gutil.env[param];
            // 如果配置为 undefined，则删除该属性
            if (gutil.env[param] == undefined) {
                delete proConf[param];
            }
            configSuc = true;
        }
    }
    // 如果配置成功，则更新配置文件
    if (configSuc) {
        updateConfFile(proConf);
        // proConf = formatConf(proConf);
        // let confStr = JSON.stringify(proConf);
        // confStr = beautify(confStr, {indent_size: 4});
        // if (fs.existsSync(archiveConfFilePath)) {
        //     // 如果归档目录中有该项目
        //     fs.writeFileSync(archiveConfFilePath, confStr);
        // }
        // if (fs.existsSync(srcDir)) {
        //     // 如果该项目存在于开发目录中
        //     fs.writeFileSync(devConfFilePath, confStr);
        // }
        //
        // // 项目初始配置文件设置
        // setConfFile(initConfPath, proConf);
        // // 批量项目配置文件设置
        // // aipro_xxxx.js
        // let tempFiles = fs.readdirSync(aiproConfPath);
        // tempFiles.forEach(function (fileName, k) {
        //     // 判断是否为项目配置前缀
        //     if (fileName.indexOf(aiproConfPre) == 0) {
        //         let tmpPath = path.join(aiproConfPath, fileName);
        //         if (fs.statSync(tmpPath).isFile()) {
        //             setConfFile(tmpPath, proConf);
        //         }
        //     }
        // });

        // console.log('------------------------------------------------------------------');
        // console.log('-- ' + cInfo(proConf.title) + ' 最新配置值');
        // console.log('------------------------------------------------------------------');
        // console.log(confStr);
    } else {
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cInfo(proConf.title) + ' 配置失败');
        console.log('------------------------------------------------------------------');
        console.log('1. 配置参数及对应值不可缺少，请检查命令，如：--dev pc。');
        console.log('2. sn, name, title 三个参数不可配置。');
        console.log('3. 新配置值必须与原值不同。');
        console.log(cError('请检查当前命令是否输入正确！'));
    }
});

// ==================================================================
// 删除项目源码，请注意，本操作有风险，删除后无法找回
let proDirArr = [proSrcDir, proViewDir, proWwwDir, './src/common/config/pro/' + archiveConfFileName];
// task action:: delpro
gulp.task('delpro', function () {
    del(proDirArr);
});

// ==================================================================
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
    cssgrace,
    csscalc
];
// grace config for phone
let devProcessors_grace_phone = [
    cssgrace,
    csscalc,
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

// 不同设备场景下的CSS文件命名
let cssSrc = {
    // 将编译并合并为: comm.css
    'comm': [
        srcDir + '/css/src/main*.css',
        srcDir + '/css/src/comm*.css'
    ],
    // 将编译并合并为: web.css
    'web': [
        srcDir + '/css/src/web*.css'
    ],
    // 将编译并合并为: wap.css
    'wap': [
        srcDir + '/css/src/wap*.css'
    ]
};

// 不同设备场景下的LESS文件命名
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

// ==================================================================
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

// ==================================================================
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

// ==================================================================
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

// ==================================================================
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

// ==================================================================
// aiflow工具版本更新
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

/**
 * 打印参数帮助说明
 * @param paramList
 */
function printConfParamHelp(paramList) {
    for (let p of paramList) {
        let param = confInfoObj[p];
        console.log('[' + cInfo(param.key) + ']');
        console.log(cWarn('必选:  ') + (param.must ? cError('是') : cSuccess('否')));
        console.log(cWarn('说明:  ') + param.desc);
        console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
        console.log(cWarn('eg.    ') + param.eg);
        console.log('');
    }
}

/**
 * 打印(非)必选参数说明
 * @param isMust
 */
function printConfParamIsMust(isMust) {
    if (isMust) {
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cTitle(cError('必选项：')));
        console.log('------------------------------------------------------------------');
    } else {
        console.log('------------------------------------------------------------------');
        console.log('-- ' + cTitle(cWarn('可选项：')));
        console.log('------------------------------------------------------------------');
    }
    for (let p in confInfoObj) {
        let param = confInfoObj[p];
        if (param.must == isMust) {
            console.log('[' + cInfo(param.key) + ']');
            console.log(cWarn('必选:  ') + (param.must ? cError('是') : cSuccess('否')));
            console.log(cWarn('说明:  ') + param.desc);
            console.log(cWarn('默认:  ') + (param.default ? param.default : '无'));
            console.log(cWarn('eg.    ') + param.eg);
            console.log('');
        }
    }
}

/**
 * 打印配置示例
 */
function printConfEg() {
    console.log('------------------------------------------------------------------');
    console.log('-- ' + cTitle(cWarn('配置示例：')));
    console.log('------------------------------------------------------------------');
    let confEg = {};
    for (let param in confInfoObj) {
        confEg[param] = confInfoObj[param].eg;
    }
    let confEgStr = beautify(JSON.stringify(confEg), {indent_size: 4});
    console.log(confEgStr);
}

/**
 * 打印所有参数说明
 */
function printConfParamAll() {
    printConfParamIsMust(true);
    printConfParamIsMust(false);
    printConfEg();
}

/**
 * 配置帮助函数
 */
function helpConf() {
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'list',
            name: 'items',
            message: '请选择需要查看的参数或版块：',
            choices: [{
                name: '1. 全部参数',
                value: 'all'
            }, {
                name: '2. 必选参数',
                value: 'must'
            }, {
                name: '3. 非必选参数',
                value: 'notMust'
            }, {
                name: '4. 自定义查看',
                value: 'custom'
            }, {
                name: '5. 配置示例',
                value: 'eg'
            }]
        }, function (resConf) {
            switch (resConf.items) {
                case 'all':
                    printConfParamAll();
                    break;
                case 'must':
                    printConfParamIsMust(true);
                    break;
                case 'notMust':
                    printConfParamIsMust(false);
                    break;
                case 'custom':
                    helpConfCustom();
                    break;
                case 'eg':
                    printConfEg();
                    break;
            }
        })
    );
}

/**
 * 配置帮助： 自选参数说明
 */
function helpConfCustom() {
    let choicesArr = [];
    for (let p in confInfoObj) {
        choicesArr.push({
            name: '--' + p,
            value: p
        });
    }
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'checkbox',
            name: 'params',
            message: '请选择您所需要查看的参数：',
            choices: choicesArr
        }, function (resParam) {
            printConfParamHelp(resParam.params);
        })
    );
}

// ==================================================================
// global help info
gulp.task('h', function () {
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'list',
            name: 'helpType',
            message: '请选择需要帮助的版块：',
            choices: [{
                name: '1. 任务帮助信息',
                value: 'task'
            }, {
                name: "2. 配置帮助信息",
                value: 'config'
            }]
        }, function (res) {
            switch (res.helpType) {
                case 'task':
                    break;
                case 'config':
                    helpConf();
                    break;
            }
        })
    );
});

/**
 * 询问搜索关键词
 */
function askSearchKw() {
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'input',
            name: 'kw',
            message: '请输入你查找的关键词：'
        }, function (res) {
            confProBySearch(res.kw);
        })
    );
}

/**
 * 筛选需要配置的项目
 * @param kw
 */
function confProBySearch(kw) {
    let searchKey = (kw ? kw : '');
    searchKey = (searchKey == "true" ? true : searchKey);
    searchKey = (searchKey == "false" ? false : searchKey);

    let proChoicesArr = [{
        name: '手动查找项目',
        value: confProBySearchTag
    }, {
        name: '结束项目配置',
        value: confProEndTag
    }];
    let findRs = false;
    if (searchKey !== '') {
        for (let pro of proList.pro) {
            let find = false;
            for (let p in confInfoObj) {
                let tmpV = pro[p];
                if ((typeof tmpV == "string" && tmpV.indexOf(searchKey) >= 0) || tmpV == searchKey) {
                    find = true;
                    findRs = true;
                    break;
                }
            }

            if (find) {
                proChoicesArr.push({
                    name: pro.sn + ' ' + pro.title + ' ' + pro.name,
                    value: pro.name
                });
            }
        }
    }
    if (findRs) {
        gulp.src('gulpfile.babel.js').pipe(
            prompt.prompt({
                type: 'list',
                name: 'pro',
                message: '请选择需要配置的项目：',
                choices: proChoicesArr
            }, function (res) {
                if (res.pro == confProBySearchTag) {
                    // ask the search keyword
                    askSearchKw();
                } else if (res.pro == confProEndTag) {
                    console.info("Info:: 项目配置结束！");
                } else {
                    // select config item
                    let curPro;
                    for (let pro of proList.pro) {
                        if (pro.name == res.pro) {
                            curPro = pro;
                            break;
                        }
                    }
                    selectConfItem(curPro);
                }
            })
        );
    } else {
        console.warn('  Warn:: 你输入的关键词没有匹配到任何相关的项目！\n         请重新输入！');
        askSearchKw();
    }
}

/**
 * 选择需要配置的参数
 * @param pro
 */
function selectConfItem(pro) {
    let itemChoicesArr = [];
    for (let param in pro) {
        if (param != 'sn' && param != 'name' && param != 'title') {
            itemChoicesArr.push({
                name: param + ':: (' + pro[param] + ')',
                value: param
            });
        }
    }
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'list',
            name: 'item',
            message: '请选择需要配置的参数：',
            choices: itemChoicesArr
        }, function (res) {
            setItemValue(pro, res.item);
        })
    );
}

/**
 * 配置文件写入
 * @param pro
 * @param item
 */
function setItemValue(pro, item) {
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'input',
            name: 'value',
            message: '新值：'
        }, function (res) {
            // 修复配置值的数据类型
            res.value = res.value == 'undefined' ? undefined : res.value;
            res.value = res.value == 'true' ? true : res.value;
            res.value = res.value == 'false' ? false : res.value;

            if (pro[item] != res.value) {
                pro[item] = res.value;
                // 如果配置为 undefined，则删除该属性
                if (res.value == undefined) {
                    delete pro[item];
                }

                updateConfFile(pro);
                console.info("Info:: 配置更新成功！");
                gulp.start('c');
            } else {
                console.warn("Warn:: 新值未发生改变，配置无效！");
                gulp.start('c');
            }
        })
    );
}

// ==================================================================
// global config task
gulp.task('c', function () {
    let proChoicesArr = [{
        name: '手动查找项目',
        value: confProBySearchTag
    }, {
        name: '结束项目配置',
        value: confProEndTag
    }];
    for (let pro of proList.pro) {
        proChoicesArr.push({
            name: pro.sn + ' ' + pro.title + ' ' + pro.name,
            value: pro.name
        });
    }
    gulp.src('gulpfile.babel.js').pipe(
        prompt.prompt({
            type: 'list',
            name: 'pro',
            message: '请选择需要配置的项目：',
            choices: proChoicesArr
        }, function (res) {
            if (res.pro == confProBySearchTag) {
                // ask the search keyword
                askSearchKw();
            } else if (res.pro == confProEndTag) {
                console.info("Info:: 项目配置结束！");
            } else {
                // select config item
                let curPro;
                for (let pro of proList.pro) {
                    if (pro.name == res.pro) {
                        curPro = pro;
                        break;
                    }
                }
                selectConfItem(curPro);
            }
        })
    );
});

// ==================================================================
// the default task
// 默认任务，用户于监控文件的变动，并对变动的文件实时编译，同时刷新所有浏览器终端
// task action:: default
gulp.task('default', ['watch', 'browser-sync']);

// ==================================================================
// the test task
// 开发过程中，对于任务的相关测试，或是调试性写法，尝试等，可以写在这里
// task action:: test
gulp.task('test', function () {
    // let t = Date.now();
    // console.log(t);
    // console.log(moment().format('YYYYMMDDHHmmss'))
    gutil.log('stuff happened', 'Really it did', gutil.colors.magenta('123'));
    console.info('test dir');
    console.log(gutil.env);
    console.clear();
    let obj1 = {foo: 123};
    let obj2 = {foo: 321, bar: false};
    Object.assign(obj1, obj2);
    console.log(obj1);
});

