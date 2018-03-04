const express = require('express')
const service = require('../../service/demo')
const router = express.Router()

router.post('/', (req, res, next) => {
  service.demo(req, req.body).then((data) => {
    res.json(data)
  }).catch((err) => {
    next(err)
  })
})

module.exports = router
