import { expect, type Page, test } from '@playwright/test';

async function enterDemoHome(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin' }).click();

  while (await page.getByRole('button', { name: 'Continue' }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await page.getByRole('button', { name: 'Enter CivicTree Demo' }).click();
  await expect(page.getByRole('link', { name: 'Find tasks near me' })).toHaveAttribute('href', '/worker/map');
}

test('runs the full deterministic CivicTree demo loop', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await enterDemoHome(page);
  await page.goto('/worker/map');
  await expect(page).toHaveURL(/\/worker\/map$/);

  const allPins = page.locator('button[aria-label^="Select "]');
  await expect(allPins).toHaveCount(5);
  await allPins.nth(1).click();
  await expect(page.getByRole('heading', { name: 'Water planters on Broadway' })).toBeVisible();

  const allTaskCount = Number((await page.getByText(/tasks available/).first().textContent())?.match(/\d+/)?.[0]);
  await page.getByRole('button', { name: /Beginner friendly/ }).first().click();
  const quickTaskCount = Number((await page.getByText(/tasks available/).first().textContent())?.match(/\d+/)?.[0]);
  expect(quickTaskCount).toBeLessThan(allTaskCount);

  await page.getByRole('button', { name: 'All tasks' }).first().click();
  await expect(page.getByText('7 tasks available')).toBeVisible();

  await page.locator('button[aria-label="Select Clean litter on Oak St"]').click();
  await page.locator('a[href="/worker/task/task-litter-oak"]').click();
  await expect(page).toHaveURL(/\/worker\/task\/task-litter-oak$/);
  await expect(page.getByRole('heading', { name: 'Clean litter on Oak St' })).toBeVisible();
  await page.locator('a[href="/worker/task/task-litter-oak/claim"]').click();
  await expect(page).toHaveURL(/\/worker\/task\/task-litter-oak\/claim$/);

  await page.getByLabel('I have heavy-duty gloves ready').check();
  await page.getByLabel('I have cleanup trash bags ready').check();
  await page.getByLabel('I am wearing closed-toe shoes').check();
  await page.getByLabel('My phone battery is above 30%').check();
  await page.getByLabel('I know what not to touch (needles, waste)').check();
  await page.getByRole('button', { name: "I'm ready" }).click();
  await expect(page).toHaveURL(/\/worker\/task\/task-litter-oak\/active$/);

  await page.getByRole('button', { name: 'Verify Check-in' }).click();
  await expect(page.getByText(/Location verified/)).toBeVisible();
  await page.getByRole('button', { name: 'Use sample photos for this demo' }).click();
  await page.getByLabel('Add notes (Optional)').fill('Playwright demo proof.');
  await page.getByRole('button', { name: 'Submit task' }).click();
  await expect(page).toHaveURL(/\/worker\/today\?submitted=success$/);
  await page.goto('/worker/earn');
  await expect(page.getByText('Checking photos').first()).toBeVisible();

  await page.getByRole('button', { name: 'Admin' }).click();
  await page.goto('/admin/submissions');
  await expect(page.getByText('Clean litter on Oak St')).toBeVisible();
  await page.locator('a[href="/admin/submissions/sub-4"]').click();
  await expect(page).toHaveURL(/\/admin\/submissions\/sub-4$/);
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page).toHaveURL(/\/admin\/submissions$/);
  await expect(page.getByText('Clean litter on Oak St')).toHaveCount(0);

  await page.getByRole('button', { name: 'Worker (Austin)' }).click();
  await page.goto('/worker/earn');
  await expect(page.getByText('$42.00').first()).toBeVisible();

  await page.goto('/sponsor');
  await expect(page.getByText('43%')).toBeVisible();
  await expect(page.getByText('43 completed')).toBeVisible();

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.goto('/worker/map');
  await expect(page.getByText('7 tasks available')).toBeVisible();
  await page.goto('/worker/earn');
  await expect(page.getByText('$24.00').first()).toBeVisible();
});
