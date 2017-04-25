'use strict';

import Base from './base.js';

export default class extends Base {
    // add custom action like this
    /**
     * index action
     * @return {Promise} []
     */
    // indexAction() {
    //     return this.display();
    // }
    * startAction() {
        let pageData = this.config('data.pages');
        this.assign('pageData', pageData);
        return this.display();
    }
}