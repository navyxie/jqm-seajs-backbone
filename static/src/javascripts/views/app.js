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
            'tap #likeJounalBtn':'likeJournal'
        },
        likeJournal:function(e){
            $(e.target).toggleClass('unLikeJounalBtn').toggleClass('likedJounalBtn');
            return false;
        },
        handlerTitle:function(){
            var self = this;
            self.$navLi = self.$navContainer.find('.navLi');
            self.$navContainer.on('vclick','.navLi',function(e){
                var _this = $(this);
                if(_this.hasClass('navLi') && !_this.hasClass('selected')){
                    var index = self.$navLi.index(_this);
                    self.addSelectedClass(index);
                    self.initJournalModel({_id:titleCollections.at(index).toJSON()['_id'],id:"pageContent"+index,index:index});
                    // self.journalAnimate.endPage = -self.journalAnimate.oneSlide*index;
                }
            });
        },
        addSelectedClass:function(index){
            this.$navLi.removeClass('selected').eq(index).addClass('selected');
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
                    self.navAnimate = (new TRANSFORM.animateBase(self.$navContainer,{isLimit:false}));                 
                    self.handlerTitle();
                    self.makePageContent(response.length);
                    TRANSFORM.autoWidth(self.$pageList,'.pageContent',true); 
                    self.journalAnimate = new TRANSFORM.animateBase(
                        self.$pageList,
                        {cbfList:{end:function(targetJq,index){
                            self.navAnimate.showNav(index);
                            self.initJournalModel({_id:titleCollections.at(index).toJSON()['_id'],id:"pageContent"+index,index:index});
                        }}}
                    );   
                    var firstJournal = titleCollections.at(0).toJSON();
                    self.initJournalModel({_id:firstJournal['_id'],id:"pageContent0",index:0});                                           
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
            cbf = cbf || $.noop;
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
                                self.journalAnimate.showItem(journalData['index']);                               
                            }else{
                                journalModelMap[journalData['_id']]['loaded'] = false;
                            }
                            cbf(err,data);
                        }
                    );
                }else{
                    self.journalAnimate.showItem(journalData['index']);
                }
            }else{
                self.journalAnimate.showItem(journalData['index']);
            }
            self.$navLi.eq(journalData['index']).addClass('selected');
        } 
    });
    module.exports = appView;
})