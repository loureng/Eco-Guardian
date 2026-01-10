
import { test, expect } from '@playwright/test';

test('verify add plant accessibility', async ({ page }) => {
  // Inject user to skip login
  await page.addInitScript(() => {
    localStorage.setItem('ECO_GUARDIAN_USER', JSON.stringify({
      id: 'test-user',
      name: 'Test User',
      location: { latitude: 0, longitude: 0, city: 'Test City' },
      plants: [],
      unlockedAchievements: []
    }));
  });

  await page.goto('http://localhost:5173');

  // Wait for the app to load
  await page.waitForSelector('main', { state: 'visible' });

  // Navigate to Add Plant page - using more specific selector
  // The 'Adicionar Planta' button might be in the mobile menu or dashboard.
  // In dashboard view, there's a button "Nova" and a card "Adicionar Outra"

  // Try to find the dashboard "Nova" button
  await page.getByRole('button', { name: 'Nova', exact: false }).first().click();

  // Verify "Home" button is keyboard accessible (it was a span before)
  const homeButton = page.getByRole('button', { name: 'Home' });
  await expect(homeButton).toBeVisible();

  // Verify current page indicator
  const currentPage = page.locator('[aria-current="page"]');
  await expect(currentPage).toHaveText('Nova Planta');

  // Verify Search Input has proper labelling
  const searchInput = page.getByPlaceholder('Ex: Jiboia');
  await expect(searchInput).toHaveAttribute('aria-labelledby', 'search-plant-label');

  // Verify Search Button has aria-label
  const searchButton = page.getByRole('button', { name: 'Pesquisar planta' });
  await expect(searchButton).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/add_plant_accessibility.png' });
});
