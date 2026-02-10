const axios = require('axios');

const BASE_URL = 'https://farm-ferry-backend-new.vercel.app/api/v1';
const DOUBLE_URL = 'https://farm-ferry-backend-new.vercel.app/api/v1/api/v1';

const orderData = {
    // Add some dummy order data here based on typical schema
    items: [],
    totalAmount: 100,
    address: "Test Address",
    paymentMethod: "COD"
};

async function testEndpoint(url, label) {
    try {
        console.log(`Testing ${label}: ${url}/orders`);
        const response = await axios.post(`${url}/orders`, orderData);
        console.log(`${label} Success:`, response.status);
    } catch (error) {
        if (error.response) {
            console.log(`${label} Failed:`, error.response.status, error.response.statusText);
            console.log('Data:', error.response.data);
        } else {
            console.log(`${label} Error:`, error.message);
        }
    }
}

async function run() {
    await testEndpoint(BASE_URL, 'Single v1');
    await testEndpoint(DOUBLE_URL, 'Double v1');
}

run();
