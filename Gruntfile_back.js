<<<<<<< HEAD
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
=======
module.exports = function(grunt) {
	grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	transport: {
				options : {
					paths : ['.'],
					alias : '<%= pkg.spm.alias %>'
				},
				text : {
					options : {
						idleading : 'src/htmledition/'
					},
					files : [{
						expand :true,
						cwd : 'src/htmledition',
						src : '**/*.html',
						dest : 'src/htmledition'
					}]
				},
				application: {
					files : [
						{
							src : ['src/**/*.js'],                  //所有js文件
							dest : 'build/',    //提取完依赖文件放在哪里
							ext : '.js'
						}
					]
				}				
			 },
	uglify : {
		application : {
			options : {
				paths : ['.']
			},
			files : [{
				expand :true,
				cwd : 'build',
				src : ['src/**/*.js', '!src/htmledition/**/*html.js', '!src/**/*debug.js'],
				dest : 'build',
				ext : '.js'  //这里要注意，由于seajs要求模块id与引用它时要用一样的路径，故不能用min.js，例如main.js提取完依赖后生成的模块id是  assets/scripts/src/main ，并且合并后与其他模块一起放在main.js，那么在加载入口时要这样seajs.use('assets/scripts/src/main')
			}]
		}
	},
	clean : {
		spm : ['.build']
	}
	});

	grunt.loadNpmTasks('grunt-cmd-transport');
	// grunt.loadNpmTasks('grunt-cmd-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	
	grunt.registerTask('build', ['transport', 'uglify', 'clean']);
};
>>>>>>> 添加配置文件
