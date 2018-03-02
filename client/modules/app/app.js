/// ************** test **************

import '../css/test.less'
import '../css/index.scss'
require('perfect-css/dist/css/base.css')
// import {createStore, combineReducers} from 'redux'
// console.log(createStore.toString(), combineReducers.toString());
// import {Select} from 'perfect-css/dist/js/perfect.js'
// console.log(Select)

require('perfect-css')



/// ************** APP.js **************
require('sammy')

// common
import koHeader from './ko-header/main'
// demo-page
import demoPage from './demo-page/main'

var pageVm = {
  name: ko.observable(),
  data: ko.observable(),
  setRoute: function(name, data) {
    //Set data first, otherwise component will get old data
    this.data(data);
    this.name(name);
  }
};

// 基础组件注册
var commonsConfig = function() {
  var commons = [{
    component: 'header',
    config: koHeader
  }];
  for (var i = 0; i < commons.length; i++) {
    var common = commons[i];
    ko.components.register(common.component, common.config);
  }
};

// 页面路由配置和组件注册
var sammyConfig = jQuery.sammy('#appHost', function() {
  var self = this;
  var pages = [{
    route: ['/', '#/', '#/demo'],
    component: 'demo-page',
    activeMenuNum: '4-4',
    config: demoPage
  }, ];

  pages.forEach(function(page) {
    //Register the component, only needs to hapen
    // console.log(page.component);
    // console.log(page.module);
    // console.log(page.config);
    ko.components.register(page.component, page.config);

    //Force routes to be an array
    if (!(page.route instanceof Array)) {
      page.route = [page.route];
    }

    //Register routes with Sammy
    page.route.forEach(function(route) {
      self.get(route, function() {

        //Collect the parameters, if present
        var params = {};
        ko.utils.objectForEach(this.params, function(name, value) {
          params[name] = value;
        });

        //Set the page
        pageVm.setRoute(page.component, params, page.activeMenuNum);
      });
    });
  });
});

$(function() {
  commonsConfig();

  ko.applyBindings(pageVm);
  sammyConfig.run('#/');
});