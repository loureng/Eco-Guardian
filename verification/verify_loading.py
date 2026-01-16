
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Mock geolocation to be slow
    context = browser.new_context(
        permissions=['geolocation'],
        geolocation={'latitude': 52.52, 'longitude': 13.405}
    )
    page = context.new_page()

    # Route geolocation to delay callback, to keep loading state active for screenshot
    # NOTE: Navigator.geolocation is tricky to mock delay for in Playwright directly via context.
    # We will override the getCurrentPosition function in the page to add a delay.

    page.add_init_script("""
        const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
        navigator.geolocation.getCurrentPosition = (success, error, options) => {
            setTimeout(() => {
                originalGetCurrentPosition(success, error, options);
            }, 3000); // 3 seconds delay
        };
    """)

    page.goto("http://localhost:4173")

    # Wait for the button to be visible
    page.wait_for_selector("text=Entrar com Google e Localização")

    # Click the button
    page.click("text=Entrar com Google e Localização")

    # Wait a bit for the loading state to appear (it should happen immediately on click)
    page.wait_for_timeout(500)

    # Take screenshot
    page.screenshot(path="verification/loading_state.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
