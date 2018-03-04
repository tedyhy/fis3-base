const {SERVER_URL} = process.env
const urlPrefix = ''

const apis = {
  demo: `interface-standard`
}

const handleApis = () => {
  const _apis = {};
  for (const i of Object.keys(apis)) {
    _apis[i] = `${SERVER_URL}${urlPrefix}${apis[i]}`
  }
  Object.assign(_apis, apiExpress)
  return _apis
}

module.exports = {
  SERVER_URL,
  apis: handleApis()
}