import { test, expect } from '@playwright/test';
import testData from '../test-data/employee.data.json'

/**
 * Suite de Pruebas de API - Employee Management & Benefit Calculations
 * Este spec valida tanto la respuesta de los requests como la integridad de los datos financieros.
 */
test.describe(() => {

    const AUTH_HEADER = {
        'Authorization': 'Basic VGVzdFVzZXI5MTY6ZlRLNF8qWW5GL0xK', 'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    const GROSS_PAY = 2000;
    const BENEFIT_COST = 1000;




    let createdId: string;


    test('TC001_API_POST-Create_Add_Employee_Response_CODE', async ({ request }) => {

        const firstName = testData.newAPIEmp.firstName;
        const lastName = testData.newAPIEmp.lastName;
        const dependants = testData.newAPIEmp.dependents;


        //console.log(` Json Dependants: ${dependants} `)
        const response = await request.post('api/employees', {
            headers: AUTH_HEADER,
            data: { firstName, lastName, dependants }
        });

        console.log(await response.json())

        expect(response.status()).toBe(201);


    });


    test('TC002_API_POST-Add_Employee_Data', async ({ request }) => {

        const firstName = testData.newAPIEmp.firstName;
        const lastName = testData.newAPIEmp.lastName;
        const dependants = testData.newAPIEmp.dependents;

        const SALARY = GROSS_PAY * 26;
        const DEPENDANT_COST = 500 * Number(dependants);
        const TOTAL_DEDUCTIONS = (BENEFIT_COST / 26) + (DEPENDANT_COST / 26);
        const NET_PAY = GROSS_PAY - TOTAL_DEDUCTIONS;


        console.log(` Json Dependants: ${dependants} `)
        const response = await request.post('api/employees', {
            headers: AUTH_HEADER,
            data: { firstName, lastName, dependants }
        });
        const body = await response.json();
        createdId = body.id;

        console.log("Response Dependants: ", body.dependants)

        expect.soft(body.firstName).toBe(firstName);
        expect.soft(body.lastName).toBe(lastName);
        expect.soft(body.dependants).toBe(dependants);
        expect.soft(Number(body.net)).toBe(Number(NET_PAY.toFixed(4)));
        expect.soft(Number(body.benefitsCost)).toBe(Number(TOTAL_DEDUCTIONS.toFixed(5)));


    });
    test('TC003_API_POST-Add_Employee_Negative_Dependants', async ({ request }) => {

        const firstName = testData.newAPIEmp.firstName;
        const lastName = testData.newAPIEmp.lastName;
        const dependants = testData.newAPIEmp.dependents;

        const SALARY = GROSS_PAY * 26;
        const DEPENDANT_COST = 500 * Number(dependants);
        const TOTAL_DEDUCTIONS = (BENEFIT_COST / 26) + (DEPENDANT_COST / 26);
        const NET_PAY = GROSS_PAY - TOTAL_DEDUCTIONS;


        console.log(` Json Dependants: ${dependants} `)
        const response = await request.post('api/employees', {
            headers: AUTH_HEADER,
            data: { firstName, lastName, dependants: -1 }
        });

        expect(response.status()).toBe(400);

    });


    test('TC004_API_GET-Get_Employees', async ({ request }) => {


        const response = await request.get('api/employees/', { headers: AUTH_HEADER });

        expect(response.status()).toBe(200);
        const list = await response.json();

        expect(Array.isArray(list)).toBeTruthy();
        if (list.length > 0) {
            expect(list[0]).toHaveProperty('id');
            expect(list[0]).toHaveProperty('firstName');
        }
    });


    test('TC005_API_PUT-Update_Employee', async ({ request }) => {
        const updatedDeps = 5;

        const employeesResp = await request.get('api/employees/', { headers: AUTH_HEADER });
        const employees = await employeesResp.json()
        const firstID = employees[0].id


        const response = await request.put('api/employees', {
            headers: AUTH_HEADER,
            data: {
                id: firstID,
                firstName: "Alejandro",
                lastName: "Updated",
                dependants: updatedDeps
            }
        });

        console.log("THe id", firstID)

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.dependants).toBe(updatedDeps);
    });

    test('TC006_API_PUT-Update_Employee_No_ID', async ({ request }) => {
        const updatedDeps = 5;

        const employeesResp = await request.get('api/employees/', { headers: AUTH_HEADER });
        const employees = await employeesResp.json()
        const firstID = employees[0].id


        const response = await request.put('api/employees', {
            headers: AUTH_HEADER,
            data: {

                firstName: "Alejandro",
                lastName: "Updated",
                dependants: updatedDeps
            }
        });

        console.log("THe id", firstID)

        expect(response.status()).toBe(405);
        const body = await response.json();
        expect(body.dependants).toBe(updatedDeps);
    });

    test('TC007_API_GET-Employee_Info_with_id', async ({ request }) => {

        //get first ID from list:
        const employeesResp = await request.get('api/employees/', { headers: AUTH_HEADER });
        const employees = await employeesResp.json()
        const firstID = employees[0].id
        //console.log("from the list:\n", employees[0])

        const response = await request.get('api/employees/' + firstID, { headers: AUTH_HEADER });


        expect.soft(response.status()).toBe(200);
        const emp = await response.json()
        //console.log("single\n: ", emp)
        //compare employee data from whole list of employees vs data from the single employee request
        expect(emp).toEqual(employees[0])



    });

    test('TC007_API_GET-Get_WrongEmployee_id', async ({ request }) => {


        const response = await request.get('api/employees/222a22ae-2b22-2e22-ac11-222cd2a22222', { headers: AUTH_HEADER });
        // console.log('El status', response.status())
        expect(response.status()).toBe(400);


    });

    test('TC008_API_DELETE_first_employee', async ({ request }) => {

        const listResponse = await request.get('api/employees', { headers: AUTH_HEADER });
        const employees = await listResponse.json();

        const id = employees[0].id;


        const deleteResponse = await request.delete(`api/employees/${id}`, {
            headers: AUTH_HEADER
        });


        expect(deleteResponse.status()).toBe(200);

        //Deleted ID still there?
        const newResponse = await request.get('api/employees', { headers: AUTH_HEADER });
        const updatedList = await newResponse.json();

        const exists = updatedList.some((emp: any) => emp.id === id);

        expect(exists).toBeFalsy();
    });

   

    test('TC008_API_DELETE_Invalid_ID', async ({ request }) => {
        const response = await request.delete('api/employees/123-abc-no-valid-uuid', {
            headers: AUTH_HEADER
        });
        
        expect(response.status()).toBe(405);
    });


});




