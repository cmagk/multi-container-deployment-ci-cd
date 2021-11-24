const redis = require('redis');
const keys = require('./keys');

console.log('HEY', process.env);

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  // if we disconnect from redis for any reason
  // we will keep trying to connect every sec (1000 ms)
  retry_strategy: () => 1000,
});

// the reason we use this duplicate connection
// is because according to redis docs for this js library
// when the connection is turned into a connection that is
// going to listen, subscribe or publish information it cannot be
// used for other purposes i.e. a listen connection can only be used to listen
// ---- Specifically for this ----
// redisClient -> used for hset
// sub -> used for subscribing on 'insert' event
const sub = redisClient.duplicate();

// THIS IS SLOW !!!!!!! (On purpose) --- RIP node.js call stack :)
// ***********
// We are using this recursive solution here on purpose
// so the use of redis as a cache makes a bit more sense
// and can really make a difference
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (_chan, msg) => {
  redisClient.hset('values', msg, fib(parseInt(msg)));
});

// instructing redis to watch for inserts on sub client
// whenever an insert is received the sub.on('message') is called
// and it sets the value -> msg:result on key -> values
sub.subscribe('insert');
