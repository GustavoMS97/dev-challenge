const SequelizeManager = require('./infra/sequelize');
const { startApp } = require('./infra/express');

const ProfileMiddlewareFactory = require('./domain/profile/profile.middleware');

const contractRouter = require('./domain/contract/contract.router');
const jobRouter = require('./domain/job/job.router');
const balanceRouter = require('./domain/balance/balance.router');
const adminRouter = require('./domain/admin/admin.router');

async function runServer() {
  try {
    // DB start
    const sequelizeManager = new SequelizeManager();
    const sequelize = sequelizeManager.start();
    sequelizeManager.createRelationships();
    // API start
    const app = startApp();
    app.set('sequelize', sequelize);
    app.set('models', sequelize.models);
    app.set('middlewares', { ...ProfileMiddlewareFactory(app) });
    // routers
    app.use('/contracts', contractRouter(app));
    app.use('/jobs', jobRouter(app));
    app.use('/balances', balanceRouter(app));
    app.use('/admin', adminRouter(app));
    // eslint-disable-next-line no-unused-vars
    app.use((error, _req, res, _next) => {
      return res.status(500).send({ message: error.message });
    });

    return app;
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    process.exit(1);
  }
}

module.exports = runServer;
