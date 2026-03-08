import { Page } from '@playwright/test';
import testData from '../test-data/employee.data.json';


export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async enterUserName(user: string) {
        const userField = this.page.locator("//input[@id='Username']");
        await userField.fill(user);
    }

    async enterPassword(password: string) {
        const passwordField = this.page.locator("//input[@id='Password']");
        await passwordField.fill(password);
    }

    async clickLogin() {
        const loginButton = this.page.locator("//button[@type='submit']");
        await loginButton.click();
    }

    async getErrorMessage(){
        return this.page.locator("//div[contains(@class, 'danger')]//li");
    }
}