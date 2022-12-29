class API {
  constructor() {
    this.url = 'http://localhost:3000',
    this.routes = {
      login: '/login',
      register: '/register'
    },
    this.tokenCookieName = 'platformer-token'
  }

  get(endpoint, onSuccess, onError) {
    const route = this.routes[endpoint];
    if (!route) {
      console.error('[API] Post: Unknown endpoint');
      return null;
    }
    fetch(this.url + route, {
      method: 'GET',
      credentials: 'include'
    })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((result) => {
      if (onSuccess) onSuccess(result);
    })
    .catch((err) => {
      if (onError) onError(err);
    });
  }

  post(endpoint, data, onSuccess, onError) {
    const route = this.routes[endpoint];
    if (!route) {
      console.error('[API] Post: Unknown endpoint');
      return null;
    }
    fetch(this.url + route, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((result) => {
      if (onSuccess) onSuccess(result);
    })
    .catch((err) => {
      if (onError) onError(err);
    });
  }
}

window.api = new API();