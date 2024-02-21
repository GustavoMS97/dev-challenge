const runServer = require('./server');

async function main() {
  const app = await runServer();
  app.listen(3001, () => {
    console.log('Express App Listening on Port 3001');
  });
}

main();
