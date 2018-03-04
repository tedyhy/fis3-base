/**
 * 对根路由做处理
 * 在线上 nginx 会以 head 请求方式发送心跳请求
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
  if (req.method === 'GET') {
    next()
  } else {
    res.end('ok')
  }
}
