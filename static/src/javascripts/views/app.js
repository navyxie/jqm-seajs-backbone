define(function(require,exports,module){
    var $ = require('jqmobile');
    var BB = require('backbone');
    var titleView = require('./title');
    var titleCollections = new (require('../collections/title'));
    var journalView = require('./journal');
    var UTIL = require('../vendors/util');
    var LOAD = UTIL.LOAD;
    var TRANSFORM = UTIL.TRANSFORM;
    var journalModelMap = {};
    var appView = BB.View.extend({
        initialize:function(){
            var self = this;                     
            titleCollections.bind('add',this.addOneNav,this);
            titleCollections.bind('reset',this.addAllNav,this); 
            self.$navContainer = $('#titleNav');
            self.$pageList = $('#pageList'); 
            self.fetchTitle();       
        },
        el:'body',
        events:{
        },
        handlerTitle:function(){
            var self = this;
            self.$navLi = self.$navContainer.find('.navLi');
            self.$navContainer.on('vclick','.navLi',function(e){
                var _this = $(this);
                if(_this.hasClass('navLi')){
                    self.$navLi.removeClass('selected');
                    _this.addClass('selected');
                }
            });
        },
        render:function(){
            return this;
        },
        addOneNav:function(model){
            this.$navContainer.append(new titleView({model:model}).render().el);           
            TRANSFORM.autoWidth(this.$navContainer);
            journalModelMap[model.get('_id')] = {id:null,loaded:false};
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
                    new TRANSFORM.animateBase(self.$navContainer,{isLimit:false});                 
                    self.handlerTitle();
                    self.makePageContent(response.length);
                    TRANSFORM.autoWidth(self.$pageList,'.pageContent',true); 
                    // new TRANSFORM.animateBase(self.$pageList,{isLimit:true});   
                    var firstJournal = titleCollections.at(0).toJSON();
                    self.initJournalModel({_id:firstJournal['_id'],id:"pageContent0"});                                           
                },
                error:function(){
                }
            });
        },
        makePageContent:function(len){
            var html = '';
            for(var i = 0 ; i < len ; i++){
                html += '<li class="pageContent" id="pageContent'+i+'" index='+i+'></li>';
            }
            this.$pageList.append(html);           
        },
        initJournalModel:function(journalData,cbf){
            var self = this;
            if(!(journalModelMap[journalData['_id']])['id']){
                (journalModelMap[journalData['_id']])['id'] = new journalView({el:'#'+journalData['id']});
                var isLoading = false;
                if(!(journalModelMap[journalData['_id']])['loaded']){
                    (journalModelMap[journalData['_id']])['loaded'] = true;
                    (journalModelMap[journalData['_id']])['id'].fetchData(
                        {
                            'id':journalData['_id']
                        },
                        function(err,data){
                            if(!err){

                            }else{
                                journalModelMap[journalData['_id']]['loaded'] = false;
                            }
                        }
                    );
                }
            }
        } 
    });
    module.exports = appView;
})