'use strict';

import Base from './base.js';

export default class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    * indexAction() {
        let proList = think.config('aipro');
        this.assign('proList', proList);
        return this.display();
    }
}
