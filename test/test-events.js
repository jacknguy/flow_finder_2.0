'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { Event } = require('../models');
const { app, runServer, closeServer } = require('../server.js');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);


function seedEventData() {
	console.info('seeding event data');
	const seedData = [];

	for(let i=1; i<=10; i++){
		seedData.push(generateEventData());
	}
	return Event.insertMany(seedData);
}

function generateProp() {
	const props = ['Hoop', 'Staff', 'Poi', 'Rope Dart'];
	return props[Math.floor(Math.random() * props.length)];
}

function generateEventData(){
	return {
		name: faker.lorem.sentence(),
		description: faker.lorem.paragraph(),
		address:{
			building: faker.address.streetAddress(),
			street: faker.address.streetName(),
			city: faker.address.city(),
			state: faker.address.state(),
			zipcode: faker.address.zipcode()
		},
		date: 'January 1, 2018',
		time: {
			startTime: 7,
			endTime: 9
		},
		prop: generateProp()
	}
}

//clear database for each test
function tearDownDb() {
	console.warn('deleting database');
	return mongoose.connection.dropDatabase();
}


describe('Events API Resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL);
	})

	beforeEach(function() {
		return seedEventData();
	})

	afterEach(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	})

	describe('GET endpoint', function() {
		it('should return all existing events', function() {
			
			let res;
			return chai.request(app)
				.get('/events')
				.then(function(_res){
					res = _res;

					expect(rest).to.have.status(200);
					console.info(res.body);
					expect(res.body).to.have.lengthOf.at.least(1);
					return Event.count();
				})
				.then(function(count){
					expect(res.body).to.have.lengthOf(count);
				})
		})

		it('should return events with the right fields', function(){
			
			let resEvent;
			return chai.request(app)
				.get('events')
				.then(function(res){
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.have.lengthOf.at.least(1);

					res.body.forEach(function(event){
						expect(event).to.be.a('object');
						expect(event).to.include.keys('id', 'name', 'description', 'address', 'date', 'time', 'prop', 'created');
					})
					resEvent = res.body[0];
					return Event.findById(resEvent.id);
				})
				.then(function(event){
					console.info(resEvent);
					console.info(event);
					expect(resEvent.name).to.equal(event.title);
					expect(resEvent.description).to.equal(event.description);
					expect(resEvent.address).to.equal(event.address);
					expect(resEvent.date).to.equal(event.date);
					expect(resEvent.time).to.equal(event.time);
					expect(resEvent.prop).to.equal(event.prop);
				})
		})
	})
})

























