$(function () {
    Todo = Backbone.Model.extend({
        defaults: function(){
            console.log(1)
            return {
                title: 'empty todo...',
                done: false
            }
        },

        toggle: function () {
            this.save({done: !this.get('done')})
        }
    })

    TodoList = Backbone.Collection.extend({
        model: Todo,
        // localStorage: new Backbone.LocalStorage('todos-backbone'),
        url: '/todos/',

        done: function () {
            return this.where({done: true})
        },

        remaining: function () {
            return this.where({done: false})
        },

        nextOrder: function () {
            if(!this.length) return 1
            return this.last().get('id') + 1
        },

        comparator: 'id'
    })

    var Todos = new TodoList

    TodoView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#item-template').html()),
        events: {
            'click .toggle': 'toggleDone',
            'dblclick .view': 'edit',
            'click a.destroy': 'clear',
            'keypress .edit': 'updateOnEnter',
            'blur .edit': 'close'
        },
        initialize: function () {
            this.listenTo(this.model, 'change', this.render)
            this.listenTo(this.model, 'destroy', this.remove)
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()))
            this.$el.toggleClass('done', this.model.get('done'))
            this.input = this.$('.edit')
            return this
        },
        toggleDone: function () {
            this.model.toggle()
        },
        edit: function () {
            this.$el.addClass('editing')
            this.input.focus()
        },
        clear: function () {
            this.model.destroy()
        },
        updateOnEnter: function (e) {
            if(e.keyCode === 13) this.close()
        },
        close: function () {
            var val = this.input.val()
            if(val === ''){
                this.clear()
            } else {
                this.model.save({title: val})
                this.$el.removeClass('editing')
            }
        }
    })

    AppView = Backbone.View.extend({
        el: $('#todoapp'),
        statsTemplate: _.template($('#stats-template').html()),

        events: {
            'keypress #new-todo': 'createOnEnter',
            'click #toggle-all': 'toggleAllComplete',
            'click #clear-completed': 'clearComplete'
        },

        initialize: function () {
            this.input = this.$('#new-todo')
            this.allCheckbox = this.$('#toggle-all')[0]

            this.listenTo(Todos, 'add', this.addOne)
            this.listenTo(Todos, 'reset', this.addAll)
            this.listenTo(Todos, 'all', this.render)

            this.footer = this.$('footer')
            this.main = this.$('#main')

            Todos.fetch()
        },

        addOne: function (todo) {
            var view = new TodoView({model: todo})
            this.$('#todo-list').append(view.render().el)
        },
        
        addAll: function () {
            Todos.each(this.addOne, this)
        },
        
        render: function () {
            var done = Todos.done().length
            var remaining = Todos.remaining().length

            if(Todos.length){
                this.main.show()
                this.footer.show()
                this.footer.html(this.statsTemplate({done: done, remaining: remaining}))
            } else {
                this.main.hide()
                this.footer.hide()
            }

            this.allCheckbox.checked = !remaining
        },

        createOnEnter: function(e){
            if(e.keyCode !== 13) return
            if(!this.input.val()) return

            Todos.create({
                title: this.input.val()
            })
            this.input.val('')
        },
        toggleAllComplete: function(){
            var done = this.allCheckbox.checked
            Todos.each(function (todo) {
                todo.save({done: done})
            })
        },
        clearComplete: function(){
            _.invoke(Todos.done(), 'destroy')
            return false
        }
    })

    App = new AppView
})