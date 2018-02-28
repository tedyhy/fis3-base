const $ = require('jquery');
console.log($)
// $('body #dialog').dialog()

// 测试Promise
var Promise = require('es6-promise').Promise;
console.log(Promise);

// 测试template
require('util/template/template').template;
const tpl = __inline('test.tmpl');
$('body').append(tpl({}));

// 测试 underscore
var _ = require('underscore');
console.log(_)

// 测试data.js

var Data = require('lib/data.js/data.js');
console.log(Data);
