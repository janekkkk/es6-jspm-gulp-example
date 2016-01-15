var _ = require('lodash');
require ('bootstrap')
var dep = require('./dep/_dep1');

var textNode = document.createTextNode('Do Something');
document.body.appendChild(textNode);

console.log('second app - CommonJS loading style');
console.log($.fn.jquery);
console.log(_.VERSION);
