/**
 * the common controller of the project
 *
 * @author: yunzhi li
 * @version: 2016/9/29 20:42
 *           $Id$
 */

'use strict';
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
     * 通过条件获取项目配置信息
     * @param conditionK
     * @param conditionV
     * @returns {*}
     */
    getProConfig(conditionK, conditionV) {
        let confPref = think.config('pro_conf_pref');
        let proConfList = think.config('initpro');
        let allConf = think.config();
        let proArr = new nodeUnique();
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
        proConfList.pro = proArr.get();
        // proConfList.pro = this.assign(proConfList.pro, 'sn');
        // console.log(proConfList.pro);
        // process.exit();
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
     * 数组去重
     *
     * @param arr
     * @param key
     * @returns {*}
     */
    arrUnique(arr, key) {
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

    /**
     * use empty action to make the display action easy
     * @returns {PreventPromise}
     * @private
     */
    __call() {
        return this.display('app/' + this.http.action);
    }

}






