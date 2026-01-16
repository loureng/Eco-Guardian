
import os
import json
from playwright.sync_api import sync_playwright, expect

def verify_app_rendering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        # Inject user data to bypass login and show dashboard with plants
        user_data = {
            "id": "123",
            "name": "Test User",
            "dwellingType": "Casa",
            "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
            "plants": [
                {
                    "id": "1",
                    "commonName": "Samambaia",
                    "scientificName": "Polypodium",
                    "wateringFrequencyDays": 2,
                    "lastWatered": 1000,
                    "minTemp": 15,
                    "maxTemp": 30,
                    "sunTolerance": "Sombra",
                    "imageUrl": "https://picsum.photos/200"
                }
            ],
            "unlockedAchievements": []
        }

        # Set localStorage before navigation with CORRECT key
        page.add_init_script(f"""
            localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(user_data)}');
        """)

        try:
            page.goto("http://localhost:3000")

            # Wait for dashboard to load
            expect(page.get_by_text("Minhas Plantas")).to_be_visible(timeout=10000)

            # Take screenshot of dashboard
            page.screenshot(path="verification/verification.png")
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_rendering()
