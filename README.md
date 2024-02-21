# DEEL BACKEND TASK

💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. Start by creating a local repository for this folder.

1. In the repo root directory, run `npm install` to gather all dependencies.

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

1. Then run `npm start` which should start both the server and the React client.

❗️ **Make sure you commit all changes to the master branch!**

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

## APIs To Implement

Below is a list of the required API's for the application.

1. **_GET_** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

## Submitting the Assignment

When you have finished the assignment, zip your repo (make sure to include .git folder) and send us the zip.

Thank you and good luck! 🙏

## DEV Notes

### Code Structure

I opted to change the structure a little bit, since I had the time, to implement a Domain Driven Design structure, with dependency injection/inversion of control, to be able to not only perform unit tests all over the application, but e2e tests as well, making sure of how every detail is expected to work.

Even though it can get a lot bigger, I believe the implementation this way makes it so that it is highly scalable and easy to maintain in case a project needs to grow.

With that being said, here's just a small introduction to the structure:

Inside `src` you'll find two main folders, `domain`, which will contain every domain we'll have inside our application, and `infra`, which consists of configuration files like express, sequelize, or any other lib/sdk that requires configuration.

Inside each `domain`, we'll have the files below where applicable:

- `.controller.js` Here is where we'll implement DB interaction
- `.model.js` Here is where we'll find the DB model implementation
- `.router.js` Here is where all the endpoint implementations are going to be
- `.middleware.js` Like the routers, in the middleware files is where we implement logic for any middlewares necessary for the routes
- `.enum.js` Constants that belong to that domain
- `.validator.js` Reusable methods to check input objects

Inside the `domain` folder, I also like to add a `@utils` or `@common` folder, for validations, enums, or anything else that will be reused in the application, and doesn't necessarily belongs to a domain.

---

### Test Structure

Following what was done in the main code folders, I opted to follow almost the same folder structure, so that it's easy to know where your test is and it's natural to know where to find it. Inside our test folder, we have two main folders, one for `unit` tests, and one for `e2e` tests, with it's own configuration through `Jest`.

Inside our domain folders inside the test folders, you'll find two types of tests, `.spec.js` which consists of unit tests with `Jest`, taking advantage of dependency injection/inversion of control, and `.e2e.js` which consists of our end-to-end tests with `Jest + supertest`.

Unit tests are super simple, it's just testing methods/logic, making sure it works as expected. On the other hand, end-to-end tests are more complex due to some changes I had to implement. here are a couple things that made this testing possible:

- Changing the server/main application into two files, so that I can serve the app to supertest
- Changing the sequelize manager inside `src/infra/sequelize.js` to use memory storage when `NODE_ENV=test`, which jest will do that my default
- Changing the SEED script, so that I can use inside my e2e tests, inside the beforeAll/beforeEach, restarting the information for each test suite/case, depending on the necessity.

#### Running the tests

- `yarn test:unit`/`npm run test:unit` runs unit tests
- `yarn test:e2e`/`npm run test:e2e` runs e2e tests
- `yarn test`/`npm run test` runs all tests

Obs: after tests finish running, a `coverage` folder will be created under the test folder, for more visual information.


### Notes for the reviewer

In case you want to use Postman to test, I added my collection to the root folder, so just importing it will have all the endpoints and information needed.
