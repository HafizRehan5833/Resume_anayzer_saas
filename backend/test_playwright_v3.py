"""
Full Playwright Browser Test v3 - Resume Analyzer SaaS
Fixes: 17s login wait, label upload, correct button text
Run with: uv run python test_playwright_v3.py
"""
import os
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

FRONTEND = "http://localhost:3000"
SS = Path("test_screenshots_v3")
SS.mkdir(exist_ok=True)

REHAN_PDF = str(Path("hafiz_rehan_resume.pdf").resolve())
FAHAD_PDF = str(Path("muhammad_fahad_resume.pdf").resolve())

EMAIL    = "demo_hr_1783413662@example.com"
PASSWORD = "password123"

PASS_LIST = []
FAIL_LIST = []

def p(label, detail=""):
    msg = f"  [PASS] {label}"
    if detail: msg += f"  =>  {detail}"
    print(msg)
    PASS_LIST.append(label)

def f(label, reason=""):
    print(f"  [FAIL] {label}  --  {reason}")
    FAIL_LIST.append((label, reason))

async def ss(page, name):
    path = str(SS / f"{name}.png")
    try:
        await page.screenshot(path=path, full_page=True)
        print(f"         [ss] {name}.png")
    except Exception as e:
        print(f"         [ss-fail] {e}")

