
import json
from playwright.sync_api import sync_playwright, expect

def verify_accessibility_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Inject user data to bypass Welcome screen
        user_data = {
            "id": "123",
            "name": "Jardineiro Teste",
            "dwellingType": "Casa",
            "location": {"latitude": -23.5505, "longitude": -46.6333, "city": "São Paulo"},
            "plants": [],
            "unlockedAchievements": []
        }

        # We need to set local storage before loading the page logic
        # But we can only set local storage on a domain we are on.
        # So we go to the page, set storage, then reload.
        page = context.new_page()
        page.goto("http://localhost:3000")

        page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(user_data)}');")
        page.reload()

        # Wait for dashboard
        expect(page.get_by_text("Minhas Plantas")).to_be_visible()

        # 2. Verify Menu Button ARIA
        print("Verifying Menu Button ARIA...")
        menu_btn = page.get_by_label("Menu")
        expanded = menu_btn.get_attribute("aria-expanded")

        if expanded == "false":
            print("✅ Menu button has aria-expanded='false' initially.")
        else:
            print(f"❌ Menu button aria-expanded incorrect: {expanded}")

        menu_btn.click()
        # Wait for menu to open
        expect(page.get_by_text("Sair")).to_be_visible()

        expanded_after = menu_btn.get_attribute("aria-expanded")
        if expanded_after == "true":
            print("✅ Menu button has aria-expanded='true' when open.")
        else:
            print(f"❌ Menu button aria-expanded incorrect after click: {expanded_after}")

        # Close menu
        menu_btn.click()

        # 3. Verify 'Add Plant' Camera Button Focus (The main goal)
        print("Verifying Add Plant Camera focus...")

        # Navigate to Add Plant
        page.get_by_role("button", name="Nova", exact=True).click()

        # Wait for Add Plant screen
        expect(page.get_by_text("Cadastrar Planta")).to_be_visible()

        # Find the hidden input
        file_input = page.locator("input[type='file'][aria-label='Tirar foto ou selecionar da galeria para identificar planta']")

        if file_input.count() > 0:
            print("✅ File input has correct aria-label.")
        else:
            print("❌ File input missing aria-label.")

        # Focus the input
        file_input.focus()

        # Take screenshot of focus state
        page.screenshot(path="/home/jules/verification/2_camera_focus.png")

        # Check parent styling
        # The parent div should have focus-within style applied visually.
        # We can verify the parent class has 'focus-within:ring-2'
        parent = file_input.locator("..")
        parent_classes = parent.get_attribute("class")

        if "focus-within:ring-2" in parent_classes:
            print("✅ Parent container has focus-within classes.")
        else:
             print(f"❌ Parent container MISSING focus-within classes. Classes: {parent_classes}")

        browser.close()

if __name__ == "__main__":
    verify_accessibility_fixes()
