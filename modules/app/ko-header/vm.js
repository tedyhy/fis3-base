var ViewModel = function(params) {
  this.bankName = ko.observable('京东金融');
  this.sysName = '票据平台';
  this.userName = ko.observable('');
  this.loginStatus = ko.observable(1);
  this.loginStatusText = ko.pureComputed(function() {
    return this.loginStatus() === 0 ? '登录' : '登出'
  }, this);
  this.userHello = ko.pureComputed(function() {
    return '您好，' + this.userName()
  }, this)
};

ViewModel.prototype = {
  switchLogin: function(loginStatusText) {
    location.href = 'login.html';
  },
  clockIn: function(data) {
    // console.log(data);
  },
  messageShow: function(data) {
    // console.log(data);
  }
};

module.exports = ViewModel