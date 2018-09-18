module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		copy: {
			build: {
				files: [
					{
						expand: true,
						cwd: './public',
						src: ['**'],
						dest: './dist/public'
					},
					{
						expand: true,
						cwd: './views',
						src: ['**'],
						dest: './dist/views'
					}
				]
			}
		},
		sass: {
			dist: {
				options: {      // Target options
		            style: 'compressed'
		        },
				files: {
					'dist/public/styles/main.min.css' : 'public/sass/main.scss',
					'dist/public/styles/home.min.css' : 'public/sass-home/home.scss'
				}
			}
		},
		ts: {
			app: {
				files: [
					{
						src: ['src/**/*.ts', '!src/.baseDir.ts'],
						dest: './dist'
					}
				],
				options: {
					module: 'commonjs',
					target: 'es6',
					sourceMap: false
				}
			}
		},
		watch: {
			ts: {
				files: ['src/**/*.ts'],
				tasks: ['ts']
			},
			sass: {
				files: ['public/sass/**/*.scss', 'public/sass-home/**/*.scss'],
				tasks: ['sass']
			},
			views: {
				files: ['views/**/*.handlebars', 'public/js/**/*.js'],
				tasks: ['copy']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('default', ['copy','ts','sass']);
};
