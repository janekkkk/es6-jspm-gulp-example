var _ = require('lodash');
require ('bootstrap-sass');
var dep = require('./dep/_dep1');
$('body').append('Do Something');

console.log('second app - CommonJS loading style');
console.log($.fn.jquery);
console.log(_.VERSION);
