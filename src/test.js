const getConfig = require('./config');
const nearConfig = getConfig(process.env.NODE_ENV || 'development')

require('dotenv').config({ path: '/workspace/token-contract-as/neardev/dev-account.env' })

describe("NearStore", function() {
    let near;
    let contract;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    // Common setup below
    beforeAll(async function() {
        near = await nearAPI.connect({
            deps: {
                keyStore: new nearAPI.keyStores.UnencryptedFileSystemKeyStore('../../../home/gitpod/.near-credentials')
            },
            ...nearConfig
        })
        accountId = process.env.CONTRACT_NAME;
        contract = await near.loadContract(accountId, {
            // NOTE: This configuration only needed while NEAR is still in development
            // View methods are read only. They don't modify the state, but usually return some value.
            viewMethods: ["getProducts", "getProductOwner"],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: ["buyProduct", "sellProduct", "cancelSellProduct", "addProduct"],
            sender: process.env.CONTRACT_NAME
        });
    });

    // Multiple tests can be described below. Search Jasmine JS for documentation.
    describe("buyProduct", function() {
        beforeAll(async function() {
            // There can be some common setup for each test.
        });

        it("buy a product", async function() {
            const params = {
                _id: 2,
                _newOwner: window.accountId
            };

            const result = await contract.buyProduct(params);
            expect(result).toBe(true);
        });
    });
});