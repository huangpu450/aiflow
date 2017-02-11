'use strict';

import fs from 'fs';
import Common from '../../common/controller/common.js';

export default class extends Common {
    /**
     * 初始化方法
     * @param http
     */
    init(http) {
        super.init(http);

        switch (http.action) {
            case 'index':
                this.assign(this.indexData());
                break;
        }
    }

    /**
     * the index data
     * @returns {{pageTitle: string}}
     */
    indexData() {
        return {
            'pageTitle': this.proConf.sn + '-' + this.proConf.title,
        }
    }

    /**
     * 项目编译
     */
    * makeAction() {
        // 项目发布变量赋值
        this.assign(this.proDistParam());

        let distDir = './www/static/' + this.proConf.name + '/dist';

        let compileArr = [
            {
                name: 'index',
                data: this.indexData()
            }
        ];

        for (var pageObj of compileArr) {
            this.assign(pageObj.data);
            let cont = yield this.fetch('app/' + pageObj.name);
            fs.writeFile(distDir + '/' + pageObj.name + '.html', cont, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        this.success('compile success!');
    }
}