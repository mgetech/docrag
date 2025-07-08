import { test, expect } from '@playwright/test';

test.describe('DocRAG End-to-End Test', () => {
  test('should allow a user to upload a document, ask a question, and see the answer', async ({ page }) => {
    // 1. Navigate to the main page
    await page.goto('/');

    // 2. Upload a document
    const fileToUpload = 'tests/fixtures/test-document.txt';
    await page.setInputFiles('input[type="file"]', fileToUpload);
    await page.click('button:has-text("Upload")');

    // 3. Assert that the document appears in the list
    // We use a longer timeout here to give the backend time to process.
    await expect(page.locator('text=test-document.txt')).toBeVisible({ timeout: 10000 });
    // Wait for the success message to appear, confirming the upload is complete.
    const successMessage = page.locator('text=/Successfully uploaded ".*"/');
    await expect(successMessage).toBeVisible();

    // It's also good practice to wait for the success message to disappear
    // if it's designed to be transient, ensuring the UI is settled.
    //await expect(successMessage).toBeHidden();

    // 4. Ask a question
    const question = 'How many people have Microsoft layed off recently?';
    const qnaContainer = page.locator('div').filter({ hasText: 'Ask a Question' }).first();
    await expect(qnaContainer).toBeVisible();
    const questionInput = qnaContainer.getByPlaceholder('Ask a question based on the uploaded documents...');
    await questionInput.waitFor({ state: 'attached' }); // Ensure the element is in the DOM
    await expect(questionInput).toBeEditable(); // Ensure the input is ready for interaction
    await questionInput.fill(question);
    await qnaContainer.getByRole('button', { name: 'Ask' }).click();

    // 5. Assert that the processing state appears and then disappears
    const processingMessage = page.locator('text=Processing your question, please wait...');
    await expect(processingMessage).toBeVisible();
    await expect(processingMessage).toBeHidden(); // Wait for the message to disappear

    // 6. Assert that the final answer section is displayed
    // This will use the global expect timeout (150 seconds)
    await expect(page.locator('h3:has-text("Answer")')).toBeVisible();
  });
});
