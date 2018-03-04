/**
 * 环境配置 功能或闭环
 */
module.exports.port = process.env.PORT = 8888
module.exports.NODE_ENV = process.env.NODE_ENV = 'beta'
module.exports.SERVER_URL = process.env.SERVER_URL = 'http://mock.jdfmgt.com/mock/5a6ef53897e58e4d2c992e34'
// url 二级路径上下文，页面中引入资源上下文
module.exports.URL_CONTEXT = process.env.URL_CONTEXT = '' // 如：'/context'
