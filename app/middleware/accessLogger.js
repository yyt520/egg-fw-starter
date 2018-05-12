'use strict';

/**
 * 生成本次访问信息
 * @param {Object} ctx - 请求上下文 
 * @param {Number} recordTime - 请求开始处理时间
 */
function getAccessInfo(ctx, recordTime) {
  const {request, response, ip} = ctx;
  return {
    method: request.method,
    url: request.url,
    ip,
    status: response.status,
    ms: `${Date.now() - recordTime}ms`
  }; 
}

/**
 * 请求记录-中间件
 * @param {Object} option - 插件配置
 * @param {String} option.format - 记录格式，占位符说明 (:ms 处理时间, :method 请求方法, :url 请求路由, :ip 请求IP, :status 响应状态)
 * @param {String} option.level - 日志级别(默认: info)
 * @param {RegExp|Function|String} option.ignore - 可忽略的路由
 */
module.exports = (option) => {
  return async (ctx, next) => {
    const url = ctx.request.url;

    let isIgnored = false;
    if (option.ignore instanceof RegExp) {
      isIgnored = option.ignore.test(url);
    } else if (option.ignore instanceof Function) {
      isIgnored = option.ignore(url);
    } else if (typeof option.ignore === 'string') {
      isIgnored = url.indexOf(option.ignore) >= 0;
    }

    // 如果是可忽略的路由，不进行记录
    if (isIgnored) {
      return next();
    }

    const recordTime = Date.now();
    await next();
    const accessInfo = getAccessInfo(ctx, recordTime);
    let format = `[access-logger] ${option.format}`;
    Object.keys(accessInfo).forEach((key) => {
      format = format.replace(`:${key}`, accessInfo[key]);
    });
    if (ctx.logger[option.level.toLowerCase()] instanceof Function) {
      ctx.app.logger[option.level.toLowerCase()](format);
    } else {
      ctx.app.logger.info(format);
    }
  };
};
