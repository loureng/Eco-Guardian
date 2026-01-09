
import os
import json
import time
from playwright.sync_api import sync_playwright, expect

def verify_accessibility(page):
    # Inject user to bypass login
    # We will click the "Entrar com Google e Localização" button which calls handleLogin
    # handleLogin uses navigator.geolocation.
    # We can mock geolocation.

    context = page.context
    context.grant_permissions(['geolocation'])
    context.set_geolocation({'latitude': 48.858455, 'longitude': 2.294474})

    page.goto("http://localhost:3000")

    # Click Login
    page.get_by_role("button", name="Entrar com Google").click()

    # Now we should be on dashboard.
    # We need to add a plant.

    # Click "Adicionar Primeira Planta" or "Nova"
    # Wait for dashboard
    expect(page.get_by_text("Jardineiro")).to_be_visible()

    # Add a mock plant via localStorage manipulation if possible, or just use the UI?
    # Using UI is safer.

    # Click "Nova"
    page.get_by_role("button", name="Nova").click()

    # Click "Prefiro preencher tudo manualmente"
    page.get_by_text("Prefiro preencher tudo manualmente").click()

    # Fill form
    page.get_by_placeholder("ex: Espada de São Jorge").fill("Samambaia")
    page.get_by_placeholder("ex: Sansevieria trifasciata").fill("Polypodium")

    # Click "Salvar Planta"
    page.get_by_role("button", name="Salvar Planta").click()

    # Now we are back on dashboard and should see "Samambaia"
    expect(page.get_by_text("Samambaia")).to_be_visible()

    # 1. Verify Expand Button is accessible
    # It should have aria-expanded=false initially
    # We look for the button that controls the expansion
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
            page.screenshot(path=".Jules/verification/debug_fail_v3.png")
        finally:
            browser.close()
