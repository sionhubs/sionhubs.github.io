const express = require('express')
const { connect } = require('mongoose')
const app = express()
const port = 5000

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sion:password@cluster0.fsmqalx.mongodb.net/?retryWrites=true&w=majorityn', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err))
// 몽고디비의 저장소에 접근을 해서 저장하고 그 정보를 불러와주는 웹 서비스

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})