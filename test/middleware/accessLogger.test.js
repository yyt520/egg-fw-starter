'use strict';

const fs = require('fs');
const path = require('path');
const {app, assert} = require('egg-mock/bootstrap');

describe('[Middleware accessLogger]', () => {
  let logPath = '';
  before(() => {
    logPath = path.join(app.config.logger.dir, app.config.logger.appLogName);
  });

  it('Has request record in log', async () => {
    const randomRoute = `/test${parseInt(Math.random() * 10000 + 100)}`;
    app.get(randomRoute, app.middleware.accessLogger(app.config.accessLogger), (ctx) => {
      ctx.body = 'access successfully';
    });

    await app.httpRequest().get(randomRoute).expect('access successfully');
    const isFound = await findLog(logPath, randomRoute);
    assert(isFound === true);
  });

  it('Has no record when requesting js file', async () => {
    const randomJSFile = `/js/app.${parseInt(Math.random() * 10000 + 100)}.js`;
    app.get(randomJSFile, app.middleware.accessLogger(app.config.accessLogger), (ctx) => {
      ctx.body = 'js file';
    });

    await app.httpRequest().get(randomJSFile).expect('js file');
    const isFound = await findLog(logPath, randomJSFile);
    assert(isFound === false);
  });

  it('Set ignore option with function value', async () => {
    const accessLoggerConfig = Object.assign({}, app.config.accessLogger);

    // 不记录含ignore的请求
    accessLoggerConfig.ignore = url => url.indexOf('ignore') >= 0;
    const middleware = app.middleware.accessLogger(accessLoggerConfig);

    const ignore = `/ignore/${parseInt(Math.random() * 10000 + 100)}`;
    const record = `/record/${parseInt(Math.random() * 10000 + 100)}`;
    app.get(ignore, middleware, (ctx) => {
      ctx.body = 'ignore';
    });
    app.get(record, middleware, (ctx) => {
      ctx.body = 'record';
    });

    await app.httpRequest().get(ignore).expect('ignore');
    await app.httpRequest().get(record).expect('record');
    const isIgnoreFound = await findLog(logPath, ignore);
    assert(isIgnoreFound === false);
    const isRecordFound = await findLog(logPath, record);
    assert(isRecordFound === true);
  });

  it('Set ignore option with string value', async () => {
    const accessLoggerConfig = Object.assign({}, app.config.accessLogger);
    
    // 不记录含.json的请求
    accessLoggerConfig.ignore = '.json';
    const middleware = app.middleware.accessLogger(accessLoggerConfig);

    const ignore = `/${parseInt(Math.random() * 10000 + 100)}.json`;
    const record = `/${parseInt(Math.random() * 10000 + 100)}.css`;
    app.get(ignore, middleware, (ctx) => {
      ctx.body = 'ignore';
    });
    app.get(record, middleware, (ctx) => {
      ctx.body = 'record';
    });

    await app.httpRequest().get(ignore).expect('ignore');
    await app.httpRequest().get(record).expect('record');
    const isIgnoreFound = await findLog(logPath, ignore);
    assert(isIgnoreFound === false);
    const isRecordFound = await findLog(logPath, record);
    assert(isRecordFound === true);
  });

  it('Set level option with unmatched level', async () => {
    const accessLoggerConfig = Object.assign({}, app.config.accessLogger);
    
    // 不记录含.json的请求
    accessLoggerConfig.level = 'testLevel';
    const middleware = app.middleware.accessLogger(accessLoggerConfig);

    app.get('/testLevel', middleware, (ctx) => {
      ctx.body = 'testLevel';
    });

    await app.httpRequest().get('/testLevel').expect('testLevel');
    const isFound = await findLog(logPath, 'testLevel');
    assert(isFound === true);
  });
  
});

/**
 * 在日志中查找访问记录
 * @param {String} path - 日志路径 
 * @param {String} route - 要查找的记录
 * @returns {Boolean} - 是否找到
 */
function findLog(path, route) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data.toString().split('\n').filter(log => log.indexOf(route) >= 0).length > 0);
    });
  });
}
