const { By, until } = require('selenium-webdriver');

class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'http://localhost:5173/'; // Default Vite port

        // Locators
        this.studentPortalButton = By.xpath('//button[contains(text(), "Continue as Student")]');
        this.emailInput = By.css('input[name="username"]'); // The React form uses name="username" for the email box
        this.passwordInput = By.css('input[type="password"]');
        this.submitButton = By.css('button[type="submit"]');
        this.errorMessage = By.className('error-message');
    }

    async navigate() {
        await this.driver.get(this.url);
    }

    async enterEmail(email) {
        let input = await this.driver.wait(until.elementLocated(this.emailInput), 5000);
        await input.sendKeys(email);
    }

    async enterPassword(password) {
        let input = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
        await input.sendKeys(password);
    }

    async submit() {
        let button = await this.driver.wait(until.elementLocated(this.submitButton), 5000);
        await button.click();
    }

    async getErrorMessage() {
        let errorEl = await this.driver.wait(until.elementLocated(this.errorMessage), 5000);
        return await errorEl.getText();
    }

    async clickStudentPortal() {
        let button = await this.driver.wait(until.elementLocated(this.studentPortalButton), 5000);
        await button.click();
    }

    async login(email, password) {
        await this.navigate();
        await this.clickStudentPortal(); // Click to open the LoginOverlay modal
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.submit();
    }
}

module.exports = LoginPage;
