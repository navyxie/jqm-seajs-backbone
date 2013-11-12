define(function(require,exports,module){
	var BB = require('backbone');
    var baseUrl = window.appConfig.appHost+'/collector/mobile/journal';
    var journalModel = BB.Model.extend({
        idAttribute:'_id',
        urlRoot:baseUrl,
        url:baseUrl,
        parse:function(response){
            return response;
        }
    });
    module.exports = journalModel;
})