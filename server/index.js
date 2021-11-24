const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const keys = require('./keys');

const app = express();

const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
  user: keys.pgUser,
  password: keys.pgPassword,
});

pgClient.on('connect', (client) => {
  client.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch((err) => console.error(err));
});

const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (_req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (_req, res) => {
  redisClient.hgetall('values', (err, values) => {
    if (err) console.log(err);
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, '');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ status: 'success' });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
