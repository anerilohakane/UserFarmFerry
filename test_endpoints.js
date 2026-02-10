const axios = require('axios');

const BASE_URL = 'https://farm-ferry-backend-new.vercel.app/api/v1';

async function testEndpoint(path, method = 'get') {
    let url = `${BASE_URL}${path}`;
    if (path.startsWith('http')) {
        url = path;
    }

    console.log(`Testing (${method}): ${url}`);
    try {
        const response = await axios({ method, url });
        console.log(`Success (${response.status})`);
    } catch (error) {
        if (error.response) {
            console.log(`Failed (${error.response.status}): ${error.response.statusText}`);
            if (typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
                console.log('Response is HTML (Likely 404 Page)');
            } else {
                console.log('Response is JSON/Data');
            }
        } else {
            console.log(`Error: ${error.message}`);
        }
    }
}

async function run() {
    // Test 1: Verify Base URL with Login (expecting 400 or 401, not 404 HTML)
    await testEndpoint('/auth/login', 'post');

    // Test 2: Try without v1
    await testEndpoint('https://farm-ferry-backend-new.vercel.app/api/customer/profile');

    // Test 3: Try simplified paths
    await testEndpoint('https://farm-ferry-backend-new.vercel.app/customer/profile');

    // Test 4: Check if any endpoint works
    await testEndpoint('/products?page=1&limit=10');
}

run();
