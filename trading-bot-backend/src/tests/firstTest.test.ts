// Import the necessary modules

import supertest = require('supertest');
import * as chai from 'chai';
import app from '@/backend-server'; // Import your app
// const app = require('../../backend-server'); // Import your app


console.log("🚀 ~ file: app.test.ts:6 ~ app:", app)

// Destructure the expect function from Chai
const { expect } = chai;

// Use your app with Supertest
const request = supertest(app);

// Write the tests
describe('POST /set-rsi', () => {
    let server: any;


    before((done) => {
        console.log('Starting server...');
        server = app.listen(3000, done);
        console.log("🚀 ~ file: app.test.ts:23 ~ before ~ server:", server)
    });

    after((done) => {
        console.log('Stopping server...');
        server.close(done);
    });
    it('should respond with json and 200 status code', () => {
        request.post('/set-rsi')
            .send({
                pair: '1INCHUSDT',
                timeframe: '1d',
                rsiValues: [70, 30]
            })
            .expect('Content-Type', /json/)
            .expect(200).then((response) => {

                // Assert the response body
                expect(response.body).to.be.an('object');
                expect(response.body.message).to.equal('RSI values updated successfully');
            });

    });

    // it('should respond with json and 400 status code for invalid request body', () => {
    //     const response = await request.post('/set-rsi')
    //         .send({
    //             pair: '1INCHUSDT',
    //             timeframe: '1d'
    //             // missing rsiValues
    //         })
    //         .expect('Content-Type', /json/)
    //         .expect(400);

    //     // Assert the response body
    //     expect(response.body).to.be.an('object');
    //     expect(response.body.error).to.equal('Invalid request body');
    // });
});
