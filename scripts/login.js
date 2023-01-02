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

  loginButton.addEventListener('click', async (e) => {
    const data = validateUserData();
    if (data === null) return;
    e.target.classList.add('loading');
    e.target.disabled = true;
    api.post('login', data, (result) => {
      window.ps.save('user', JSON.stringify(result));
      window.ps.setCookie(window.api.loginStatusCookie, true, '30d');
      window.pwa.loadPage('menu');
    }, (error) => {
      errorElement.innerText = (error.status === 401) ? window.locales.getTranslation('errorInvalidCredentials') : window.locales.getTranslation('errorLoginFailed');
      e.target.classList.remove('loading');
      e.target.disabled = false;
    });
  });
  registerButton.addEventListener('click', async () => {
    const data = validateUserData();
    if (data === null) return;
    e.target.classList.add('loading');
    e.target.disabled = true;
    api.post('register', data, (result) => {
      window.ps.save('user', JSON.stringify(result));
      window.ps.setCookie(window.api.loginStatusCookie, true, '30d');
      window.pwa.loadPage('menu');
    }, (error) => {
      errorElement.innerText = (error.status === 409) ? window.locales.getTranslation('errorUsernameTaken') : window.locales.getTranslation('errorRegisterFailed');
      e.target.classList.remove('loading');
      e.target.disabled = false;
    });
  });
  document.querySelector('input[name="password"]').addEventListener('keypress', (e) => {
    if (e.key === "Enter") loginButton.click();
  });
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();