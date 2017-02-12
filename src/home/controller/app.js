'use strict';

import Base from './base.js';
import path from 'path';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    * indexAction() {
        let dir = 'file:///' + path.resolve('.') + '/archive';
        this.assign('baseDir', dir);

        let proConfList = {};
        proConfList.pro = super.getAllProConfig();

        this.assign('proList', proConfList);
        return this.display();
    }
}
