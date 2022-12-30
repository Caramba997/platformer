class PlatformerStorage {
  constructor() {
    this.objects = {
      sounds: 'sounds',
      level: 'level',
      levelData: 'levelData',
      editorLevel: 'editorLevel',
      editorData: 'editorData',
      progress: 'progress',
      language: 'language',
      user: 'user'
    }
  }

  load(object) {
    const key = this.objects[object];
    if (!key) {
      console.error('[Platformer Storage] Load: Unknown object');
      return;
    }
    return localStorage.getItem(key);
  }

  save(object, data) {
    const key = this.objects[object];
    if (!key) {
      console.error('[Platformer Storage] Save: Unknown object');
      return;
    }
    localStorage.setItem(key, data);
  }

  delete(object) {
    const key = this.objects[object];
    if (!key) {
      console.error('[Platformer Storage] Delete: Unknown object');
      return;
    }
    localStorage.removeItem(key);
  }

  /**
    * Set a cookie with name, value and expire. If expire is undefined, it will be a session cookie. Expire may have one of the following formats:
    * - 365d (365 days)
    * - 3h (3 hours)
    * - 3m (3 minutes)
    */
  setCookie(cname, cvalue, expire) {
    if (expire) {
      var d = new Date();
      if (expire.match(/\d{1,3}d$/)) {
        const exdays = parseInt(expire);
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
      }
      else if (expire.match(/\d{1,3}h$/)) {
        const exhours = parseInt(expire);
        d.setTime(d.getTime() + (exhours*60*60*1000));
      }
      else if (expire.match(/\d{1,3}m$/)) {
        const exminutes = parseInt(expire);
        d.setTime(d.getTime() + (exminutes*60*1000));
      }
      else {
        console.error(`Expire time invalid of cookie "${cname}" invalid`);
        return;
      }
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";SameSite=None;Secure;path=/";
    }
    else {
      document.cookie = cname + "=" + cvalue + ";SameSite=None;Secure;path=/";
    }
  }

  /**
  * Get the cookie for a given name, returns an empty string if cookie does not exist.
  */
  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
}

window.ps = new PlatformerStorage();