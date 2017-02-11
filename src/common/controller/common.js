/**
 * the common controller of the project
 *
 * @author: yunzhi li
 * @version: 2016/9/29 20:42
 *           $Id$
 */

'use strict';

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
        let proConfList = think.config('aipro');
        let rs = false;
        for (let pro of proConfList.pro) {
            if (pro[conditionK] === conditionV) {
                rs = pro;
                break;
            }
        }
        return rs;
    }


}






