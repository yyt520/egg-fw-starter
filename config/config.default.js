'use strict';

module.exports = {
  keys: 'egg-fw-starter',
  accessLogger: {
    format: ':ip :method :url :status :ms',
    ignore: /(\.js)|(\.css)|(\.jpg)|(\.jpeg)|(\.png)$/,
    level: 'info'
  }
};
