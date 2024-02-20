const Express = require('express');

exports.startApp = () => {
  try {
    const app = Express();
    app.use(Express.json({ limit: '1mb' }));
    return app;
  } catch (error) {
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error('Error starting api server');
  }
};
