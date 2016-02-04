/*global module, require*/

(function () {
    "use strict";
    var LIVERELOAD_PORT = 35729;
    var SERVER_PORT = 9000;
    var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    // # Globbing
    // for performance reasons we're only matching one level down:
    // 'test/spec/{,*/}*.js'
    // use this if you want to match all subfolders:
    // 'test/spec/**/*.js'
    // templateFramework: 'lodash'

    module.exports = function (grunt) {
        // configurable paths
        var yeomanConfig = {
            app: 'app',
            dist: 'dist'
        };

        var proxySnippet = require("grunt-connect-proxy/lib/utils.js").proxyRequest;

        // show elapsed time at the end
        require('time-grunt')(grunt);
        // load all grunt tasks
        require('load-grunt-tasks')(grunt);
        //grunt.loadNpmTasks('rebase');
        grunt.loadNpmTasks('grunt-karma');

        grunt.initConfig({
            yeoman: yeomanConfig,
            watch: {
                options: {
                    nospawn: true,
                    livereload: true
                },
                compass: {
                    files: ['<%= yeoman.app %>/styles/scss/{,*/}*.{scss,sass}'],
                    tasks: ['compass']
                },
                livereload: {
                    options: {
                        livereload: LIVERELOAD_PORT
                    },
                    files: [
                        '<%= yeoman.app %>/*.html',
                        '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                        '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                        '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.app %>/scripts/templates/{,*/}*.{ejs,mustache,hbs}'
                    ]
                },
                jst: {
                    files: [
                        '<%= yeoman.app %>/scripts/templates/{,*/}*.ejs'
                    ],
                    tasks: ['jst']
                },
                test: {
                    files: ['<%= yeoman.app %>/scripts/{,*/}*.js', 'test/spec/**/*.js'],
                    tasks: ['test']
                }
            },
            connect: {
                options: {
                    port: SERVER_PORT,
                    // change this to '0.0.0.0' to access the server from outside
                    hostname: '0.0.0.0'
                },
                localhost: {
                    proxies: [
                        {
                            context: '/auth',
                            host: 'localhost',
                            port: 4000
                        },
                        {
                            context: '/oauth',
                            host: 'localhost',
                            port: 4000
                        },
                        {
                            context: '/service',
                            host: 'localhost',
                            port: 4000
                        }
                    ]
                },
                livereload: {
                    options: {
                        middleware: function (connect) {
                            return [
                                lrSnippet,
                                mountFolder(connect, '.tmp'),
                                mountFolder(connect, yeomanConfig.app),
                                proxySnippet
                            ];
                        }
                    }
                },
                test: {
                    options: {
                        port: 9001,
                        middleware: function (connect) {
                            return [
                                lrSnippet,
                                mountFolder(connect, '.tmp'),
                                mountFolder(connect, 'test'),
                                mountFolder(connect, yeomanConfig.app)
                            ];
                        }
                    }
                },
                dist: {
                    options: {
                        middleware: function (connect) {
                            return [
                                mountFolder(connect, yeomanConfig.dist)
                            ];
                        }
                    }
                },
            },
            open: {
                server: {
                    path: 'http://localhost:<%= connect.options.port %>'
                }
            },
            clean: {
                dist: ['.tmp', '<%= yeoman.dist %>/*'],
                server: '.tmp',
                git: '.git/hooks/pre-commit'
            },
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                all: {
                    src: [
                        'Gruntfile.js',
                        '<%= yeoman.app %>/scripts/{,*/}*.js',
                        '!<%= yeoman.app %>/scripts/vendor/*',
                        'test/spec/{,*/}*.js'
                    ],
                    filter: function( filepath ) {
                        var index, file = grunt.option( 'file' );
                        // Don't filter when no target file is specified
                        if ( !file ) {
                            return true;
                        }

                        // Normalize filepath for Windows
                        filepath = filepath.replace( /\\/g, '/' );
                        index = filepath.lastIndexOf( '/' + file );

                        // Match only the filename passed from cli
                        if ( filepath === file || ( -1 !== index && index === filepath.length - ( file.length + 1 ) ) ) {
                            return true;
                        }

                        return false;
                    }
                }
            },
            compass: {
                options: {
                    sassDir: '<%= yeoman.app %>/styles/scss',
                    cssDir: '.tmp/styles',
                    imagesDir: '<%= yeoman.app %>/images',
                    javascriptsDir: '<%= yeoman.app %>/scripts',
                    fontsDir: '<%= yeoman.app %>/styles/fonts',
                    importPath: '<%= yeoman.app %>/bower_components',
                    relativeAssets: true
                },
                dist: {},
                server: {
                    options: {
                        debugInfo: true
                    }
                }
            },
            karma: {
                unit: {
                    configFile: 'karma.conf.js'
                }
            },
            // not enabled since usemin task does concat and uglify
            // check index.html to edit your build targets
            // enable this task if you prefer defining your build targets here
            /*uglify: {
                dist: {}
            },*/
            useminPrepare: {
                html: '<%= yeoman.app %>/index.html',
                options: {
                    dest: '<%= yeoman.dist %>'
                }
            },
            usemin: {
                html: ['<%= yeoman.dist %>/{,*/}*.html'],
                css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
                js: ['<%= yeoman.dist %>/scripts/*.js'],
                options: {
                    dirs: ['<%= yeoman.dist %>'],
                    assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images'],
                    patterns: {
                        js: [
                            [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp))/gm, 'Update the JS to reference our revved images']
                        ]
                    }
                }
            },
            imagemin: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '{,*/}*.{png,jpg,jpeg,svg}',
                        dest: '<%= yeoman.dist %>/images'
                    }]
                }
            },
            //cssmin: {
            //    dist: {
            //        files: {
            //            '<%= yeoman.dist %>/styles/main.css': [
            //                '.tmp/styles/{,*/}*.css'
            //            ]
            //        }
            //    }
            //},
            htmlmin: {
                dist: {
                    options: {
                        /*removeCommentsFromCDATA: true,
                        // https://github.com/yeoman/grunt-usemin/issues/44
                        //collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeOptionalTags: true*/
                    },
                    files: [{
                        expand: true,
                        cwd: '<%= yeoman.app %>',
                        src: '*.html',
                        dest: '<%= yeoman.dist %>'
                    }]
                }
            },
            copy: {
                dist: {
                    files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            'images/{,*/}*.{webp,gif,svg}',
                            'styles/fonts/{,*/}*.*',
                            'bower_components/sass-bootstrap/fonts/*.*',
                            'bower_components/bootstrap/dist/css/*.min.css',
                            'styles/*.min.css',
                            'styles/libs/dataTables.bootstrap.css',
                            'styles/libs/sumoselect.min.css',
                            'bower_components/socket.io-client/dist/socket.io.min.js',
                            'styles/Default/*','styles/Bootstrap/*',
                            'scripts/vendor/kendo.all.min.js*'
                        ]
                    }]
                },
                git: {
                    files: [{
                        flatten: true,
                        src: ['git-hooks/pre-commit'],
                        dest: '.git/hooks/pre-commit'
                    }]
                }
            },
            jst: {
                compile: {
                    files: {
                        '.tmp/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates/{,*/}*.ejs']
                    }
                }
            },
            rev: {
                dist: {
                    files: {
                        src: [
                            '<%= yeoman.dist %>/scripts/{,*/}*.js',
                            '<%= yeoman.dist %>/styles/{,*/}*.css',
                            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                            '/styles/fonts/{,*/}*.*',
                            'bower_components/sass-bootstrap/fonts/*.*'
                        ]
                    }
                }
            }
        });

        grunt.registerTask('createDefaultTemplate', function () {
            grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
        });

        grunt.registerTask('server', function (target) {
            if (target === 'dist') {
                return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
            }

            if (target === 'test') {
                return grunt.task.run([
                    'clean:server',
                    'createDefaultTemplate',
                    'jst',
                    'compass:server',
                    'connect:test',
                    'watch:livereload'
                ]);
            }

            grunt.task.run([
                'clean:server',
                'createDefaultTemplate',
                'jst',
                'compass:server',
                'configureProxies:localhost',
                'connect:livereload',
                'open',
                'watch'
            ]);
        });

        grunt.registerTask('test', [
            //'build',
            //'karma:unit'
        ]);

        grunt.registerTask('build', [
            'clean:dist',
            'createDefaultTemplate',
            'jst',
            'compass:dist',
            'useminPrepare',
            'imagemin',
            'htmlmin',
            'concat',
            'cssmin',
            'uglify',
            'copy:dist',
            'rev', // create image name with hash
            'usemin'
        ]);

        grunt.registerTask('default', [
            'jshint',
            'test',
            'build'
        ]);

        grunt.registerTask('git-hooks', [
            'clean:git',
            'copy:git'
        ]);

    };
})();
