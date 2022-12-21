(function() {
  const loginButton = document.querySelector('[data-action="login"]'),
        registerButton = document.querySelector('[data-action="register"]');

  function validateUserData() {
    const errorElement = document.querySelector('.Error'),
          username = document.querySelector('input[name="username"]').value,
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

  loginButton.addEventListener('click', () => {
    const data = validateUserData();
    if (data === null) return;
    // Send login request
  });
  registerButton.addEventListener('click', () => {
    const data = validateUserData();
    if (data === null) return;
    // Send register request
    // Handle taken username
  });
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();