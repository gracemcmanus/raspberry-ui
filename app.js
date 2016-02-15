'use strict';

const
  _ = require('lodash'),
  path = require('path'),
  cp = require('child_process'),
  ejs = require('ejs'),
  express = require('express'),
  http = require('http'),
  socket = require('socket.io'),
  Promise = require('bluebird'),
  gpio = Promise.promisifyAll(require('pi-gpio'));

const
  PORT = 3000,
  PINS = [
    {index: 1, label: '3V3'},
    {index: 2, label: '5V'},
    {index: 3, label: 'GPIO-0'},
    {index: 4, label: '5V'},
    {index: 5, label: 'GPIO-1'},
    {index: 6, label: 'GROUND'},
    {index: 7, label: 'GPIO-4'},
    {index: 8, label: 'GPIO-14'},
    {index: 9, label: 'GROUND'},
    {index: 10, label: 'GPIO-15'},
    {index: 11, label: 'GPIO-17'},
    {index: 12, label: 'GPIO-18'},
    {index: 13, label: 'GPIO-21'},
    {index: 14, label: 'GROUND'},
    {index: 15, label: 'GPIO-22'},
    {index: 16, label: 'GPIO-23'},
    {index: 17, label: '3V3'},
    {index: 18, label: 'GPIO-24'},
    {index: 19, label: 'GPIO-10'},
    {index: 20, label: 'GROUND'},
    {index: 21, label: 'GPIO-9'},
    {index: 22, label: 'GPIO-25'},
    {index: 23, label: 'GPIO-11'},
    {index: 24, label: 'GPIO-8'},
    {index: 25, label: 'GROUND'},
    {index: 26, label: 'GPIO-7'}
  ];

const
  app = express(),
  server = http.createServer(app),
  io = socket(server);

// Clean up any open sockets
cp.execSync('python ./cleanup.py');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.render('index', {title: 'My Page'});
});

app.get('/pins', (req, res, next) => {
  _(PINS)
    .map((pin, index) => {
      return gpio.openAsync(index, 'input')
        .then(() => gpio.readAsync(index))
        .then((state) => {
          gpio.close(index);
          return _.assign({
            state: state,
            mutable: true
          }, pin);
        })
        .catch((err) => {
          return _.assign({
            state: 1,
            mutable: false
          }, pin);
        });
    })
    .thru(Promise.all)
    .value()
    .then(pins => res.json(pins));
});

io.on('connection', (socket) => {
  socket.on('statechange', (msg) => {
    gpio.openAsync(msg.index, 'output')
      .then(() => gpio.writeAsync(msg.index, msg.state))
      .then(() => gpio.close(msg.index))
      .then(() => io.emit('statechange', msg))
      .catch((err) => {
        msg.state = msg.state ? 0 : 1;
        io.emit('error', msg);
        gpio.close(msg.index);
      });
  });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// handle errors and send stacktrace
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
