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
          this.todoList.push({
              title: this.newTodo,
              createdAt: new Date(),
              done: false
          })
          this.newTodo = ''
        },
        removeTodo: function (todo) {
            let index = this.todoList.indexOf(todo)
            this.todoList.splice(index,1)
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
        }
    },
    created: function () {
        window.onbeforeunload = () => {
            let dateString = JSON.stringify(this.todoList)
            window.localStorage.setItem('myTodos',dateString)
        }

        let oldDateString = window.localStorage.getItem('myTodos')
        let oldDate = JSON.parse(oldDateString)
        this.todoList = oldDate || []
        this.currentUser = this.getCurrentUser()
    }
  })