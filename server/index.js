/**
 * 入口文件
 */
const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const compress = require('compression')
const apiRouter = require('./routes/api-routes')
const logger = require('digger-node').Logger
const asyncRespHeader = require('./middlewares/async-resp-header')
const {getClientIP} = require('./helper/utils')
const {RES_CODE, RES_MSG} = require('../common/constants')
const errorHandler = require('./helper/errorHandler')
const commonSafety = require('./middlewares/common-safety')

const isDev = process.env.NODE_ENV === 'development'
const isProduct = process.env.NODE_ENV === 'production'
const app = express()

logger.info(`process.env.NODE_ENV is [${process.env.NODE_ENV}]`)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
// 非生产环境开启Gzip，生产环境nginx会开启gzip
if (!isProduct) {
  app.use(compress())
}
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}))
app.use(bodyParser.json({limit: '20mb'}))//设置前端post提交最大内容
app.use(cookieParser())
app.use(require('./middlewares/request-logger').create(logger))
if (!isDev) {
  // 因为 Nginx 会卸载 context
  app.use('', express.static(path.join(__dirname, '../public'), {
    maxAge: 2592000000, // 缓存一个月，单位毫秒
  }))
}

// 加载安全机制，静态资源不会走到这里
commonSafety(app)

// get client IP
app.use((req, res, next) => {
  req.headers.clientIp = getClientIP(req)
  next()
})

// 设置 api 异步请求响应头
app.use(asyncRespHeader)

// load routers
apiRouter(app)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  // 不处理 map 和 json 格式的数据
  if (/\.(map|json)$/.test(req.url)) {
    return next()
  }
  const err = new Error(`${req.url},Not Found`)
  err.status = 404
  next(err)
})

// error handlers
// will print stacktrace
// 异步接口异常处理
app.use((err, req, res, next) => {
  const contentType = req.headers['content-type']

  if (contentType && contentType.toLowerCase().indexOf('application/json') !== -1) {
    err = err || {}
    err = {
      [RES_CODE]: err.code || 'S0001',
      [RES_MSG]: err.msg || err.message || '未知的服务端异常'
    }
    res.status(200).json(err)
  } else {
    next(err)
  }
})

// 同步页面调用异常处理
app.use((err, req, res, next) => {
  if (err.status === 404) {
    logger.info(err.stack)
  } else {
    logger.error(err.stack)
  }

  res.status(err.status || 500).render('error', {
    message: err.message,
    error: err,
    context: process.env.URL_CONTEXT,
  })
})

module.exports = app
