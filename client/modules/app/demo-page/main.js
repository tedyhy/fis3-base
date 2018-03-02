const ViewModel = function(params) {

  // 列表数据
  this.data = ko.observableArray([]);

  this.init(params);
};

ViewModel.prototype = {
  /**
   * 页面初始化
   * @param params
   */
  init: function(params) {
    document.title = '增删改查示例'; // 设置页面标题
    this.getList();
  },

  /**
   * 查询列表信息
   * 示例响应:
   * @param params
   */
  getList() {
    const resp = {
      "code": "0",
      "msg": "success",
      "data": [{
        "id": "410000197703296839",
        "name": "者存矿求流把光专与别学低并将建拉为"
      }, {
        "id": "320000198903204049",
        "name": "清众公一专林你你海么调过外写制话员"
      }, {
        "id": "130000198105103344",
        "name": "图式包看长圆提位建细北快出主体心拉边取"
      }, {
        "id": "32000019860720161X",
        "name": "小记天他号位影土型还系量"
      }, {
        "id": "450000200201069216",
        "name": "时九属才具外要同重青住验方据划消气确处应办中般军相件话"
      }]
    }
    this.data(resp.data)
    $('body').show()
  },

  getClientId: function(id) {
    return 'ID: ' + id;
  },

  /**
   * 删除
   * @param data
   * @param event
   */
  handleDelete: function(data, event) {
    console.info('delete:', data, event)
  }
};


module.exports = {
  viewModel: ViewModel,
  template: __inline('./demo-page.tmpl')
}