class API {
  constructor() {
    this.url = 'http://localhost:3000',
    this.routes = {
      login: '/login',
      register: '/register'
    }
  }
}

window.api = new API();