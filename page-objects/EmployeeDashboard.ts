import { Page } from '@playwright/test';


export class EmployeeDashboard {

    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async clickAdd() {
        return await this.page.locator("//button[@id='add']").click();
    }

    async enterFirstName(fName: string) {
        const fNameField = this.page.locator("//input[@id ='firstName']");
        await fNameField.fill(fName);
    }

    async enterLastName(lName: string) {
        const lNameField = this.page.locator("//input[@id ='lastName']");
        await lNameField.fill(lName);
    } 

    async enterDependants(dependents: string) {
        const lNameField = this.page.locator("//input[@id ='dependants']");
        await lNameField.fill(dependents);
    } 

   async clickAddEmp() {
    await this.page.locator("//button[@id='addEmployee']").waitFor({ state: 'visible' });
    return await this.page.locator("//button[@id='addEmployee']").click();
    }

    async getAmountOfEmps(){

        await this.page.locator("//tbody//tr").first().waitFor({ state: 'visible' });
        return await this.page.locator("//tbody//tr").count();

    }

    async getRowInfo(empID: string){
        const row = this.page.locator("//tbody//tr").filter({hasText:empID})

        const info =  await row.locator('td').allTextContents();
        return {
            id:info[0],
            lName:info[2],
            fName:info[1],
            depend: info[3],
            salary: info[4],
            grossP: info[5],
            bCost:info[6],
            nPay: info[7]
        }

    }

    async createEmployee(fName:string, lName:string, depend:string){
        await this.clickAdd();
        await this.enterFirstName(fName);
        await this.enterLastName(lName);
        await this.enterDependants(depend)
        const responsePromise = this.page.waitForResponse(resp => resp.url().toLocaleLowerCase().includes('api/employees') && resp.request().method() === 'POST');
        await this.clickAddEmp();
        await this.page.waitForResponse('api/employees');
        const response = await responsePromise;
        return response;

    }

    async clickUpdateEmp(){
       return await this.page.locator("//button[@id='updateEmployee']").click()


    }

    



}
