import time
from playwright.sync_api import sync_playwright

def verify_confirmation_modal():
    print("Starting verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a consistent context
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Subscribe to console events
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")

            # Wait for content
            try:
                page.wait_for_selector("text=EcoGuardian", timeout=5000)
                print("Welcome screen visible.")
            except:
                print("Welcome screen NOT visible.")
                page.screenshot(path="/home/jules/verification/debug_start.png")

            print(f"Page Title: {page.title()}")

            # Inject user
            print("Injecting user...")
            user_data = '{"id": "test-user", "name": "Test", "dwellingType": "Casa", "location": {"latitude": 0, "longitude": 0, "city": "Test City"}, "plants": [{"id": "p1", "commonName": "Test Plant", "scientificName": "Testus", "imageUrl": "", "wateringFrequencyDays": 7, "lastWatered": 1700000000000, "wateringHistory": [1700000000000], "sunTolerance": "Meia-sombra", "minTemp": 10, "maxTemp": 30, "category": "Geral"}], "unlockedAchievements": []}'

            page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{user_data}')")

            print("Reloading...")
            page.reload()

            # Check dashboard
            try:
                page.wait_for_selector("text=Minhas Plantas", timeout=10000)
                print("Dashboard loaded.")
            except:
                print("Dashboard failed to load.")
                page.screenshot(path="/home/jules/verification/debug_dashboard_fail.png")
                return

            # Trigger modal
            print("Clicking delete button...")
            # Use evaluate to click because of hover issues
            page.evaluate("document.querySelector('button[title=\"Excluir planta\"]').click()")

            # Wait for modal
            modal = page.locator("role=dialog")
            modal.wait_for()
            print("Modal appeared.")

            # Check accessibility attributes
            is_modal = modal.get_attribute("aria-modal") == "true"
            print(f"aria-modal='true': {is_modal}")

            has_labelledby = modal.get_attribute("aria-labelledby") is not None
            print(f"Has aria-labelledby: {has_labelledby}")

            # Check Focus
            time.sleep(1) # Give it a moment to focus

            # Check what is focused
            focused_text = page.evaluate("document.activeElement.innerText")
            print(f"Focused element text: '{focused_text}'")

            is_cancel_focused = "Cancelar" in focused_text
            print(f"Cancel button focused: {is_cancel_focused}")

            page.screenshot(path="/home/jules/verification/modal_success.png")

            # Close with Escape
            page.keyboard.press("Escape")
            modal.wait_for(state="detached")
            print("Modal closed with Escape.")

            frontend_verification_complete(screenshot_path="/home/jules/verification/modal_success.png")

        except Exception as e:
            print(f"SCRIPT ERROR: {e}")
            page.screenshot(path="/home/jules/verification/error_final.png")
        finally:
            browser.close()

# Mock function for local run
def frontend_verification_complete(screenshot_path):
    print(f"VERIFICATION COMPLETE: {screenshot_path}")

if __name__ == "__main__":
    verify_confirmation_modal()
