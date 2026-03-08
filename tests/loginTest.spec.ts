import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage'
import testData from '../test-data/employee.data.json';

test.beforeEach(async ({ page }) => {
    await page.goto("Account/LogIn");
})

test('TC001_Login_Valid-Login', async ({ page }) => {
    const loginP = new LoginPage(page);
    await loginP.enterUserName(testData.auth.user);
    await loginP.enterPassword(testData.auth.password);
    await loginP.clickLogin();

    expect(page.locator("//header")).toContainText("Paylocity Benefits Dashboard");

});

for(let invalidLogin of testData.invalidLogins){
    test(`TC002_Login-${invalidLogin.scenario}`, async({page})=>{
        const loginP = new LoginPage(page);
        await loginP.enterUserName(invalidLogin.data.user);
        await loginP.enterPassword(invalidLogin.data.password);
        await loginP.clickLogin();

        const error = await page.locator("//div[contains(@class, 'danger')]//li").textContent();

        expect.soft(error).toBe(invalidLogin.data.error);
 

    })


}

