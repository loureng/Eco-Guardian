
import time
from playwright.sync_api import sync_playwright

def verify_confirmation_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant clipboard-read permissions for the browser context
        context = browser.new_context(permissions=['clipboard-read'])
        page = context.new_page()

        try:
            # 1. Load the app
            page.goto("http://localhost:3000")

            # 2. Inject user to bypass welcome screen
            user_data = """
            {
                "id": "test-user",
                "name": "Test Gardener",
                "dwellingType": "Casa",
                "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
                "plants": [
                    {
                        "id": "p1",
                        "commonName": "Test Plant",
                        "scientificName": "Testus Plantus",
                        "imageUrl": "",
                        "wateringFrequencyDays": 7,
                        "lastWatered": 1700000000000,
                        "wateringHistory": [1700000000000],
                        "sunTolerance": "Meia-sombra",
                        "minTemp": 10,
                        "maxTemp": 30,
                        "category": "Geral"
                    }
                ],
                "unlockedAchievements": []
            }
            """
            page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{user_data.replace(chr(10), '').strip()}')")
            page.reload()

            # Wait for dashboard
            page.wait_for_selector("text=Minhas Plantas")

            # 3. Trigger the modal (Delete button on the plant card)
            # The delete button is hidden unless hovered or focused, but we can force click it if we find it.
            # In PlantCard.tsx, the delete button has title="Excluir planta"

            # We might need to hover over the card first to make it interactable if it relies on CSS hover,
            # but usually click works if element is in DOM.
            # Let's try to click the delete button.

            delete_btn = page.locator("button[title='Excluir planta']").first
            # Force click because it might be technically hidden/covered by hover overlay logic
            delete_btn.click(force=True)

            # 4. Wait for modal
            modal = page.locator("role=dialog")
            modal.wait_for()

            # 5. Check Focus
            # We expect the "Cancelar" button to be focused
            cancel_btn = page.locator("button", has_text="Cancelar")

            # Small delay to allow focus effect
            time.sleep(0.5)

            is_focused = cancel_btn.evaluate("el => document.activeElement === el")
            print(f"Cancel button focused: {is_focused}")

            # 6. Take Screenshot
            page.screenshot(path="/home/jules/verification/modal_verification.png")

            # 7. Test Escape key
            page.keyboard.press("Escape")

            # Wait for modal to disappear
            modal.wait_for(state="detached")
            print("Modal closed on Escape key")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_confirmation_modal()
