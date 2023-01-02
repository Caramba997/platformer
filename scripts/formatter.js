class Formatter {
  constructor() {}

  formatTime(time) {
    let ms = time % 1000;
    ms = ms.toString();
    while (ms.length < 3) {
      ms = '0' + ms;
    }
    return `${Math.floor(time / 1000)}.${ms} s`;
  }
}

window.formatter = new Formatter();