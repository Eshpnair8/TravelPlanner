const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const tripsRouter = require('./routes/trips');

async function main() {
  const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
  await client.connect();

  const db = client.db(process.env.MONGO_DB_NAME);
  app.locals.db = db;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view engine', 'ejs');

  app.use('/', require('./routes/trips'));

  app.listen(PORT, () => {
    console.log(`Web server started and running at http://localhost:${PORT}`);
    console.log('Type "Stop" to shutdown the server.');
  });

  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    if (input.trim().toLowerCase() === 'stop') {
      console.log('Shutting down the server...');
      rl.close();
      client.close();
      process.exit(0);
    }
  });
}

main().catch(console.error);
