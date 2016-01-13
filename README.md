# JSPM + Gulp example/boilerplate

> A boilerplate for developing apps using JSPM & Gulp.
> Some changes were made to the original repository to match my workflow.

## JSPM

[JSPM](http://jspm.io/) is an all-in-one command line tool for package management, module loading and transpilation. Read more about it [here](http://www.joezimjs.com/javascript/simplifying-the-es6-workflow-with-jspm/) and [here](http://javascriptplayground.com/blog/2014/11/js-modules-jspm-systemjs/).

## Features

- Uses JSPM instead of Bower to manage packages
- Transpiles ES6+ automagically using [Babel](https://babeljs.io/) via JSPM
- Uses [SystemJS](https://github.com/systemjs/systemjs) to load modules via JSPM
- SASS compilation using [LibSass](http://libsass.org/) and [Autoprefixer](https://github.com/postcss/autoprefixer)
- Choice between Node or PHP  
    - Local Node dev server with [LiveReload](http://livereload.com/) using [Gulp Connect](https://github.com/avevlad/gulp-connect)
    - Local PHP dev server with [Browsersync](https://www.browsersync.io/) using [Gulp Connect PHP](https://www.npmjs.com/package/gulp-connect-php)
- Testing using [Karma](http://karma-runner.github.io/) with [Mocha](http://mochajs.org/) + [Chai](http://chaijs.com/) (bonus: write your tests in ES6)
- Linting with [ESLint](http://eslint.org/) and [SCSS-Lint](https://github.com/brigade/scss-lint)
- Generates documentation automatically using [ESDoc](https://esdoc.org/) and [SassDoc](http://sassdoc.com/)
- Building Javascript from multiple entry points
- [Unlicensed](http://unlicense.org/)

## Usage

1. Clone this repo from `https://github.com/janekkkk/es6-jspm-gulp-example.git`
2. Run `npm install` in the root directory
3. Run `gulp` or `npm start` to start the local dev server
4. Write an awesome app! ☺

## Testing

Run `karma start` or `npm test` to run tests once.

Run `npm run test:watch` to run tests continuously.

## Generating documentation

Run `npm run docs` to generate documentation for your JavaScript and SASS automatically in the `docs` folder.

## Building

Run `gulp build` or `npm run build` to build the app for distribution in the `dist` folder.


---

[No rights reserved](http://unlicense.org/). Made with ♥ by [Alex Weber](https://twitter.com/alexweber15) modified by [Janek Ozga](http://www.janekozga.nl/)
