
import json
from playwright.sync_api import Page, expect, sync_playwright

def verify_a11y(page: Page):
    # Inject user to bypass welcome screen
    user_data = {
        "id": "123",
        "name": "Test User",
        "dwellingType": "Casa",
        "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
        "plants": [],
        "unlockedAchievements": []
    }

    # We need to set localStorage before loading the page logic that checks it
    # So we go to the page, set it, then reload
    page.goto("http://localhost:3000")

    page.evaluate(f"window.localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(user_data)}');")
    page.reload()

    # Wait for dashboard load
    expect(page.get_by_text("EcoGuardian")).to_be_visible()

    # Verify Weather Refresh Button Accessibility
    refresh_btn = page.get_by_title("Atualizar Clima")
    expect(refresh_btn).to_be_visible()

    # Check default label - NOTE: It might be 'Atualizando clima...' initially because app calls refreshWeather on mount!
    label = refresh_btn.get_attribute("aria-label")
    print(f"Refresh Button Label: {label}")

    # It seems it is loading on mount, which is good! It proves the conditional label works.
    if label == "Atualizando clima...":
         print("Verified: Label indicates loading state correctly on mount.")
         # Check if disabled
         if refresh_btn.is_disabled():
              print("Verified: Button is disabled during loading.")
         else:
              raise Exception("Button should be disabled during loading")
    elif label == "Atualizar clima":
         print("Verified: Label indicates idle state.")
    else:
         raise Exception(f"Unexpected label: {label}")

    # Verify Menu Button Accessibility
    # The menu button usually has aria-label "Abrir menu" initially
    menu_btn = page.get_by_label("Abrir menu")
    expect(menu_btn).to_be_visible()

    expanded = menu_btn.get_attribute("aria-expanded")
    print(f"Menu Expanded: {expanded}")

    # React often omits false attribute or sets it to "false" string. Playwright get_attribute returns string.
    # We accept "false" or None (if omitted, though we explicitly set it).

    # Click menu to open
    menu_btn.click()

    # Verify label changes to "Fechar menu"
    close_menu_btn = page.get_by_label("Fechar menu")
    expect(close_menu_btn).to_be_visible()

    expanded_after = close_menu_btn.get_attribute("aria-expanded")
    print(f"Menu Expanded After Click: {expanded_after}")
    if expanded_after != "true":
         raise Exception(f"Expected 'true', got '{expanded_after}'")

    # Take screenshot
    page.screenshot(path="/home/jules/verification/a11y_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_a11y(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
