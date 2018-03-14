import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'gLYSqvVS50LT7ShmcNvBtfqi-gzGzoHsz';
var APP_KEY = '3hQfwe67K21FB4naNxajbknj';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


var app = new Vue({
    el: '#app',
    data: {
      newTodo: '',
      todoList: [],
      actionType: 'login',
      formData: {
          username: '',
          password: ''
      },
      currentUser: null
    },
    methods: {
        addTodo: function (event) {
            let date = new Date().toISOString()
                .replace(/T/, ' ')     // replace T with a space
                .replace(/\..+/, '')
          this.todoList.push({
              title: this.newTodo,
              createdAt: date,
              done: false
          })
          this.newTodo = ''
        //   this.saveOrUpdateTodos()
        },
        removeTodo: function (todo) {
            let index = this.todoList.indexOf(todo)
            this.todoList.splice(index,1)
            // this.saveOrUpdateTodos()
        },
        signUp: function () {
            let user = new AV.User();
            user.setUsername(this.formData.username);
            user.setPassword(this.formData.password);
            user.signUp().then( (loginedUser) => {
              console.log(loginedUser);
              this.currentUser = this.getCurrentUser()
            }, function (error) {
                alert("注册失败")
            });
        },
        login: function () {
            AV.User.logIn(this.formData.username, this.formData.password).then( (loginedUser) => {
                console.log(loginedUser);
                this.currentUser = this.getCurrentUser()
                this.fetchTodos()
              }, function (error) {
                  alert("登录失败")
              });
        },
        getCurrentUser: function () {
            // let {id, createdAt, attributes: {username}} = AV.User.current()
            // return {id, username, createdAt}
            let currentUser = AV.User.current()
            if (currentUser) {
                let {id, createdAt, attributes: {username}} = AV.User.current()
                return {id, username, createdAt}
            }else {
                return null
            }
        },
        logout: function () {
            AV.User.logOut();
            // 现在的 currentUser 是 null 了
            this.currentUser = null
            window.location.reload()
        },
        saveTodos: function () {
            let dateString = JSON.stringify(this.todoList)
            let AVTodos = AV.Object.extend('AllTodos')
            let avTools = new AVTodos
            let acl = new AV.ACL() 
            acl.setReadAccess(AV.User.current(),true)
            acl.setWriteAccess(AV.User.current(),true)
            avTools.set('content',dateString)
            avTools.setACL(acl)
            avTools.save().then( (todo) => {
                this.todoList.id = todo.id
                console.log('保存成功')
            },function (error) {
                console.error('保存失败')
            })
        },
        updateTodos: function () {
            let dateString = JSON.stringify(this.todoList)
            let avTodos = AV.Object.createWithoutData('AllTodos',this.todoList.id)
            avTodos.set('content',dateString)
            avTodos.save().then(()=>{
                console.log('更新成功')
            })
        },
        saveOrUpdateTodos: function () {
            if(this.todoList.id) {
                this.updateTodos()
            }else {
                this.saveTodos()
            }
        },
        fetchTodos: function () {
            if(this.currentUser){
                var query = new AV.Query('AllTodos');
                query.find()
                    .then((todos) => {
                        let avAllTodos = todos[0]
                        let id = avAllTodos.id
                        this.todoList = JSON.parse(avAllTodos.attributes.content)
                        this.todoList.id = id
                    }, function (error) {
                        console.error(error)
                    })
                }
        },
        changeSignType:function () {
            this.actionType == "signUp" ? this.actionType="login" : this.actionType="signUp";
          }
    },
    created: function () {
        // window.onbeforeunload = () => {
        //     let dateString = JSON.stringify(this.todoList)
        //     window.localStorage.setItem('myTodos',dateString)
        // }


        // let oldDateString = window.localStorage.getItem('myTodos')
        // let oldDate = JSON.parse(oldDateString)
        // this.todoList = oldDate || []
        this.currentUser = this.getCurrentUser()
        this.fetchTodos()
    }
  })