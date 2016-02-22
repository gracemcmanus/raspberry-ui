'use strict';

const
	_ = require('lodash'),
	path = require('path'),
	cp = require('child_process'),
	ejs = require('ejs'),
	fs = require('fs-extra'),
	express = require('express'),
	http = require('http'),
	socket = require('socket.io'),
	Promise = require('bluebird'),
	pio = require('./lib/pio');

const PORT = 3000;

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
	res.json(pio.pins);
});

io.on('connection', (socket) => {
	socket.on('change', (msg) => {
		pio.mode(msg.wpi, 'out')
			.then(() => pio.write(msg.wpi, msg.value))
			.then(() => io.emit('change', msg))
			.catch((err) => {
				msg.state = pio.getPin({wpi: msg.wpi}).state;
				io.emit('error', msg);
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
