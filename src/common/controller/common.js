/**
 * the common controller of the project
 *
 * @author: yunzhi li
 * @version: 2016/9/29 20:42
 *           $Id$
 */

'use strict';
import fs from 'fs';
import path from 'path';
import  nodeUnique from 'node-unique-array';

export default class extends think.controller.base {
    /**
     * 全项目初始化接口
     * @param http
     */
    init(http) {
        super.init(http);
        // get the config of the project
        this.proConf = this.getProConfig('name', http.module);
        this.assign(this.proDevParam(this.proConf.name));
    }

    /**
     * 项目开发公用路径定义
     * @param proName
     * @returns {{proUrl: string}}
     */
    proDevParam(proName) {
        return {
            'proUrl': '/static/' + proName + '/src',
            'proUri': '/' + proName + '/app'
        };
    }

    /**
     * 项目发布公用路径定义
     * @returns {{proUrl: string}}
     */
    proDistParam() {
        return {
            'proUrl': '.',
            'proUri': '.'
        };
    }

    /**
     * 读取所有项目配置信息
     * @return {}
     */
    getAllProConfig() {
        let proList = {};
        let confPref = think.config('pro_conf_pref');
        let proConfList = think.config('initpro');
        let allConf = think.config();
        let proArr = new nodeUnique();

        // 首先读取归档后的项目信息
        let archiveDir = './archive';
        let archiveDirs = fs.readdirSync(archiveDir);
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
            let tmpArchiveConfPath = path.join(archiveDir, dirName, confPref + '-' + proSn + '-' + proName + '-conf.json');
            if (fs.existsSync(tmpArchiveConfPath)) {
                // 使用 require 语法时，路径必须带 ./
                // let tmpConf = require('./' + tmpArchiveConfPath);
                let tmpConf = JSON.parse(fs.readFileSync(tmpArchiveConfPath));
                if (!proArr.contains(tmpConf)) {
                    proArr.add(tmpConf);
                }
            } else {
                if (!proArr.contains(tmpInfo)) {
                    proArr.add(tmpInfo);
                }
            }
        });

        // 再读取批量配置文件中的配置信息
        proArr.add(proConfList.pro);
        for (let conf in allConf) {
            if (conf.indexOf(confPref) == 0) {
                for (let pro of allConf[conf].pro) {
                    if (proArr.contains(pro)) {
                        proArr.remove(pro);
                    }
                    proArr.add(pro);
                }
            }
        }

        // 再处理单个配置文件中的配置信息
        let tmpAiproConfPath = './src/common/config/pro';
        let reloadProConfFiles = fs.readdirSync(tmpAiproConfPath);
        reloadProConfFiles.forEach(function (fileName, k) {
            if (fileName.indexOf(confPref) == 0) {
                let tmpPath = path.join(tmpAiproConfPath, fileName);
                if (fs.statSync(tmpPath).isFile()) {
                    // 使用 require 语法时，路径必须带 ./
                    // let tmpConf = require('./' + tmpPath);
                    let tmpConf = JSON.parse(fs.readFileSync(tmpPath));
                    if (!proArr.contains(tmpConf)) {
                        proArr.add(tmpConf);
                    }
                }
            }
        });
        proList.pro = proArr.get();
        // 对合并后的项目信息进行去重
        proList.pro = proList.pro.unique('sn');
        return proList.pro;
    }

    /**
     * 通过条件获取项目配置信息
     * @param conditionK
     * @param conditionV
     * @returns {*}
     */
    getProConfig(conditionK, conditionV) {
        let proConfList = {};
        proConfList.pro = this.getAllProConfig();

        let rs = false;
        for (let pro of proConfList.pro) {
            if (pro[conditionK] === conditionV) {
                rs = pro;
                break;
            }
        }
        return rs;
    }

    /**
     * use empty action to make the display action easy
     * @returns {PreventPromise}
     * @private
     */
    __call() {
        return this.display('app/' + this.http.action);
    }

}


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



