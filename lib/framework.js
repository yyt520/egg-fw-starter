'use strict';

const path = require('path');
const {Application, Agent} = require('egg');

const EGG_PATH = Symbol.for('egg#eggPath');

class FWApplication extends Application {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

class FWAgent extends Agent {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

module.exports = {Application: FWApplication, Agent: FWAgent};
