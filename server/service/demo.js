const utils = require('../helper/utils')
const global = require('../global')


/**
 * demo
 * @param req
 * @param data
 * @constructor
 */
exports.demo = (req, data) => {
  return utils.remotePostJSON({
    url: global.apis.demo,
    data,
    req
  })
}
