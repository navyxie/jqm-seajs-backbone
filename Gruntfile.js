module.exports = function(grunt){
     // var transport = require('grunt-cmd-transport');
     // var style = transport.style.init(grunt);
     // var text = transport.text.init(grunt);
     // var script = transport.script.init(grunt);
     grunt.initConfig({
          pkg : grunt.file.readJSON("package.json"),
          jshint: {
               all: ['static/src/javascripts/**/*.js','!static/src/javascripts/**/*.min.js'] //files to lint
          },
          transport : {
               options : {
                    paths : ['.'],
                    alias: '<%= pkg.spm.alias %>'
                    // parsers : {
                    //      '.js' : [script.jsParser],
                    //      '.css' : [style.css2jsParser],
                    //      '.html' : [text.html2jsParser]
                    // }
               },
               static : {
                    options:{
                         idleading : 'static/'
                    },
                    files : [
                         {
                             cwd : 'static/src/javascripts/',
                             src : '**/*',
                             filter : 'isFile',
                             dest : '.build/javascripts'
                         }
                     ]
               }
          },
          concat : {
               options : {
                    separator: ';' //separates scripts
               },
               dist : {
                    src:['.build/javascripts/**/*.js'],
                    dest:'static/build/application.js'
               }
          },
          uglify : {
               js:{
                    files:{
                         'static/dist/application.min.js':['static/build/application.js']
                    }
               }         
          },
          clean : {
               build : ['.build'] //清除.build文件
          }
     });
     grunt.loadNpmTasks('grunt-contrib-jshint');
     grunt.loadNpmTasks('grunt-cmd-transport');
     grunt.loadNpmTasks('grunt-cmd-concat');
     grunt.loadNpmTasks('grunt-contrib-uglify');
     grunt.loadNpmTasks('grunt-contrib-clean');
     grunt.registerTask('cbdapp',['transport','concat','uglify']);
};