/**
 * 基础的工具方法
 * @type {request}
 */
const request = require('request') // enable cookie
const logger = require('digger-node').Logger
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'
const {
  RES_CODE,
  RES_DATA,
  RES_MSG,
  SUCCESS_CODE,
  FAIL_CODE,
  AUTH_EXPIRED_CODE,
  NO_PERMISSION_CODE
} = require('../../common/constants')
const timeout = 10e3 // 请求服务端 10s 超时

/**
 * 格式化接口请求异常
 * @param options
 * @param netError
 * @returns {Error}
 */
const formatRequestError = (options, netError) => {
  let errMsg = '获取服务端接口异常'
  let errCode = 'S0001'
  if (netError && netError.code === 'ETIMEDOUT') {
    if (netError.connect === true) {
      errMsg += `[连接超时(${timeout}s)]`
      errCode = 'S0002'
    } else {
      errMsg += `[响应超时(${timeout}s)]`
      errCode = 'S0003'
    }
  }

  const err = new Error(`${errMsg}, url：${options.url}`)
  err[RES_CODE] = errCode
  return err
}

/**
 * 记录接口耗时
 * @param start
 * @param url
 */
const logTimeUse = (start, url) => {
  const end = process.hrtime()
  logger.info(`[${url}] 耗时${((end[0] - start[0]) * 1e3 + (end[1] - start[1]) * 1e-6).toFixed(3)}ms`)
}

/**
 * 构建请求头部
 * @param clientHeaders
 * @returns {{clientIp: *, X-Requested-With: string, cookie}}
 */
const buildHeader = (clientHeaders) => {
  const header = {
    'X-Requested-With': 'XMLHttpRequest',
    clientIp: clientHeaders.clientIp,
    cookie: clientHeaders.cookie,
  }

  return header
}

/**
 * 抛出 response.resultCode !== 0 的数据
 * @param options
 */
module.exports.remotePostFormRejectError = (options) => {
  return remotePostForm(options).then((resp) => {
    if (!options.text && resp[RES_CODE] !== 0) {
      const error = new Error(resp[RES_MSG] || '服务端异常')
      error[RES_CODE] = resp[RES_CODE]
      error[RES_DATA] = resp[RES_DATA]
      return Promise.reject(error)
    }
    return Promise.resolve(resp)
  })
}

/**
 * post 提交 form 数据
 * @param options
 */
const remotePostForm = module.exports.remotePostForm = (options) => {
  const {
    url,
    data,
    req: {
      headers
    },
  } = options
  const requestHeaders = buildHeader(headers)

  logger.info(`POST请求地址:${url};请求参数:${JSON.stringify(data)}, 请求头:${JSON.stringify(requestHeaders)}, content-type:application/x-www-form-urlencoded.`)

  return new Promise((resolve, reject) => {
    const start = process.hrtime()
    request.post({
      url,
      headers: requestHeaders,
      form: JSON.parse(JSON.stringify(data || {})) || {},
      timeout,
    }, (err, response, body) => {
      logTimeUse(start, url)

      if (!err && response.statusCode === 200) {
        logger.info(`${url} =======返回数据========== \n ${JSON.stringify(body, 2)}`)

        if (options.text === true) {
          resolve(body)
        } else {
          resolve(body && JSON.parse(body))
        }
      } else {
        if (err) {
          logger.error(`${options.url} =======错误==========  \n ${err.stack}`)
        }
        logger.error(`post:${options.url} error!${response && response.statusCode}`)
        logger.error(`error repsonse body is:${body}`)
        reject(formatRequestError(options, err))
      }
    })
  }).catch((error) => {
    logger.error(`post:${options.url} error!${error.stack}`)
    return Promise.reject(error)
  })
}

/**
 * post 提交 json 数据
 * @param options
 */
module.exports.remotePostJSON = (options) => {
  const {
    url,
    data,
    req: {
      headers
    },
  } = options
  const requestHeaders = buildHeader(headers)

  logger.info(`POST请求地址:${url};请求参数:${JSON.stringify(data)}, 请求头:${JSON.stringify(requestHeaders)}, content-type:application/json.`)

  return new Promise((resolve, reject) => {
    const start = process.hrtime()
    request.post({
      url,
      headers: requestHeaders,
      json: JSON.parse(JSON.stringify(data || {})) || {},
      timeout,
    }, (err, response, body) => {
      logTimeUse(start, url)

      if (!err && response.statusCode === 200) {
        logger.info(`${url} =======返回数据========== \n ${JSON.stringify(body, 2)}`)

        resolve(body)
      } else {
        if (err) {
          logger.error(`${options.url} =======错误==========  \n ${err.stack}`)
        }
        logger.error(`post:${options.url} error!${response && response.statusCode}`)
        logger.error(`error repsonse body is:${body}`)
        reject(formatRequestError(options, err))
      }
    })
  }).catch((error) => {
    logger.error(`post:${options.url} error!${error.stack}`)
    return Promise.reject(error)
  })
}

/**
 * get 获取 json 数据
 * @param options
 */
module.exports.remoteGetJSON = (options) => {
  let {
    url
  } = options
  const {
    data,
    req: {
      headers
    },
  } = options
  const requestHeaders = buildHeader(headers)

  if (data && !Array.isArray(data)) {
    const params = []
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        try {
          params.push(`${key}=${decodeURIComponent(data[key])}`)
        } catch (e) {
          logger.error(`error! ${key}=${decodeURIComponent(data[key])}`)
        }
      }
    }
    if (url.indexOf('?') === -1) {
      url += '?'
    }
    url += params.join('&')
  }

  logger.info(`GET请求地址:${url};请求参数:${JSON.stringify(data)}, 请求头:${JSON.stringify(requestHeaders)}, content-type:application/json`)

  return new Promise((resolve, reject) => {
    const start = process.hrtime()
    request.get({
      url,
      headers: requestHeaders,
      timeout,
    }, (err, response, body) => {
      logTimeUse(start, url)

      if (!err && response.statusCode === 200) {
        logger.info(`${url} =======返回数据========== \n ${JSON.stringify(body, 2)}`)

        resolve(body)
      } else {
        if (err) {
          logger.error(`${options.url} =======错误==========  \n ${err.stack}`)
        }
        logger.error(`post:${options.url} error!${response && response.statusCode}`)
        logger.error(`error repsonse body is:${body}`)
        reject(formatRequestError(options, err))
      }
    })
  }).catch((error) => {
    logger.error(`post:${options.url} error!${error.stack}`)
    return Promise.reject(error)
  })
}

/**
 * 返回客户端 ip
 * @param req
 * @returns {null}
 */
module.exports.getClientIP = (req) => {
  let ipAddress = req.get('X-Forwarded-For') ? req.get('X-Forwarded-For').split(',')[0] : null
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress || req.socket.remoteAddress
  }

  return ipAddress
}
