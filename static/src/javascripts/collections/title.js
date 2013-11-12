define(function(require,exports,module){
    var _ = require('underscore');
    var BB = require('backbone');
    var titleModel = require('../models/title');
    var baseUrl = window.appConfig.appHost+'/app/journal/title';
    var titleCollection = BB.Collection.extend({
        model:titleModel,
        url:baseUrl
    });
    module.exports = titleCollection;
})