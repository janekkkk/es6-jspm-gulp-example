var $ = require( 'jquery' );
var _ = require( 'lodash' );

var textNode = document.createTextNode( 'Do Something' );
document.body.appendChild( textNode );

console.log( 'second app - CommonJS loading style' );
console.log( $.fn.jquery );
console.log( _.VERSION );
