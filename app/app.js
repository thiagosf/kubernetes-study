const express = require('express')
const models = require('./models')
const app = express()

app.use((req, res, next) => {
  const { sequelize } = models
  return sequelize.sync().then(() => {
    req.models = models
    next()
  })
})

app.use('/', (req, res, next) => {
  const { Counter } = models
  Counter.add().then(counter => {
    res.send({ counter })
  }).catch(next)
})

app.use((err, req, res, next) => {
  const message = err.message
  res.status(err.status || 500)
  res.send({
    success: false,
    message
  })
})

module.exports = app