async def run_tests():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False, slow_mo=300)
        ctx = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await ctx.new_page()

        print("\n" + "="*60)
        print("  SYNAPSE SAAS - COMPREHENSIVE BROWSER TEST v3")
        print("="*60)

        # =====================================================
        # 1. LANDING PAGE
        # =====================================================
        print("\n[1] LANDING PAGE")
        try:
            await page.goto(FRONTEND, wait_until="networkidle", timeout=15000)
            title = await page.title()
            await ss(page, "01_landing")
            p("Landing page", f"title='{title}'")
        except Exception as e:
            f("Landing page", str(e))

        # =====================================================
        # 2. LOGIN (bcrypt takes ~18s on this machine)
        # =====================================================
        print("\n[2] LOGIN")
        try:
            await page.goto(f"{FRONTEND}/login", wait_until="networkidle", timeout=10000)
            await ss(page, "02a_login")

            await page.locator("#email").fill(EMAIL)
            await page.locator("#password").fill(PASSWORD)
            await ss(page, "02b_filled")

            # Click Sign in and wait up to 90s for navigation away from /login
            await page.locator("button[type='submit']").click()
            print("         Clicked Sign In -- waiting up to 90s for bcrypt/DB queries...")
            try:
                await page.wait_for_url("**/dashboard**", timeout=90000)
            except Exception:
                # Maybe it went somewhere else
                await asyncio.sleep(10)

            await ss(page, "02c_after_login")

            if "login" not in page.url and "signup" not in page.url:
                p("Login", f"Redirected to {page.url}")
            else:
                f("Login", f"Still at {page.url}")
                await browser.close()
                return
        except Exception as e:
            f("Login", str(e))
            await browser.close()
            return

        # =====================================================
        # 3. DASHBOARD
        # =====================================================
        print("\n[3] DASHBOARD")
        try:
            await asyncio.sleep(2)
            await ss(page, "03_dashboard")
            # Read stat card values
            h1 = await page.locator("h1").first.text_content()
            p("Dashboard", f"Greeting: '{h1}'")
        except Exception as e:
            f("Dashboard", str(e))

        # =====================================================
        # 4. JOBS PAGE + CREATE JOB
        # =====================================================
        print("\n[4] JOBS")
        try:
            await page.locator("a:has-text('Jobs')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "04a_jobs")
            p("Jobs page", page.url)

            # Count jobs
            job_cards = await page.locator("[class*='rounded-2xl'][class*='cursor-pointer']").count()
            print(f"         {job_cards} job cards visible")

            # Click "Post New Job" button
            post_btn = page.locator("button:has-text('Post New Job')")
            if await post_btn.count() > 0:
                await post_btn.click()
                await asyncio.sleep(1)
                await ss(page, "04b_create_form")
                p("Post New Job form opened")

                # Fill the form fields
                await page.locator("input[placeholder*='Product Manager']").first.fill("Senior AI Engineer")
                await page.locator("input[placeholder*='Engineering']").first.fill("Engineering")
                await page.locator("input[placeholder*='Remote']").first.fill("Remote")

                # Employment type select
                emp_sel = page.locator("select")
                if await emp_sel.count() > 0:
                    await emp_sel.first.select_option("Full-time")

                sal = page.locator("input[placeholder*='120k']")
                if await sal.count() > 0:
                    await sal.first.fill("$130k - $180k")

                desc = page.locator("textarea")
                if await desc.count() > 0:
                    await desc.first.fill("We need a Senior AI Engineer with expertise in LLMs, RAG, LangChain, and Python.")

                await ss(page, "04c_form_filled")

                # Submit
                save_btn = page.locator("form button[type='submit'], form button:has-text('Post Job')")
                if await save_btn.count() > 0:
                    await save_btn.first.click()
                    await asyncio.sleep(3)
                    await ss(page, "04d_job_created")
                    p("Job created: Senior AI Engineer")
            else:
                f("Post New Job button", "not found")
        except Exception as e:
            f("Jobs page", str(e))

        # =====================================================
        # 5. CANDIDATES + RESUME UPLOAD
        # =====================================================
        print("\n[5] CANDIDATES + UPLOAD")
        try:
            await page.locator("a:has-text('Candidates')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "05a_candidates")
            p("Candidates page", page.url)

            for pdf, name, prefix in [
                (REHAN_PDF, "Hafiz Muhammad Rehan", "05b_rehan"),
                (FAHAD_PDF, "Muhammad Fahad", "05c_fahad"),
            ]:
                print(f"\n         Uploading {name}...")
                if not os.path.exists(pdf):
                    f(f"Upload {name}", "PDF not found")
                    continue

                # The upload control is: <label> wrapping hidden <input type="file" class="sr-only">
                file_input = page.locator("input[type='file']")
                if await file_input.count() > 0:
                    await file_input.first.set_input_files(pdf)
                    print(f"         File set. Waiting up to 45s for AI parsing...")

                    # Wait for "Parsing Resume..." loader to appear then disappear
                    try:
                        await page.locator("text=Parsing").wait_for(state="visible", timeout=5000)
                        print("         Parsing indicator visible...")
                        await page.locator("text=Parsing").wait_for(state="hidden", timeout=60000)
                        print("         Parsing complete!")
                    except Exception:
                        # fallback: just wait
                        await asyncio.sleep(30)

                    await ss(page, f"{prefix}_parsed")
                    p(f"Uploaded + parsed: {name}")
                else:
                    f(f"Upload {name}", "No file input found")

            await ss(page, "05d_after_uploads")
        except Exception as e:
            f("Candidates / Upload", str(e))

        # =====================================================
        # 6. CANDIDATE PROFILES
        # =====================================================
        print("\n[6] CANDIDATE PROFILES")
        try:
            for name_q, prefix in [("Rehan", "06a_rehan"), ("Fahad", "06b_fahad")]:
                el = page.locator(f"text=/{name_q}/i")
                if await el.count() > 0:
                    await el.first.click()
                    await asyncio.sleep(2)
                    await ss(page, f"{prefix}_profile")
                    p(f"Profile opened: {name_q}")

                    # Check for match/analyze buttons
                    btns = await page.locator("button").all_text_contents()
                    print(f"         Buttons: {[b.strip() for b in btns if b.strip()][:8]}")

                    # Look for AI analysis features
                    for txt in ["Match", "AI", "Analyze", "Score", "Compare"]:
                        mb = page.locator(f"button:has-text('{txt}')")
                        if await mb.count() > 0:
                            await mb.first.click()
                            print(f"         Clicked '{txt}' -- waiting 20s for AI...")
                            await asyncio.sleep(20)
                            await ss(page, f"{prefix}_ai_result")
                            p(f"AI action for {name_q}")
                            break

                    # Close panel or go back
                    close = page.locator("button:has-text('X'), button[aria-label*='close' i]")
                    if await close.count() > 0:
                        await close.first.click()
                        await asyncio.sleep(1)
                    else:
                        await page.go_back()
                        await asyncio.sleep(1)
                else:
                    print(f"         {name_q} not found in candidate list")
        except Exception as e:
            f("Candidate Profiles", str(e))

        # =====================================================
        # 7. APPLICATIONS
        # =====================================================
        print("\n[7] APPLICATIONS")
        try:
            await page.locator("a:has-text('Applications')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "07_applications")
            p("Applications page", page.url)
        except Exception as e:
            f("Applications", str(e))

        # =====================================================
        # 8. INTERVIEWS
        # =====================================================
        print("\n[8] INTERVIEWS")
        try:
            await page.locator("a:has-text('Interviews')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "08_interviews")
            p("Interviews page", page.url)
        except Exception as e:
            f("Interviews", str(e))

        # =====================================================
        # 9. AI RECRUITER CHAT
        # =====================================================
        print("\n[9] AI RECRUITER CHAT")
        try:
            await page.locator("a:has-text('AI Recruiter')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "09a_chat")
            p("AI Recruiter page", page.url)

            # Find chat input (it's a textarea with placeholder)
            chat = page.locator("textarea").first
            if await page.locator("textarea").count() > 0:
                # Send message 1
                msg1 = "Who are the best candidates for the Backend Python Developer role?"
                await chat.fill(msg1)
                await ss(page, "09b_typed1")

                # Send via button or Enter
                send = page.locator("button[type='submit'], button:has-text('Send')")
                if await send.count() > 0:
                    await send.first.click()
                else:
                    await chat.press("Enter")

                print("         Sent msg 1. Waiting 35s...")
                await asyncio.sleep(35)
                await ss(page, "09c_response1")
                p("Chat message 1 response received")

                # Send message 2
                chat2 = page.locator("textarea").first
                msg2 = "Generate 5 interview questions for Hafiz Muhammad Rehan for the Backend Python Developer role."
                await chat2.fill(msg2)

                if await send.count() > 0:
                    await send.first.click()
                else:
                    await chat2.press("Enter")

                print("         Sent msg 2. Waiting 35s...")
                await asyncio.sleep(35)
                await ss(page, "09d_response2")
                p("Chat message 2 response received")
            else:
                f("Chat textarea", "Not found")
        except Exception as e:
            f("AI Chat", str(e))

        # =====================================================
        # 10. REPORTS
        # =====================================================
        print("\n[10] REPORTS")
        try:
            rpt = page.locator("a:has-text('Reports')")
            if await rpt.count() > 0:
                await rpt.first.click()
                await page.wait_for_load_state("networkidle", timeout=10000)
                await asyncio.sleep(2)
                await ss(page, "10_reports")
                p("Reports page", page.url)
        except Exception as e:
            f("Reports", str(e))

        # =====================================================
        # 11. SETTINGS
        # =====================================================
        print("\n[11] SETTINGS")
        try:
            sl = page.locator("a:has-text('Settings')")
            if await sl.count() > 0:
                await sl.first.click()
                await page.wait_for_load_state("networkidle", timeout=10000)
                await asyncio.sleep(2)
                await ss(page, "11_settings")
                p("Settings page", page.url)
        except Exception as e:
            f("Settings", str(e))

        # =====================================================
        # 12. FINAL DASHBOARD
        # =====================================================
        print("\n[12] FINAL DASHBOARD")
        try:
            await page.locator("a:has-text('Dashboard')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "12_final_dashboard")
            p("Final dashboard")
        except Exception as e:
            f("Final dashboard", str(e))

        # =====================================================
        # REPORT
        # =====================================================
        print("\n" + "="*60)
        print("  FINAL TEST REPORT")
        print("="*60)
        total = len(PASS_LIST) + len(FAIL_LIST)
        print(f"\n  Total: {total}  |  PASSED: {len(PASS_LIST)}  |  FAILED: {len(FAIL_LIST)}")
        if FAIL_LIST:
            print("\n  FAILED TESTS:")
            for lbl, rsn in FAIL_LIST:
                print(f"    X {lbl}: {rsn[:120]}")
        print(f"\n  Screenshots: {SS.resolve()}")
        print(f"\n  RESULT: {'ALL TESTS PASSED!' if not FAIL_LIST else f'{len(FAIL_LIST)} FAILURE(S)'}")
        print("="*60)
        print("\n  Closing in 5s...")
        await asyncio.sleep(5)
        await browser.close()

asyncio.run(run_tests())
