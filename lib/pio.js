'use strict';

const
	_ = require('lodash'),
	fs = require('fs-extra'),
	cp = require('child_process'),
	Promise = require('bluebird');

let pins = fs.readJsonSync('./pins.json');

module.exports.pins = pins;
module.exports.getPin = getPin;
module.exports.mode = mode;
module.exports.read = read;
module.exports.write = write;
// module.exports.reset = reset;
// module.exports.resetAll = resetAll;

function getPin(query){
	return _.find(pins, query);
}

function mode(wpi, mode){
	return exec(`gpio mode ${wpi} ${mode}`)
		.then(() => {
			let pin = getPin({wpi: wpi});
			pin.mode = mode;
		});
}

function read(wpi){
	return exec(`gpio read ${wpi}`)
		.spread((stdout,stderr) => _.parseInt(stdout));
}

function write(wpi, value){
	return exec(`gpio write ${wpi} ${value}`)
		.then(() => {
			let pin = getPin({wpi: wpi});
			pin.value = value;
		});
}

/*function reset(query){
	let pin = _.find(pins, query);
	return Promise.resolve()
		.then(() => mode(pin.wpi, 'out'))
		.then(() => write(pin.wpi, pin.value))
		.then(() => mode(pin.wpi, pin.mode));
}

function resetAll(){
	return _(pins)
		.filter(pin => _.isNumber(pin.wpi))
		.map(pin => reset(pin))
		.thru(Promise.all)
		.value();
}*/

function exec(cmd){
	return new Promise((resolve, reject) => {
		let child = cp.exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err);
			} else {
				resolve([stdout, stderr]);
			}
		});
	});
}
