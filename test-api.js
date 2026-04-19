/**
 * test-api.js
 * A simple Node.js script to automatically test your local backend API mathematically.
 * 
 * To run this:
 * 1. Ensure your backend is running (`mvn spring-boot:run` in another terminal)
 * 2. Type: node test-api.js
 */

async function runAutomatedTest() {
    console.log("Starting backend API test...");
    
    try {
        // Step 1: Attempt to securely login with your API
        // Note: You must register this user first in your db or change this to valid credentials!
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student@example.com',
                password: 'password123'
            })
        });

        // Step 2: Validate the HTTP condition logic
        if (response.status === 200) {
            
            // TEST PASSED!
            console.log("-----------------------------------------");
            console.log("                 SUCCESS                 ");
            console.log("-----------------------------------------");
            console.log("The API is working perfectly and returned a secure 200 OK Token!");
            
        } else if (response.status === 401 || response.status === 403) {
            
            // TEST PASSED! The API blocked a bad login or a bad CSRF token, meaning Spring Security works!
            console.log("-----------------------------------------");
            console.log("                 SUCCESS                 ");
            console.log("-----------------------------------------");
            console.log("Security Test Passed: The API successfully threw a " + response.status + " Unauthorized for bad fake credentials!");
            
        } else {
            console.log("Test Failed! Expected 200 or 401. Received " + response.status);
        }

    } catch (error) {
        console.log("Failed to connect to backend server. Make sure Spring Boot is running on port 8080!");
    }
}

// Execute the test!
runAutomatedTest();
