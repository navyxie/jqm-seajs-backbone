define(function(require,exports,module){
    var BB = require('backbone');
    var baseUrl = window.appConfig.appHost+'/app/journal/title';
    var titleModel = BB.Model.extend({
        idAttribute:'id',
        urlRoot:baseUrl,
        url:baseUrl
    });
    module.exports = titleModel;
})