const $ = require('jquery');
console.log($)

// 测试Promise
var Promise = require('es6-promise').Promise;
console.log(Promise);

$('body').append(Promise.toString());
