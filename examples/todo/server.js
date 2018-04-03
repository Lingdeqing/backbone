const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(express.static('../../'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// 数据库
const db = {
    json: require('./db.json'),
    edit: function (todo) {
        var todoItem = this.getById(todo.id)
        if(todoItem){
            todoItem.title = todo.title
            todoItem.done = todo.done
            return true
        }
        return false
    },
    create: function (todo) {
        todo.id = this.nextId()
        this.json.push(todo)
    },
    remove: function (id) {
        var todoItem = this.getById(id)
        if(todoItem){
            var index = this.json.indexOf(todoItem)
            this.json.splice(index, 1)
            return true
        }
        return false
    },
    getById: function (id) {
        for(var i = 0; i < this.json.length; i++){
            var todoItem = this.json[i]
            if(todoItem.id == id){
                return todoItem
            }
        }
        return null
    },
    persist: function () {
        fs.writeFileSync('db.json', JSON.stringify(this.json))
    },
    nextId: function () {
        return this.json[this.json.length - 1].id + 1
    }
}

// 获取
app.get('/todos/', function (req, res) {
    res.json(db.json)
})

// 新增
app.post('/todos', function (req, res) {
    var todo = req.body
    var success = db.create(todo)
    db.persist()
    res.json(todo)
})

// 修改
app.put('/todos/:id', function (req, res) {
    var id = req.params.id
    var todo = req.body
    var success = db.edit(todo)
    db.persist()
    res.end('change success')
})

// 删除
app.delete('/todos/:id', function (req, res) {
    var id = req.params.id
    var todo = req.body
    var success = db.remove(id)
    db.persist()
    res.end('delete success')
})

const server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});