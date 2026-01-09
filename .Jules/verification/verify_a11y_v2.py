
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_accessibility(page):
    # Inject user to bypass login
    mock_user = {
        "id": "test-user",
        "name": "Test User",
        "dwellingType": "Casa",
        "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
        "plants": [
            {
                "id": "plant-1",
                "commonName": "Samambaia",
                "scientificName": "Polypodium vulgare",
                "wateringFrequencyDays": 7,
                "lastWatered": 1700000000000,
                "imageUrl": "https://picsum.photos/200",
                "sunTolerance": "Sombra",
                "minTemp": 10,
                "maxTemp": 30,
                "wateringHistory": [1700000000000]
            }
        ],
        "unlockedAchievements": []
    }

    # Pre-populate localStorage before navigation
    # We must navigate to the domain first, or use a script that runs on every new document
    # Since we are on localhost, we can just goto first.
    # But App loads on mount.

    # Strategy:
    # 1. Navigate to page
    # 2. Inject localStorage
    # 3. Reload

    page.goto("http://localhost:3000")

    page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(mock_user)}');")
    page.reload()

    # Wait for content - increase timeout
    # Also check if we are stuck on "Entrar" screen
    try:
        expect(page.get_by_text("Samambaia")).to_be_visible(timeout=10000)
    except:
        print("Could not find Samambaia. Dumping page content...")
        page.screenshot(path=".Jules/verification/debug_fail.png")
        raise


    # 1. Verify Expand Button is accessible
    # It should have aria-expanded=false initially
    expand_btn = page.locator("button[aria-expanded='false']")
    expect(expand_btn).to_be_visible()

    # Take screenshot of collapsed state
    page.screenshot(path=".Jules/verification/collapsed.png")

    # 2. Click to expand
    expand_btn.click()

    # Verify it expanded
    expect(page.locator("button[aria-expanded='true']")).to_be_visible()

    # Wait for animation
    page.wait_for_timeout(500)

    expect(page.get_by_text("Temp Ideal")).to_be_visible()

    # Take screenshot of expanded state
    page.screenshot(path=".Jules/verification/expanded.png")

    # 3. Verify Delete Button has ARIA label
    delete_btn = page.locator("button[aria-label='Excluir Samambaia']")
    expect(delete_btn).to_be_visible()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_accessibility(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
