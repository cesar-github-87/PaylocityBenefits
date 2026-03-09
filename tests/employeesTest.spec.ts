
import { test, expect } from "@playwright/test";
import { EmployeeDashboard } from "../page-objects/employeeDashboard";
import { LoginPage } from "../page-objects/LoginPage";
import testData from '../test-data/employee.data.json';



test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async route => {
        const headers = {
            ...route.request().headers(),
            'authorization': 'Basic VGVzdFVzZXI5MTY6ZlRLNF8qWW5GL0xK'
        };

        await route.continue({ headers });
    });
    await page.goto("Benefits");
});

test("TC001-UI-Add_Employee", async ({ page }) => {

    const benefitP = new EmployeeDashboard(page);
    /*Scenario 1: Add Employee
        GIVEN an Employer
        AND I am on the Benefits Dashboard page 
        WHEN I select Add Employee
        THEN I should be able to enter employee details 
        AND the employee should save
        AND I should see the employee in the table 
        AND the benefit cost calculations are correc
    */

    const empAmount = await benefitP.getAmountOfEmps();
    console.log("Current emps", empAmount)

    await benefitP.clickAdd();
    await benefitP.enterFirstName(testData.newEmp.firstName);
    await benefitP.enterLastName(testData.newEmp.lastName);
    await benefitP.enterDependants(testData.newEmp.dependents);

    const responsePromise = page.waitForResponse(resp => resp.url().toLocaleLowerCase().includes('api/employees') && resp.request().method() === 'POST');
    await benefitP.clickAddEmp();
    //await page.waitForResponse('api/employees');
    const response = await responsePromise;

    console.log(await response.json())
    const responseJson = await response.json();
    const empID = responseJson.id;

    const newRow = page.locator(`//tr[td[text()='${empID}']]`); //It was failing at headless mode
    await expect(newRow).toBeVisible({ timeout: 10000 }); 
    await expect(page.locator("//tbody//tr")).toHaveCount(empAmount + 1);

    

    //I should see the employee in the table 
    console.log("Emp ID= ", empID);
    const empInfo = await benefitP.getRowInfo(empID);
    expect.soft(empInfo.id).toBe(empID); //IS the ID that API created in the table?
    expect.soft(empInfo.fName).toBe(testData.newEmp.firstName)//IS the first name we entered in the form the same as the one created?
    expect.soft(empInfo.lName).toBe(testData.newEmp.lastName)//IS the lasst name we entered in the form the same as the one created?
    expect.soft(empInfo.depend).toBe(testData.newEmp.dependents)//are the dependants the same on both places?

    /*
         based on assumptions
         All employees are paid $2000 per paycheck before deductions
         there are 26 paychecks in a year
         The cost of benefits is $1000/year for each employee
     `   Each dependent incurs a cost of $500/year 
     */
    const grossPay = 2000
    const benefitCost = 1000
    const dependantCost = 500 * Number(testData.newEmp.dependents)
    const salary = grossPay * 26
    const totalDeductions = (benefitCost / 26) + (dependantCost / 26)
    const netPay = grossPay - totalDeductions
    //Is information calculated in table correct?
     console.log(`Initial GrossPay:  ${grossPay} \n Initial BenefitCost: ${benefitCost} \n Initial Net Pay ${netPay}`)

    expect.soft(empInfo.bCost).toBe(totalDeductions.toFixed(2)); //Benefit cost
    expect.soft(empInfo.nPay).toBe(netPay.toFixed(2))  //NetPay 
    expect.soft(empInfo.salary).toBe(salary.toFixed(2)) //Salayr
    expect.soft(empInfo.grossP).toBe(grossPay.toFixed(2))

})

test("TC002-UI-Edit_Employee", async ({ page }) => {
    /*
        Scenario 2: Edit Employee 
        GIVEN an Employer
        AND I am on the Benefits Dashboard page
        WHEN I select the Action Edit
        THEN I can edit employee details
        AND the data should change in the table    
        
    */

    const benefitP = new EmployeeDashboard(page);

    const newEmp = await benefitP.createEmployee(testData.newEmp.firstName, testData.newEmp.lastName, testData.newEmp.dependents);
    const createdEmp = await newEmp.json()
    const id = createdEmp.id
    const row = page.locator("//tbody//tr").filter({ hasText: id })
    const editIcon = row.locator("//i[contains(@class, 'fa-edit')]");
    await editIcon.click();

    const modalTitle = await page.locator("//button[@id='updateEmployee']//parent::div//parent::div[contains(@class,'modal-content')]//h5").textContent();
    expect.soft(modalTitle).toBe("Edit Employee");
    await benefitP.enterFirstName(testData.editEmp.firstName);
    await benefitP.enterLastName(testData.editEmp.lastName);
    await benefitP.enterDependants(testData.editEmp.dependents);


    await benefitP.clickUpdateEmp();
    await page.locator('//div[contains(@class,"modal-content")]//button[@id = "updateEmployee"]').waitFor({ state: 'hidden' });
    await page.locator("//tbody//tr").first().waitFor({ state: 'visible' })
    await page.waitForTimeout(1000) //Not a good practices but wanted to verify the data

    //search for the employee again    
    const empInfo = await benefitP.getRowInfo(id);

    //validate info from table is same as entered data
    expect.soft(empInfo.fName).toBe(testData.editEmp.firstName);
    expect.soft(empInfo.lName).toBe(testData.editEmp.lastName);
    expect.soft(empInfo.depend).toBe(testData.editEmp.dependents);

    const grossPay = 2000
    const benefitCost = 1000
    const dependantCost = 500 * Number(testData.editEmp.dependents)
    const salary = grossPay * 26
    const totalDeductions = (benefitCost / 26) + (dependantCost / 26)
    const netPay = grossPay - totalDeductions

    console.log(`Updated GrossPay from calc:  ${grossPay} \n updated Benefit Cost from calc: ${benefitCost} \n Updated Net Pay from calc: ${netPay}`)
    console.log(`Updated GrossPay from table:  ${empInfo.grossP} \n updated Benefit Cost from table: ${empInfo.bCost} \n Updated Net Pay from table: ${empInfo.nPay}`)

    //Is the new Information calculated in table correct?

    expect.soft(empInfo.bCost).toBe(totalDeductions.toFixed(2)); //Benefit cost
    expect.soft(empInfo.nPay).toBe(netPay.toFixed(2))  //NetPay 
    expect.soft(empInfo.salary).toBe(salary.toFixed(2)) //Salayr
    expect.soft(empInfo.grossP).toBe(grossPay.toFixed(2))

})

test("TC003-UI-Delete_Employee", async ({ page }) => {
    /*
    GIVEN an Employer
    AND I am on the Benefits Dashboard page 
    WHEN I click the Action X
    THEN the employee should be deleted
    */

    const benefitP = new EmployeeDashboard(page);

    const newEmp = await benefitP.createEmployee(testData.newEmp.firstName, testData.newEmp.lastName, testData.newEmp.dependents);
    const createdEmp = await newEmp.json()
    const id = createdEmp.id
    console.log("The  id ", id)

    const row = page.locator("//tbody//tr").filter({ hasText: id })
    const deletIcon = row.locator("//i[contains(@class, 'fa-times')]");
    await deletIcon.click()
    await page.locator("//button[@id='deleteEmployee']").click()

    const remainingIDs = await page.locator("//tbody//tr/td[1]").allTextContents()
    //expect(remainingIDs).not.toContain(id)
    await expect(page.locator(`//tbody//tr/td[1][text()='${id}']`)).not.toBeVisible();



})