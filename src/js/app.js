import Foo from './dep/_foo';
import bootstrap from 'bootstrap-sass';
let foo = new Foo();

let textNode = document.createTextNode(foo.doSomething());
document.body.appendChild(textNode);

console.log('default app - ES6 loading style');

export var hello = 'es6';
