class API {
  constructor() {
    this.url = 'https://fc-platformer.herokuapp.com', //'http://localhost:3000'
    this.routes = {
      login: '/login',
      register: '/register',
      uploadLevel: '/api/level/save',
      getLevel: '/api/level/get',
      getAllLevels: '/api/level/getall',
      deleteLevel: '/api/level/delete',
      saveThumbnail: '/api/level/thumbnail',
      userLevels: '/api/user/createdlevels',
      userAllLevels: '/api/user/alllevels',
      getUser: '/api/user',
      highscore: '/api/user/highscore',
      subscribe: '/api/user/subscribe',
      unsubscribe: '/api/user/unsubscribe',
      getHighscore: '/api/highscore/get',
      getAllHighscores: '/api/highscore/getall'
    },
    this.loginStatusCookie = 'logged-in'
  }

  get(endpoint, onSuccess, onError) {
    const route = this.routes[endpoint];
    if (!route) {
      console.error('[API] Post: Unknown endpoint');
      return null;
    }
    fetch(this.url + route, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Origin': location.origin
      }
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
      if (err.status && err.status === 403) window.ps.setCookie('logged-in', false, '0m');
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
        'Origin': location.origin,
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
      if (err.status && err.status === 403) window.ps.setCookie('logged-in', false, '0m');
      if (onError) onError(err);
    });
  }
}

window.api = new API();