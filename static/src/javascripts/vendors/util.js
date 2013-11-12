define(function(require, exports, module){
    var $ = require('jquery');
    var _ = require('underscore');
    var taoBaoImgSize = [40,60,80,100,120,160,180,200,240,250,300,310,320,360,400,460,600];//淘宝图片尺寸
    var englishM = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec");
    var waterFallColWidth = 304;
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
            style.MozTransitionDuration = 
            style.msTransitionDuration = 
            style.OTransitionDuration = 
            style.transitionDuration = speed + 'ms';
            style.webkitTransform = 'translate(' + dist.x + 'px,'+dist.y+'px)' + 'translateZ('+dist.z+'px)';
            style.msTransform = 
            style.MozTransform = 
            style.OTransform = 'translate(' + dist.x + 'px,'+dist.y+'px)' + 'translateZ('+dist.z+'px)';
        },
        autoWidth:function(jq,subClassName){
            $jq = $(jq);
            var width = 0;
            if((typeof(subClassName) === 'undefined' ? (subClassName = 'li') : '') && typeof(subClassName) === 'string'){
                var subObjs = $jq.find(subClassName);
                if(subObjs.length){
                    subObjs.each(function(){
                        width += $(this).outerWidth();
                    })
                }
            }else if(typeof(subClassName) === 'number'){
                width = $jq.parent().width()*subClassName;
            }                  
            $jq.width(width);
        },
        animateBase:function(jq,options){
            var defaultOptions = {
                direct:'h',//
                space:5,
                slideP:5,//px
                rangeP:100,//px
                marginR:0,
                subElement:'li',
                isLimit:true,
                cbfList:{
                    start:$.noop,
                    moving:$.noop,
                    end:$.noop
                }
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
            this.init();
        }
    }
    UTIL.TRANSFORM.animateBase.prototype = {
        init:function(){
            this.jq.wrapAll('<div class="animateWrap" style="width:100%;overflow: hidden;"></div>');
            this.wrapObj = this.jq.parent('.animateWrap');
            this.targetObj = this.jq.find(this.defaultOptions.subElement);
            if(this.defaultOptions.isLimit){
                this.oneSlide = this.wrapObj.width();
                this.rangeEndX = this.oneSlide*(this.targetObj.length - 1);
            }else{
                this.oneSlide = $(this.targetObj[0]).outerWidth();
                this.rangeEndX = this.jq.width() - this.wrapObj.width();
            }
            this.rangeStartX = this.defaultOptions.rangeP;          
            this.initEvent();
        },
        initEvent:function(){
            var self = this;
            self.wrapObj.on('vmousedown vmousemove vmouseout vmouseup',this.defaultOptions.subElement,function(e){
                var _this = $(this);
                switch(e.type){
                    case 'vmousedown':
                        self.startMove(e,_this);
                        break;
                    case 'vmousemove':
                        self.moving(e,_this);
                        return false;
                        break;
                    case 'vmouseout':
                    case 'vmousedown':
                        self.endMove(e,_this);
                        return false;
                        break;
                }
            });
        },
        startMove:function(e,targetJq){
            this.startPage = {x:e.pageX,y:e.pageY};
            this.deltaPage = {x:0,y:0};
            this.isMouseDown = true;
            this.defaultOptions.cbfList.start(targetJq);
        },
        moving:function(e,targetJq){
            if(!this.isMouseDown){
                return false;
            }
            this.deltaPage = {x:e.pageX - this.startPage.x,y:e.pageY - this.startPage.y};
            var movePageX = this.endPage.x+this.deltaPage.x;
            if(this.endPage.x === 0 && this.deltaPage.x > this.rangeStartX){
                // if currentTarget is the first, moveRight maxValue is this.rangeStartX
                this.deltaPage.x = movePageX = this.rangeStartX;
            }else if(this.endPage.x === -this.rangeEndX && this.deltaPage.x < -this.rangeStartX){
                // if currentTarget is the last ,moveLeft maxValue is negative this.rangeStartX
                movePageX = this.endPage.x - this.rangeStartX;
                this.deltaPage.x = -this.rangeStartX;
            }
            UTIL.TRANSFORM.translate3d(this.jq,{x:movePageX});
            this.defaultOptions.cbfList.moving(targetJq);
        },
        endMove:function(e,targetJq){
            var self = this;
            if(this.defaultOptions.isLimit){
                var endDeltaX = this.deltaPage.x,endDeltay = this.deltaPage.y;
                var slideP = this.defaultOptions.slideP;
                if(endDeltaX > 0){
                    // move left
                    if(endDeltaX < this.oneSlide*slideP){
                        // if move Value is less than this.oneSlide*slideP ,reset to prev statue
                        endDeltaX = this.endPage.x = endDeltaX;               
                    }else{
                        // else move to next target
                        endDeltaX = this.endPage.x = (this.endPage.x + this.oneSlide);
                    }
                }else{
                    // move right
                    if(endDeltaX > -(this.oneSlide*slideP)){
                        endDeltaX = this.endPage.x = endDeltaX; 
                    }else{
                        endDeltaX = this.endPage.x = (this.endPage.x - this.oneSlide);
                    }
                }
                UTIL.TRANSFORM.translate3d(this.jq,{x:endDeltaX},500);
            }else{
                this.endPage.x += this.deltaPage.x;
                if(this.endPage.x >= 0){
                    this.endPage.x = 0;
                    UTIL.TRANSFORM.translate3d(this.jq,{x:0},500);
                }else if(this.endPage.x <= -self.rangeEndX){
                    this.endPage.x = -self.rangeEndX;
                    UTIL.TRANSFORM.translate3d(this.jq,{x:-self.rangeEndX},500);
                }
            }
            this.defaultOptions.cbfList.end(targetJq);          
            this.startPage = {x:0,y:0};
            this.isMouseDown = false;
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
        }
    }
    module.exports = UTIL;
})