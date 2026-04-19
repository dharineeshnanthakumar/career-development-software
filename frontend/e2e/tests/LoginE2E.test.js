const { Builder, until } = require('selenium-webdriver');
const LoginPage = require('../pages/LoginPage');
const edge = require('selenium-webdriver/edge');

// Increase timeout for E2E tests
jest.setTimeout(30000);

describe('Login E2E Flow', () => {
    let driver;
    let loginPage;

    beforeAll(async () => {
        let options = new edge.Options();
        // options.addArguments('--headless'); // Use headless mode for CI/CD
        
        driver = await new Builder()
            .forBrowser('MicrosoftEdge')
            .setEdgeOptions(options)
            .build();
            
        loginPage = new LoginPage(driver);
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test('should show error on invalid login', async () => {
        await loginPage.login('invalid@example.com', 'wrongpassword');
        
        // Assuming your backend/frontend displays an error on invalid login
        // e.g. UnauthorizedException
        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toContain('Invalid email or password');
    });

    // In a real scenario, this would rely on a prepopulated dev database
    test('should successfully route to dashboard on login', async () => {
        // Assume student@example.com / password123 is seeded in DB
        await loginPage.login('student@example.com', 'password123');
        
        // Wait for URL to change to dashboard
        await driver.wait(until.urlContains('/dashboard'), 10000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain('/dashboard');
    });
});
