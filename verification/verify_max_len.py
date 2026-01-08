
import json
import time
from playwright.sync_api import sync_playwright

def verify_max_length():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Inject user to bypass welcome
        user_data = {
            "id": "test-user",
            "name": "Sentinel Tester",
            "dwellingType": "Casa",
            "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
            "plants": [],
            "unlockedAchievements": []
        }

        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception:
            print("Server not ready, retrying...")
            time.sleep(2)
            page.goto("http://localhost:5173")

        page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(user_data)}');")
        page.reload()

        # Wait for dashboard to load
        page.wait_for_timeout(3000)

        # Force navigation to add-plant view via internal state hack if buttons fail,
        # but let's try to just find any text on the page to see where we are.
        # It seems we might be stuck on welcome screen if localStorage didn't work.

        if page.get_by_text("Entrar com Google").is_visible():
            print("Still on Welcome Screen. LocalStorage injection failed or was cleared.")
            # Let's try to click login mock
            page.get_by_role("button", name="Entrar com Google").click()
            # This requires geolocation... might fail in headless.

        # Try finding "Nova" again
        try:
             # Wait for a bit
             page.wait_for_timeout(1000)
             page.get_by_text("Nova").click(timeout=5000)
        except:
             try:
                page.get_by_text("Adicionar Primeira Planta").click(timeout=5000)
             except:
                print("Could not find button. Current URL:", page.url)

        # Click "Prefiro preencher tudo manualmente"
        try:
            page.get_by_text("Prefiro preencher tudo manualmente").click(timeout=5000)
        except:
            print("Could not find manual entry link. Dumping screenshot for debug.")
            page.screenshot(path="verification/debug_fail.png")
            browser.close()
            return

        # Verify Max Length attributes exist
        common_name_input = page.get_by_placeholder("ex: Espada de São Jorge")
        max_len_common = common_name_input.get_attribute("maxlength")
        print(f"Common Name Max Length: {max_len_common}")

        scientific_name_input = page.get_by_placeholder("ex: Sansevieria trifasciata")
        max_len_scientific = scientific_name_input.get_attribute("maxlength")
        print(f"Scientific Name Max Length: {max_len_scientific}")

        env_tips_input = page.get_by_placeholder("Ex: Local arejado, evitar chuva direta...")
        max_len_env = env_tips_input.get_attribute("maxlength")
        print(f"Env Tips Max Length: {max_len_env}")

        # Try to type a very long string
        long_string = "a" * 200
        common_name_input.fill(long_string)

        # Assert that the value in the input matches the maxlength (50)
        current_val = common_name_input.input_value()
        print(f"Input value length: {len(current_val)}")

        if len(current_val) == 50:
            print("SUCCESS: Input truncated to 50 chars.")
        else:
            print(f"FAILURE: Input length is {len(current_val)}")

        # Take screenshot of form
        page.screenshot(path="verification/input_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_max_length()
