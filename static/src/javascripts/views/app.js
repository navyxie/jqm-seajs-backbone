define(function(require,exports,module){
    var $ = require('jqmobile');
    var BB = require('backbone');
    var titleView = require('./title');
    var titleCollections = new (require('../collections/title'));
    var UTIL = require('../vendors/util');
    var TRANSFORM = UTIL.TRANSFORM;
    var appView = BB.View.extend({
        initialize:function(){
            var self = this;                     
            titleCollections.bind('add',this.addOneNav,this);
            titleCollections.bind('reset',this.addAllNav,this); 
            self.$navContainer = $('#titleNav');    
            self.fetchTitle();       
        },
        el:'body',
        events:{
        },
        handlerTitle:function(){
            var self = this;
            self.$navContainer.on('vclick','.navLi',function(e){
                var self = $(this);
                if(self.hasClass('navLi')){
                    console.log(self);
                }
            });
        },
        render:function(){
            return this;
        },
        addOneNav:function(model){
            this.$navContainer.append(new titleView({model:model}).render().el);
            TRANSFORM.autoWidth(this.$navContainer);
        },
        addAllNav:function(){
            var self = this;
            titleCollections.each(function(){
                self.addOneNav.apply(self,arguments);
            });
        },
        fetchTitle:function(){
            var self = this;
            titleCollections.fetch({
                success:function(model, response, options){
                    new TRANSFORM.animateBase(self.$navContainer,{isLimit:false,cbfList:{start:function(jq){console.log(jq)}}});
                    self.handlerTitle();
                },
                error:function(){
                }
            });
        }
    });
    module.exports = appView;
})