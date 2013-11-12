define(function(require,exports,module){
    var $ = require('jqmobile');
    var BB = require('backbone');
    var titleView = require('./title');
    var titleCollections = new (require('../collections/title'));
    var UTIL = require('../vendors/util');
    var appView = BB.View.extend({
        initialize:function(){
            var self = this;                     
            titleCollections.bind('add',this.addOneNav,this);
            titleCollections.bind('reset',this.addAllNav,this); 
            self.$navContainer = $('#titleNav');    
            self.fetchTitle();       
        },
        el:'body',
        render:function(){
            return this;
        },
        addOneNav:function(model){
            this.$navContainer.append(new titleView({model:model}).render().el);
        },
        addAllNav:function(){
            var self = this;
            titleCollections.each(function(){
                self.addOneNav.apply(self,arguments);
            });
        },
        fetchTitle:function(){
            titleCollections.fetch({
                success:function(model, response, options){
                    console.log(response);
                    console.log(titleCollections);
                },
                error:function(){

                },
                reset:true
            });
        }
    });
    module.exports = appView;
})