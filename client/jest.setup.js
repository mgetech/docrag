// client/jest.setup.js

/**
 * This file is executed before Jest runs any tests.
 * Its purpose is to configure the test environment.
 * Here, we are using the 'dotenv' library to load environment variables
 * from the .env.local file, making them available to our tests.
 */

require('dotenv').config({ path: '.env.local' });
