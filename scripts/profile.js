(function() {
  const userData = ps.load('user');
  if (!userData) return;
  const user = JSON.parse(userData);
  document.querySelector('#username').innerText = user.username;
  document.querySelector('#id').innerText = user._id;

  const logoutButton = document.querySelector('[data-action="logout"]');
  logoutButton.addEventListener('click', async () => {
    window.ps.setCookie(window.api.loginStatusCookie, null, '0m');
    window.ps.delete('user');
    window.pwa.loadPage('menu');
  });
  
  const levelLoadingSpinner = document.querySelector('[data-header="createdLevels"] .loading');
  if (window.ps.load('user')) {
    const levelHtml = `<div class="Level">
            <div class="Level__Content" data-name="{{name}}" data-complete="false" style="background-image: url(/images/nothumbnail.png);">
              <div class="Level__Text">
                <div class="Level__Name"></div>
              </div>
              <div class="Level__Buttons">
                <a class="Level__Action" data-action="edit" data-href="editor" data-t="edit">{{t:edit}}</a>
                <button class="Level__Action" data-action="delete" data-control="delete" data-t="delete">{{t:delete}}</button>
              </div>
            </div>
          </div>`;
    window.api.get('userLevels', (result) => {
      const createdLevels = result,
            createdContainer = document.querySelector('#levels');
  
      createdLevels.forEach((level) => {
        createdContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level._id));
      });
      createdLevels.forEach((level) => {
        const levelElement = createdContainer.querySelector('[data-name="' + level._id + '"]');
        if (level.thumbnail) levelElement.style.backgroundImage = `url(${level.thumbnail})`;
        if (level.name) levelElement.querySelector('.Level__Name').innerText = level.name;
        levelElement.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
          window.ps.save('editorLevel', e.target.closest('[data-name]').getAttribute('data-name'));
        });
        levelElement.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
          const popup = document.querySelector('[data-popup="' + e.target.getAttribute('data-control') + '"]'),
                overlay = document.querySelector('.PageOverlay');
          popup.setAttribute('data-visible', true);
          overlay.setAttribute('data-visible', true);
          document.querySelector('[data-action="confirm-delete"]').setAttribute('data-delete-id', e.target.closest('[data-name]').getAttribute('data-name'));
        });
      });
      window.pwa.initLinks();
      levelLoadingSpinner.classList.add('dn');
    }, (error) => {
      console.error(error);
      levelLoadingSpinner.classList.add('dn');
    });
  }
  else {
    levelLoadingSpinner.classList.add('dn');
  }
  // Refresh profile
  document.querySelector('[data-action="refresh-profile"]').addEventListener('click', (e) => {
    e.target.classList.add('loading');
    e.target.disabled = true;
    api.get('getUser', (result) => {
      window.ps.save('user', JSON.stringify(result));
      e.target.classList.remove('loading');
      e.target.disabled = false;
    }, (error) => {
      console.error(error);
      e.target.classList.remove('loading');
      e.target.disabled = false;
    });
  });
  // Popup closers
  document.querySelectorAll('[data-action="close-popup"]').forEach((opener) => {
    opener.addEventListener('click', (e) => {
      const popup = e.target.closest('.Popup'),
            overlay = document.querySelector('.PageOverlay');
      popup.setAttribute('data-visible', false);
      overlay.setAttribute('data-visible', false);
    });
  });
  // Confirm level delete
  document.querySelector('[data-action="confirm-delete"]').addEventListener('click', (e) => {
    const id = e.target.getAttribute('data-delete-id');
    window.api.post('deleteLevel', { _id: id }, (result) => {
      window.ps.save('user', JSON.stringify(result));
      document.querySelector('.Level__Content[data-name="' + id + '"]').closest('.Level').remove();
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
    }, (error) => {
      e.target.closest('.Popup').querySelector('[data-action="close-popup"]').click();
      console.error(error);
    })
  });

  window.dispatchEvent(new CustomEvent('progress:executed'));
})();