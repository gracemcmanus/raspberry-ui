'use strict';

const
	_ = require('lodash'),
	path = require('path'),
	fs = require('fs-extra'),
	cp = require('child_process'),
	Promise = require('bluebird');

exports.pins = fs.readJsonSync(path.resolve(__dirname, '../pins.json'));

exports.getPin = function getPin(query){
	return _.find(exports.pins, query);
};

exports.mode = function mode(wpi, md){
	return exec(`gpio mode ${wpi} ${md}`)
		.then(() => {
			let pin = exports.getPin({wpi: wpi});
			pin.mode = md;
		});
};

exports.read = function read(wpi){
	return exec(`gpio read ${wpi}`)
		.spread((stdout,stderr) => _.parseInt(stdout));
};

exports.write = function write(wpi, value){
	return exec(`gpio write ${wpi} ${value}`)
		.then(() => {
			let pin = exports.getPin({wpi: wpi});
			pin.value = value;
		});
};

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
