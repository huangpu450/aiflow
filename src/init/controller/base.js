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
        // when the action is make, it doesn't need assign data to the front page
        if (this.http.action !== 'make') {
            let pageData = this.makePageData(this.http.action);
            this.assign(pageData);
        }
    }

    /**
     * 拼接各页面标题
     * @param actionName
     * @returns {*}
     */
    makePageData(actionName) {
        let dataConf = this.config('data.pages');
        let pageData = dataConf[actionName];

        pageData.pageTitle = /*this.proConf.sn + '-' + */pageData.title;
        return pageData;
    }

    /**
     * 项目编译
     */
    // * makeAction() {
    async makeAction() {
        // 项目发布变量赋值
        this.assign(this.proDistParam());

        let distDir = './www/static/' + this.proConf.name + '/dist';

        let dataConf = this.config('data.pages');
        let compileArr = [];
        let i = 0;
        for (let pageName in dataConf) {
            let pageData = this.makePageData(pageName);
            compileArr[i] = {
                name: pageName,
                data: pageData
            };
            i++;
        }

        for (var pageObj of compileArr) {
            this.assign(pageObj.data);
            // assign the data for start page
            if (pageObj.name == 'start') {
                let pageData = this.config('data.pages');
                delete pageData.start;
                this.assign('pageData', pageData);
            }
            // let cont = yield this.fetch('app/' + pageObj.name);
            let cont = await this.fetch('app/' + pageObj.name);
            // fs.writeFile(distDir + '/' + pageObj.name + '.html', cont, function (err) {
            //     if (err) {
            //         throw err;
            //     }
            // });
            // 将编译文件改为同步方法
            fs.writeFileSync(distDir + '/' + pageObj.name + '.html', cont);
        }

        this.success('compile success!');
        // 完成之后，进程退出
        // 只能在命令行下生效，浏览器端会被退出
        // 存在问题
        // process.exit();
        // 将其改为同步调用
        await process.exit();
    }
}