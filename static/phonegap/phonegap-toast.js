var toast = function(){};
toast.prototype = {
        ShowToast:function(content,length){
            return cordova.exec(null, null,"ToastPlugin","toast",[content,length]);
        }
};
cordova.addConstructor(function(){
    if (!window.plugins) {
        window.plugins = {};
    }
    window.plugins.ToastPlugin = new toast();
 
});
