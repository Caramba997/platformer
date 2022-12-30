(function() {
  const userData = window.ps.load('user')
  if (userData) {
    const levelHtml = `<div class="Level">
            <div class="Level__Content" data-name="{{name}}" data-complete="false" style="background-image: url(/images/nothumbnail.png);">
              <div class="Level__Info">
                <div class="Level__Name"></div>
                <div class="Level__Author"><span data-t="by">{{t:by}}</span> {{author}}</div>
              </div>
              <div class="Level__Buttons">
                <button class="Level__Action dn" data-action="subscribe" data-t="subscribe">{{t:subscribe}}</button>
                <button class="Level__Action dn" data-action="unsubscribe" data-t="unsubscribe">{{t:unsubscribe}}</button>
              </div>
            </div>
          </div>`;
    const user = JSON.parse(userData);
    window.api.get('getAllLevels', (result) => {
      console.log(result, user);
      const levelContainer = document.querySelector('#levels');
  
      result.forEach((level) => {
        levelContainer.innerHTML += window.locales.translateRaw(levelHtml.replaceAll('{{name}}', level._id).replaceAll('{{author}}', level.creator));
      });
      result.forEach((level) => {
        const levelElement = levelContainer.querySelector('[data-name="' + level._id + '"]');
        if (level.name) levelElement.querySelector('.Level__Name').innerText = level.name;
        const subscribeButton = levelElement.querySelector('[data-action="subscribe"]'),
              unsubscribeButton = levelElement.querySelector('[data-action="unsubscribe"]');
        if (user.savedLevels.includes(level._id)) {
          unsubscribeButton.classList.remove('dn');
        }
        else if (!user.createdLevels.includes(level._id)) {
          subscribeButton.classList.remove('dn');
        }
        subscribeButton.addEventListener('click', (e) => {
          window.api.post('subscribe', { _id: e.target.closest('[data-name]').getAttribute('data-name') }, (result) => {
            window.ps.save('user', JSON.stringify(result));
            subscribeButton.classList.add('dn');
            unsubscribeButton.classList.remove('dn');
          }, (error) => {
            console.error(error);
          });
        });
        unsubscribeButton.addEventListener('click', (e) => {
          window.api.post('unsubscribe', { _id: e.target.closest('[data-name]').getAttribute('data-name') }, (result) => {
            window.ps.save('user', JSON.stringify(result));
            subscribeButton.classList.remove('dn');
            unsubscribeButton.classList.add('dn');
          }, (error) => {
            console.error(error);
          });
        });
      });
      window.pwa.initLinks();
    }, (error) => {
      console.error(error);
    });
  }
  window.dispatchEvent(new CustomEvent('progress:executed'));
})();