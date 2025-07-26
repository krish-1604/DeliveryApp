 
/* eslint-disable no-console */
import { DriverAPI } from './driver';

const client = new DriverAPI(); // initialize the API client (do once globally)

// to set token
client.setBearer('token here');
// check if backend is on (health)

client.healthCheck().then((response) => {
	console.log('Backend is running:', response);
});

// // get 2 drivers

client.getDrivers({ limit: 2 }).then((response) => {
	console.log('Drivers:', response);
});

// get driver by ID
client.getSingleDriver('cmdjwdyyd0002x9ybuxxxas7r').then((response) => {
	console.log('Driver Details:', response);
});
