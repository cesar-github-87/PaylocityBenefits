#  Paylocity Quality Engineering Challenge

This repository contains the automated testing solution for the Paylocity Benefits Portal (UI and API). The framework is built using **Playwright** with **TypeScript**, following the **Page Object Model (POM)** design pattern to ensure scalability and maintainability.

---

##  Prerequisites

Before getting started, ensure you have the following installed:
* **Node.js** (Version 18 or higher)
* **npm** (Included with Node.js)
* **Git**

---

## Environment Setup

Follow these steps to prepare the project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/cesar-github-87/Paylocity.git](https://github.com/cesar-github-87/Paylocity.git)
   cd Paylocity
    ```
2. **Install Dependencies:**
  ```bash
  npm install
  ```

3. **Install Playwright browsers:**
  ```bash
npx playwright install chromium
```

---
## Running Tests

1. **Run the Full Suite (UI + API) Headless:**
   ```bash
   npx playwright test --project=chromium
   ```
2. **Run the Full Suite (UI + API) Headed:**
  ```bash
  npx playwright test tests/UITest.spec.ts -project=chromium --headed
   ```

---

## Report
test-results/bug-report/paylocity_benefits_ui_api_bugs.pdf

