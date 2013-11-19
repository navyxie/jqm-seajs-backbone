define(function(require, exports, module){
    var $ = require('jquery');
    var _ = require('underscore');
    var taoBaoImgSize = [40,60,80,100,120,160,180,200,240,250,300,310,320,360,400,460,600];//淘宝图片尺寸
    var englishM = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec");
    var waterFallColWidth = 304;
    var prefix = 'cbdapp';
    var eventMap= ['vmousedown','vmousemove','vmouseup','vmouseout'];
    var $doc = $(document);
    function isType(object,type){
        type = type || 'string';
        if(typeof(type) !== 'string'){
            throw new Error('type must be string');
        }
        return Object.prototype.toString.call(object).slice(8,-1).toLowerCase() === type.toLowerCase();
    }
    var UTIL = {};
    UTIL.TPL = {
        templates:{},
        loadTemplates:function(names,cbf){
            if(isType(names,'string')){
                names = [names];
            }
            if(!isType(names,'array')){
                throw new Error('templateName must be array or string');
            }
            var self = this;
            var tplLength = names.length;
            var loadTemplate = function(index){
                var name = names[index];
                if(self.templates[name] === undefined){
                    $.get('./static/src/javascripts/tpls/'+name+'.html',function(data){
                        self.templates[name] = data;
                        if(++index < tplLength){
                            loadTemplate(index);
                        }else{
                            cbf();
                        }
                    })
                }else{
                    if(++index < tplLength){
                        loadTemplate(index);
                    }else{
                        cbf();
                    }            
                }
            }
            loadTemplate(0);
        },
        get:function(name){
            return this.templates[name];
        }
    }
    UTIL.WaterFall = function(col){
        this.col = col;
        this.water = [];
        this.init();
    }
    UTIL.WaterFall.prototype.init = function(){
        var col = this.col;
        for(var i = 0 ; i < col ; i ++){
            this.water[i] = 0;
        }
    }
    UTIL.WaterFall.prototype.getMinIndex = function(){
        return _.indexOf(this.water,_.min(this.water));
    }
    UTIL.WaterFall.prototype.getMaxIndex = function(){
        return _.indexOf(this.water,_.max(this.water));
    }
    UTIL.WaterFall.prototype.pushItem = function(val){
        var self = this;
        self.water[self.getMinIndex()] += val;
        return self.water;
    }
    UTIL.WaterFall.prototype.getParam = function(){
        return {col:this.col,water:this.water};
    }
    UTIL.WaterFall.prototype.makeColHtml = function(){
        var html = '';
        for(var i = 0 ; i < this.col ; i++){
            var colClass = 'waterCol';
            if(i === 0){
                colClass += ' firstCol';
            }else if(i === this.col-1){
                colClass += ' lastedCol'
            }
            html += '<div class="'+colClass+'"></div>';
        }
        return html;
    }
    UTIL.Date = {
        getEnglishMonth:function(month){
            return englishM[month]
        },
        getDate:function(split,daySpace){
            split = split || '/';
            daySpace = daySpace || 0;
            var timestamp = new Date().getTime();
            timestamp = new Date(timestamp + daySpace*24*60*60*1000);
            return timestamp.getFullYear()+split+(1+timestamp.getMonth())+split+timestamp.getDate()
        },
        translateIOSDate:function(date){
            return date.substr(0,date.indexOf('T')).split('-').join('/')
        }
    }
    UTIL.TRANSFORM = {
        translate3d:function(jqObj,dist,speed){
            jqObj = $(jqObj);
            speed = speed || 0;
            dist = $.extend({x:0,y:0,z:0},dist);
            var style = jqObj[0].style;
            if (!style) return;
            style.webkitAnimationFillMode = 
            style.MozAnimationFillMode = 
            style.msAnimationFillMode = 
            style.OAnimationFillMode = 'forwards';
            style.webkitTransform
            style.MozTransitionDuration = 
            style.msTransitionDuration = 
            style.OTransitionDuration = 
            style.transitionDuration = speed + 'ms';
            style.webkitTransform = 'translate(' + dist.x + 'px,0)' + 'translateZ(0)';
            //style.webkitTransform = 'translate(' + dist.x + 'px,'+dist.y+'px)' + 'translateZ('+dist.z+'px)';
            style.msTransform = 
            style.MozTransform = 
            style.OTransform = 'translateX(' + dist.x + 'px)';
            //style.OTransform = 'translate(' + dist.x + 'px,'+dist.y+'px)' + 'translateZ('+dist.z+'px)';
        },
        autoWidth:function(jq,subClassName,fixed,marginR){
            $jq = $(jq);
            var width = 0;
            fixed = fixed || false;
            marginR = marginR || 0;
            var parentWidth = $jq.parent().width();
            if((typeof(subClassName) === 'undefined' ? (subClassName = 'li') : subClassName = subClassName) && typeof(subClassName) === 'string'){
                var subObjs = $jq.find(subClassName);
                var len = subObjs.length;
                if(len){
                    subObjs.each(function(index){
                        var _this = $(this);
                        if(fixed){
                            if(++index === len){
                                _this.css({'float':'left','width':parentWidth+'px'});
                            }else{
                                _this.css({'float':'left','margin-right':marginR+'px','width':parentWidth+'px'});
                            }
                            
                        }
                        width += _this.outerWidth(true);
                    });
                }
            }else if(typeof(subClassName) === 'number'){
                width = parentWidth*subClassName;
            }                  
            $jq.width(width);
        },
        animateBase:function(jq,options){
            options = options || {};
            var defaultOptions = {
                direct:'h',//
                space:10,
                slideP:10,//px
                rangeP:100,//px
                marginR:0,
                subElement:'li',
                isLimit:true,
                cbfList:{
                    start:$.noop,
                    moving:$.noop,
                    end:$.noop
                },
                index:0
            };
            if(options.cbfList && !(_.isEmpty(options.cbfList))){
                $.extend(defaultOptions.cbfList,options.cbfList);
                delete options.cbfList 
            }
            $.extend(defaultOptions,options);
            this.defaultOptions = defaultOptions;
            this.jq = $(jq); 
            this.startPage = {x:0,y:0};
            this.deltaPage = {x:0,y:0};
            this.endPage = {x:0,y:0};
            this.isMouseDown = false;
            this.rangeStartX = 0;
            this.rangeEndX = 0;
            this.oneSlide = 0;
            this.index = this.defaultOptions.index;
            this.preIndex = this.defaultOptions.index;
            this.setTimeoutFlag = null;
            this.isScrolling = undefined;//true为水平方向，false为垂直方向
            this.init();
        }
    }
    UTIL.TRANSFORM.animateBase.prototype = {
        init:function(){
            this.jq.wrapAll('<div class="animateWrap" style="width:100%;overflow: hidden;"></div>');
            this.wrapObj = this.jq.parent('.animateWrap');
            this.targetObj = this.jq.find(this.defaultOptions.subElement);
            var len = this.targetObj.length;
            this.targetObj.len = len;
            if(len){
                if(this.jq.width() <= this.wrapObj.width()){
                    return false;
                }
                if(this.index >= len-1){
                    this.index = len -1;
                }
                if(this.defaultOptions.isLimit){
                    this.oneSlide = this.wrapObj.width();
                    this.rangeEndX = this.oneSlide*(len - 1);
                }else{
                    this.oneSlide = $(this.targetObj[0]).outerWidth();
                    this.rangeEndX = this.jq.width() - this.wrapObj.width();
                }
                this.rangeStartX = this.defaultOptions.rangeP;
                this.showItem(this.index);          
                this.initEvent();
                if(this.defaultOptions.isLimit){
                    this.showItem(this.index);
                }else{
                    this.showNav(this.index);
                }
            }
        },
        initEvent:function(){
            var self = this;
            self.wrapObj.on(eventMap.join(' '),this.defaultOptions.subElement,function(e){
                var _this = $(this);
                // var eTarget = e;
                // if(UTIL.OS.isMobile()){
                //     eTarget = eTarget.originalEvent.touches[0];
                // }
                switch(e.type){
                    case eventMap[0]:
                        self.startMove(e,_this);
                        break;
                    case eventMap[1]:
                        return self.moving(e,_this);
                        break;
                    case eventMap[2]:
                        return self.endMove(e,_this);
                        break;
                }
            });
        },
        startMove:function(e,targetJq){
            var self = this;
            e = e.originalEvent.touches ?
                    e.originalEvent.touches[ 0 ] : e;
            self.startPage = {x:e.pageX,y:e.pageY};
            self.deltaPage = {x:0,y:0};
            self.isMouseDown = true;
            self.isScrolling = undefined;
            self.defaultOptions.cbfList.start(targetJq,self.index);
        },
        moving:function(e,targetJq){
            var self = this;
            e = e.originalEvent.touches ?
                    e.originalEvent.touches[ 0 ] : e;
            var returnVal = false;
            if(!self.isMouseDown){
                returnVal =  false;
            }else{
                self.deltaPage = {x:e.pageX - self.startPage.x,y:e.pageY - self.startPage.y};
                if (typeof self.isScrolling == 'undefined') {
                    self.isScrolling = !!( self.isScrolling || Math.abs(self.deltaPage.x) < Math.abs(self.deltaPage.y) );
                }
                if(!self.isScrolling && Math.abs(self.deltaPage.x)>(self.defaultOptions.space)){
                    e.preventDefault();
                    if(self.defaultOptions.isLimit && (Math.abs(self.deltaPage.y) > Math.abs(self.deltaPage.x))){
                        returnVal =  true;
                    }else{
                        var movePageX = self.endPage.x+self.deltaPage.x;
                        if(self.endPage.x === 0 && self.deltaPage.x > self.rangeStartX){
                            // if currentTarget is the first, moveRight maxValue is this.rangeStartX
                            self.deltaPage.x = movePageX = self.rangeStartX;
                        }else if(self.endPage.x === -self.rangeEndX && self.deltaPage.x < -self.rangeStartX){
                            // if currentTarget is the last ,moveLeft maxValue is negative this.rangeStartX
                            movePageX = self.endPage.x - self.rangeStartX;
                            self.deltaPage.x = -self.rangeStartX;
                        }
                        UTIL.TRANSFORM.translate3d(self.jq,{x:movePageX});
                        self.defaultOptions.cbfList.moving(targetJq,self.index);
                        returnVal =  false;
                    }              
                }else{
                    returnVal = true;
                }               
            }
            return returnVal;
        },  
        endMove:function(e,targetJq){
            var self = this;
            e = e.originalEvent.touches ?
                    e.originalEvent.touches[ 0 ] : e;
            var returnVal = false;
            // alert(Math.abs(e.pageY - self.startPage.y) > Math.abs(e.pageX - self.startPage.x));
            if (!self.isScrolling){
                if(self.defaultOptions.isLimit){              
                    if(Math.abs(e.pageY - self.startPage.y) > Math.abs(e.pageX - self.startPage.x)){
                        returnVal = true;
                    }else{
                        var endDeltaX = self.deltaPage.x,endDeltay = self.deltaPage.y;
                        var slideP = self.defaultOptions.slideP;
                        if(endDeltaX > 0){
                            // move left
                            if(endDeltaX < slideP){
                                // if move Value is less than this.oneSlide*slideP ,reset to prev statue
                                endDeltaX = self.endPage.x;               
                            }else{
                                // else move to next target
                                endDeltaX = self.endPage.x = (self.endPage.x + self.oneSlide);
                                --self.index;
                            }
                        }else{
                            // move right
                            if(endDeltaX > -(slideP)){
                                endDeltaX = self.endPage.x; 
                            }else{
                                endDeltaX = self.endPage.x = (self.endPage.x - self.oneSlide);
                                ++self.index;
                            }
                        }
                        if(endDeltaX >= 0 ){
                            self.endPage.x = endDeltaX = self.index = 0;
                        }else if(endDeltaX <= -self.rangeEndX){
                            self.endPage.x = endDeltaX = -self.rangeEndX;
                            self.index = this.targetObj.len-1;
                        }
                        // UTIL.TRANSFORM.translate3d(self.jq,{x:endDeltaX},500);
                        // UTIL.TOOL.backTop();
                        self.showItem(self.index);
                        returnVal = false;  
                    }            
                }else{
                    self.endPage.x += self.deltaPage.x;
                    if(self.endPage.x >= 0){
                        self.endPage.x = 0;
                        UTIL.TRANSFORM.translate3d(self.jq,{x:0},500);
                    }else if(self.endPage.x <= -self.rangeEndX){
                        self.endPage.x = -self.rangeEndX;
                        UTIL.TRANSFORM.translate3d(self.jq,{x:-self.rangeEndX},500);
                    }
                    returnVal = false;
                }
                self.defaultOptions.cbfList.end(targetJq,self.index);
            }else{
                returnVal = true;
            }          
            self.startPage = {x:0,y:0};
            self.isMouseDown = false;
            return returnVal;
        },
        showItem:function(index){
            var self = this;          
            self.endPage = {x:-index*(self.oneSlide),y:0};
            self.index = index;
            self.jq.height(self.targetObj.eq(index).outerHeight(true));
            // if(self.setTimeoutFlag){
            //     clearTimeout(self.setTimeoutFlag);
            // }
            // self.setTimeoutFlag = setTimeout(function(){self.jq.height(self.targetObj.eq(index).outerHeight(true))},20);
            if(self.index !== self.preIndex){
                UTIL.TOOL.backTop(function(){UTIL.TRANSFORM.translate3d(self.jq,{x:-index*(self.oneSlide)},50)});
                self.preIndex =  self.index;
            }else{
                UTIL.TRANSFORM.translate3d(self.jq,{x:-index*(self.oneSlide)},500);
            }                   
        },
        getIndex:function(){
            return this.index;
        },
        showNav:function(index){
            var self = this;
            if(!self.defaultOptions.isLimit){
                var width = 0;
                var animateWidth = 0;
                var wrapWidth = self.wrapObj.width();
                //self.$targetObj.removeClass('selected').eq(index).addClass('selected');
                for(var i = 0; i <= index ;i++){
                    width += $(self.targetObj[i]).outerWidth();
                }
                if(width > wrapWidth){
                    animateWidth = width - wrapWidth;
                }
                self.targetObj.removeClass('selected').eq(index).addClass('selected');
                UTIL.TRANSFORM.translate3d(self.jq,{x:-animateWidth},500);
                self.endPage = {x:-animateWidth,y:0};
                self.index = index;
            }
        }
    }
    UTIL.LOAD = {
        show:function(){
            $('#gloabLoading').stop(true,true).fadeIn();
        },
        hide:function(){
            $('#gloabLoading').stop(true,true).fadeOut();
        }
    }
    UTIL.getWaterFalColWidth = function(){
        return waterFallColWidth;
    }
    UTIL.setWaterFalColWidth = function(val){
        waterFallColWidth = val;
    }
    UTIL.OS = {
        detect:function(ua){
            var os = this.os = {}, browser = this.browser = {},
            webkit = ua.match(/WebKit\/([\d.]+)/),
            android = ua.match(/(Android)\s+([\d.]+)/),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
            webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            touchpad = webos && ua.match(/TouchPad/),
            kindle = ua.match(/Kindle\/([\d.]+)/),
            silk = ua.match(/Silk\/([\d._]+)/),
            blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
            bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
            rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            playbook = ua.match(/PlayBook/),
            chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            firefox = ua.match(/Firefox\/([\d.]+)/)

            // Todo: clean this up with a better OS/browser seperation:
            // - discern (more) between multiple browsers on android
            // - decide if kindle fire in silk mode is android or not
            // - Firefox on Android doesn't specify the Android version
            // - possibly devide in os, device and browser hashes

            if (browser.webkit = !!webkit) browser.version = webkit[1]

            if (android) os.android = true, os.version = android[2]
            if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
            if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
            if (webos) os.webos = true, os.version = webos[2]
            if (touchpad) os.touchpad = true
            if (blackberry) os.blackberry = true, os.version = blackberry[2]
            if (bb10) os.bb10 = true, os.version = bb10[2]
            if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
            if (playbook) browser.playbook = true
            if (kindle) os.kindle = true, os.version = kindle[1]
            if (silk) browser.silk = true, browser.version = silk[1]
            if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
            if (chrome) browser.chrome = true, browser.version = chrome[1]
            if (firefox) browser.firefox = true, browser.version = firefox[1]

            os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
            os.phone  = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 ||
            (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))));
            return {os:os,browser:browser};
        },
        oldAndroid:function(){
            var os = UTIL.OS.detect(navigator.userAgent);
            var flag = false;
            if(os.os['android'] && parseInt(os.os['version'].slice(0,1)) < 3){
                flag = true;
            }
            return flag;
        },
        isMobile:function(){
            var os = UTIL.OS.detect(navigator.userAgent);
            return (os.os.phone || os.os.tablet);
        }
    }
    UTIL.URL = {
        getHash:function(){
            var hashVal = window.location.hash;
            var val = '';
            if(hashVal){
                val = hashVal.slice(1);
                val = val.split('/');
            }
            return val;
        }
    }
    UTIL.TOOL = {
        getPicSize:function(){
            var colSize = UTIL.getWaterFalColWidth();
            var ajustSize = taoBaoImgSize[0];
            for(var i = 1, len = taoBaoImgSize.length ; i < len ; i++){
                if(colSize <= taoBaoImgSize[i]){
                    ajustSize = taoBaoImgSize[i];
                    break;
                }
            }
            return ajustSize;
        },
        backTop:function(cbf){
            cbf = cbf || noop;
            $('body').stop().animate({'scrollTop':0},0,cbf);
        }
    }
    UTIL.STORE = {
        setItem:function(key,val){
            window.localStorage.setItem(prefix+key,JSON.stringify(val));
        },
        getItem:function(key){
            return JSON.parse(window.localStorage.getItem(prefix+key));
        },
        removeItem:function(key){
            window.localStorage.removeItem(prefix+key);
        }
    }
    !function(){
        if(UTIL.OS.isMobile()){
            // eventMap = ['touchstart','touchmove','touchend','touchcancel'];
        }       
    }()
    module.exports = UTIL;
})