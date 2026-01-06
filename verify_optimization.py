
import json
from playwright.sync_api import sync_playwright

def verify_optimization():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Inject user data to bypass login and have plants
        user_data = {
            "id": "test-user",
            "name": "Test User",
            "dwellingType": "Casa",
            "location": {"latitude": 0, "longitude": 0, "city": "Test City"},
            "plants": [
                {
                    "id": "1",
                    "commonName": "Samambaia",
                    "scientificName": "Nephrolepis exaltata",
                    "imageUrl": "https://images.unsplash.com/photo-1596547609858-2c2605e58b8a?auto=format&fit=crop&q=80&w=400",
                    "wateringFrequencyDays": 3,
                    "lastWatered": 1708500000000,
                    "wateringHistory": [1708500000000],
                    "sunTolerance": "Meia-sombra",
                    "minTemp": 15,
                    "maxTemp": 30
                },
                {
                    "id": "2",
                    "commonName": "Cacto",
                    "scientificName": "Cactaceae",
                    "imageUrl": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=400",
                    "wateringFrequencyDays": 15,
                    "lastWatered": 1708500000000,
                    "wateringHistory": [1708500000000],
                    "sunTolerance": "Sol Pleno",
                    "minTemp": 10,
                    "maxTemp": 35
                }
            ],
            "unlockedAchievements": []
        }

        # We need to set localStorage before navigation, but localStorage is domain specific.
        # So we go to the page first, but we need to prevent redirection if possible or handle it.
        # Actually, EcoGuardian loads user from localStorage on mount.

        page = context.new_page()
        page.goto("http://localhost:4173")

        # Inject data
        page.evaluate(f"localStorage.setItem('ECO_GUARDIAN_USER', '{json.dumps(user_data)}');")

        # Reload to pick up user
        page.reload()

        # Wait for dashboard
        try:
            page.wait_for_selector("text=Minhas Plantas", timeout=10000)
            print("Dashboard loaded.")

            # Wait for plants to render
            page.wait_for_selector("text=Samambaia", timeout=5000)

            # Take screenshot
            page.screenshot(path="verification_optimization.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")

        browser.close()

if __name__ == "__main__":
    verify_optimization()
