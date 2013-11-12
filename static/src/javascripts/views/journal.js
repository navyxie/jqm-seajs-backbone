define(function(require,exports,module){
	var _ = require('underscore'),BB = require('backbone'),UTIL = require('../vendors/util'),$ = require('jquery');
    var waterFallCol = 2,WaterFall = UTIL.WaterFall,DATE = UTIL.Date,LOAD = UTIL.LOAD,setWaterFalColWidth = false,winObj = $(window),winHeight = winObj.height(),headerHeight = $('#index').find('.header').height();
	var journalView = BB.View.extend({
		className:'journalView',
		initialize:function(){
            var self = this;
            self.queryObj = _.extend({type:'index'},(arguments[0]['query'] || {})); 
        },
        firstLoad:function(){
        	var self = this;
        	self.fetchData(function(err,params){
                if(!err){
                    var response = params[1];
                    if(response.journal){
                        self.renderTitle(response);   
                        self.renderItems(response); 
                    }
                }
            });
        },
        events:{          
        },
        fetchData:function(cbf){
            var self = this;
            LOAD.show();
            self.journalModel.fetch({
                data:self.queryObj,
                success:function(model, response, options){
                    cbf(null,arguments);
                    LOAD.hide();     
                },
                error:function(){
                    alert('获取数据失败,请检查网络');
                    console.log('+++++++++++++++++++');
                    console.log(window.appConfig.appHost);
                    console.log(JSON.stringify(self.queryObj));
                    console.log(self.journalModel.url);
                    console.log('------------------');
                    cbf({err:'获取数据失败'},arguments);
                    LOAD.hide();     
                }
            }); 
        },
        refreshView:function(){
            var self = this;
            self.fetchData(function(err,params){
                if(!err){
                    var response = params[1];
                    if(response.journal){
                        self.journalTitleObj.html('');
                        self.waterFallObj.html('');
                        self.renderTitle(response);   
                        self.renderItems(response); 
                    }
                }
            })
        },
        render:function(){
            return this;
        },
        addOne:function(model){
        	var self = this;
            var initItemView = new self.itemView({model:model});
            $(self.waterFallObj[self.waterObj.getMinIndex()]).append(initItemView.render().el);
            self.waterObj.pushItem(model.toJSON()['pic_size']['h']);
        },
        addAll:function(){
            var self = this;
            self.itemCollection.each(function(){
                self.addOne.apply(self,arguments);
            });
        }
	});
	module.exports = journalView
})