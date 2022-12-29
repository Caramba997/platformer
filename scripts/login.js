(function() {
  const errorElement = document.querySelector('.Error'),
        loginButton = document.querySelector('[data-action="login"]'),
        registerButton = document.querySelector('[data-action="register"]'),
        api = window.api;

  function validateUserData() {
    const username = document.querySelector('input[name="username"]').value,
          password = document.querySelector('input[name="password"]').value;
    errorElement.innerText = '';
    if (username === '' || password === '') {
      errorElement.innerText = window.locales.getTranslation('errorMissingUserData');
      return null;
    }
    return {
      username: username,
      password: password
    };
  }

  loginButton.addEventListener('click', async () => {
    const data = validateUserData();
    if (data === null) return;
    api.post('login', data, (result) => {
      window.ps.save('user', JSON.stringify(result));
      window.pwa.loadPage('menu');
    }, (error) => {
      errorElement.innerText = (error.status === 401) ? window.locales.getTranslation('errorInvalidCredentials') : window.locales.getTranslation('errorLoginFailed');
    });
  });
  registerButton.addEventListener('click', async () => {
    const data = validateUserData();
    if (data === null) return;
    api.post('register', data, (result) => {
      window.ps.save('user', JSON.stringify(result));
      window.pwa.loadPage('menu');
    }, (error) => {
      errorElement.innerText = (error.status === 409) ? window.locales.getTranslation('errorUsernameTaken') : window.locales.getTranslation('errorRegisterFailed');
    });
  });
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();