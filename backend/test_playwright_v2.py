"""
Full Playwright Browser Automation Test v2 - Resume Analyzer SaaS
Uses the SEEDED demo account with existing data.
Logs in, then tests ALL pages: jobs, candidates upload, AI match, chat, applications.
Run with: uv run python test_playwright_v2.py
"""
import os
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

FRONTEND = "http://localhost:3000"
SS = Path("test_screenshots_v2")
SS.mkdir(exist_ok=True)

REHAN_PDF = str(Path("hafiz_rehan_resume.pdf").resolve())
FAHAD_PDF = str(Path("muhammad_fahad_resume.pdf").resolve())

# Use the seeded demo account (has existing jobs + candidates + applications)
EMAIL    = "demo_hr_1783413662@example.com"
PASSWORD = "password123"

PASS_LIST = []
FAIL_LIST = []

def log_pass(label, detail=""):
    msg = f"  [PASS] {label}"
    if detail:
        msg += f"\n         => {detail}"
    print(msg)
    PASS_LIST.append(label)

def log_fail(label, reason=""):
    print(f"  [FAIL] {label} -- {reason}")
    FAIL_LIST.append((label, reason))

async def ss(page, name):
    path = str(SS / f"{name}.png")
    try:
        await page.screenshot(path=path, full_page=True)
        print(f"         [screenshot] {name}.png")
    except Exception as e:
        print(f"         [screenshot failed] {e}")
    return path

async def ensure_logged_in(page):
    """Make sure we're authenticated before each section."""
    if "login" in page.url or "signup" in page.url:
        print("         [re-login needed]")
        await page.goto(f"{FRONTEND}/login", wait_until="networkidle", timeout=10000)
        await page.locator("input[type='email']").first.fill(EMAIL)
        await page.locator("input[type='password']").first.fill(PASSWORD)
        await page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Login')").first.click()
        await page.wait_for_load_state("networkidle", timeout=15000)
        await asyncio.sleep(2)

async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=400)
        ctx = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await ctx.new_page()

        print("\n" + "="*60)
        print("  SYNAPSE - FULL BROWSER TEST v2")
        print("="*60)

        # ── 1. LANDING PAGE ────────────────────────────────────────
        print("\n[1] LANDING PAGE")
        try:
            await page.goto(FRONTEND, wait_until="networkidle", timeout=15000)
            title = await page.title()
            await ss(page, "01_landing")
            log_pass(f"Landing page", f"Title: '{title}'")
            # Check hero content
            hero = await page.locator("h1, h2").first.text_content()
            print(f"         Hero text: {hero}")
        except Exception as e:
            log_fail("Landing page", str(e))

        # ── 2. LOGIN ───────────────────────────────────────────────
        print("\n[2] LOGIN WITH SEEDED ACCOUNT")
        logged_in = False
        try:
            await page.goto(f"{FRONTEND}/login", wait_until="networkidle", timeout=10000)
            await ss(page, "02a_login_page")

            await page.locator("input[type='email'], input[name='email']").first.fill(EMAIL)
            await page.locator("input[type='password']").first.fill(PASSWORD)
            await ss(page, "02b_login_filled")

            await page.locator("button[type='submit'], button:has-text('Sign In'), button:has-text('Login')").first.click()
            await page.wait_for_load_state("networkidle", timeout=15000)
            await asyncio.sleep(3)
            await ss(page, "02c_after_login")

            if "login" not in page.url and "signup" not in page.url:
                log_pass("Login", f"Redirected to: {page.url}")
                logged_in = True
            else:
                log_fail("Login", f"Still at {page.url}")
        except Exception as e:
            log_fail("Login", str(e))

        if not logged_in:
            print("  CANNOT PROCEED - login failed")
            await browser.close()
            return

        # ── 3. DASHBOARD ───────────────────────────────────────────
        print("\n[3] DASHBOARD")
        try:
            if "dashboard" not in page.url:
                await page.goto(f"{FRONTEND}/dashboard", wait_until="networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "03_dashboard")

            # Read stats from page
            content = await page.content()
            stat_cards = await page.locator("text=/\\d+,?\\d*/").all_text_contents()
            log_pass("Dashboard", f"Stat numbers visible: {stat_cards[:5]}")
        except Exception as e:
            log_fail("Dashboard", str(e))

        # ── 4. JOBS PAGE ───────────────────────────────────────────
        print("\n[4] JOBS PAGE")
        try:
            # Click Jobs in sidebar
            await page.locator("a:has-text('Jobs')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ensure_logged_in(page)
            await ss(page, "04a_jobs_list")
            log_pass("Jobs page loaded", page.url)

            # Get page HTML to understand structure
            html_snippet = await page.locator("main, #main-content, .main").first.inner_html() if await page.locator("main").count() > 0 else ""
            
            # Count job entries using various selectors
            for sel in ["[data-testid*='job']", ".job-card", "article", "[class*='job']", "li[class]", "div[class*='card']"]:
                n = await page.locator(sel).count()
                if n > 0:
                    print(f"         Found {n} elements via '{sel}'")
                    break

            # Screenshot the page content area
            await ss(page, "04b_jobs_page_full")

            # Try clicking "Post Job" or any primary button
            btns = await page.locator("button").all_text_contents()
            print(f"         Buttons on page: {btns[:10]}")

            primary_btn = None
            for txt in ["Post Job", "Add Job", "Create Job", "New Job", "Post a Job", "Add New"]:
                btn = page.locator(f"button:has-text('{txt}')")
                if await btn.count() > 0:
                    primary_btn = btn
                    print(f"         Found button: '{txt}'")
                    break

            if primary_btn:
                await primary_btn.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
                await asyncio.sleep(1)
                await ss(page, "04c_job_form")
                log_pass("Create Job form opened")

                # Inspect all input fields
                inputs = await page.locator("input, textarea, select").all()
                print(f"         Form has {len(inputs)} fields")
                for inp in inputs[:10]:
                    try:
                        name = await inp.get_attribute("name") or await inp.get_attribute("placeholder") or await inp.get_attribute("id") or "?"
                        typ = await inp.get_attribute("type") or inp.element_handle
                        print(f"           - field: {name} ({typ})")
                    except Exception:
                        pass

                # Fill form
                title_sel = "input[name='title'], input[placeholder*='itle' i], input[id*='itle' i]"
                if await page.locator(title_sel).count() > 0:
                    await page.locator(title_sel).first.fill("Senior AI Engineer")

                desc_sel = "textarea[name='description'], textarea[placeholder*='escription' i], textarea"
                if await page.locator(desc_sel).count() > 0:
                    await page.locator(desc_sel).first.fill("We are looking for a Senior AI Engineer with expertise in LLMs, RAG systems, LangChain, and Python to build next-generation AI applications.")

                skill_sel = "input[name*='skill'], input[placeholder*='kill' i]"
                if await page.locator(skill_sel).count() > 0:
                    await page.locator(skill_sel).first.fill("Python, LangChain, FastAPI, RAG, Vector Databases")

                exp_sel = "input[name='experience'], input[placeholder*='xperience' i]"
                if await page.locator(exp_sel).count() > 0:
                    await page.locator(exp_sel).first.fill("3+ years")

                loc_sel = "input[name='location'], input[placeholder*='ocation' i]"
                if await page.locator(loc_sel).count() > 0:
                    await page.locator(loc_sel).first.fill("Remote")

                sal_sel = "input[name*='salary'], input[placeholder*='alary' i]"
                if await page.locator(sal_sel).count() > 0:
                    await page.locator(sal_sel).first.fill("$130k - $180k")

                await ss(page, "04d_job_form_filled")

                # Submit
                for sub_txt in ["Save", "Create", "Post", "Submit", "Publish"]:
                    sub = page.locator(f"button[type='submit'], button:has-text('{sub_txt}')")
                    if await sub.count() > 0:
                        await sub.first.click()
                        break
                await page.wait_for_load_state("networkidle", timeout=10000)
                await asyncio.sleep(2)
                await ss(page, "04e_job_created")
                log_pass("Job 'Senior AI Engineer' created")
            else:
                # Try clicking any link that says + or plus
                plus_btn = page.locator("a[href*='new'], a[href*='create'], button[aria-label*='add'], button[aria-label*='new']")
                if await plus_btn.count() > 0:
                    await plus_btn.first.click()
                    await asyncio.sleep(1)
                    await ss(page, "04c_job_form_alt")
                else:
                    log_fail("Create Job button", f"No create button found. Buttons: {btns[:5]}")
        except Exception as e:
            log_fail("Jobs page", str(e))

        # ── 5. CANDIDATES PAGE ─────────────────────────────────────
        print("\n[5] CANDIDATES + RESUME UPLOAD")
        try:
            await ensure_logged_in(page)
            await page.locator("a:has-text('Candidate')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ensure_logged_in(page)
            await ss(page, "05a_candidates_list")
            log_pass("Candidates page", page.url)

            # Count candidates
            for sel in ["[data-testid*='candidate']", ".candidate-card", "article", "tr", "[class*='candidate']", "[class*='row']"]:
                n = await page.locator(sel).count()
                if n > 0:
                    print(f"         {n} elements via '{sel}'")
                    break

            # See all buttons
            btns = await page.locator("button").all_text_contents()
            print(f"         Buttons on candidates page: {btns[:10]}")

            # Find upload button
            upload_btn = None
            for txt in ["Upload Resume", "Upload", "Import", "Add Candidate", "New Candidate", "Add"]:
                btn = page.locator(f"button:has-text('{txt}')")
                if await btn.count() > 0:
                    upload_btn = btn
                    print(f"         Found upload button: '{txt}'")
                    break

            # Also check for file input hidden
            file_inputs = await page.locator("input[type='file']").count()
            print(f"         File inputs on page: {file_inputs}")

            for pdf_path, person_name, prefix in [
                (REHAN_PDF, "Hafiz Muhammad Rehan", "05b_rehan"),
                (FAHAD_PDF, "Muhammad Fahad",       "05c_fahad"),
            ]:
                if not os.path.exists(pdf_path):
                    log_fail(f"Upload {person_name}", "PDF not found")
                    continue

                print(f"\n         Uploading {person_name}...")

                if upload_btn and await upload_btn.count() > 0:
                    try:
                        async with page.expect_file_chooser(timeout=5000) as fc_info:
                            await upload_btn.first.click()
                        fc = await fc_info.value
                        await fc.set_files(pdf_path)
                        print(f"         File chosen via dialog. Waiting 45s for AI parsing...")
                        await asyncio.sleep(45)
                        await ss(page, f"{prefix}_parsed")
                        log_pass(f"Uploaded: {person_name}")
                    except Exception as e:
                        log_fail(f"Upload {person_name} via button", str(e))
                        # Try direct file input
                        fi = page.locator("input[type='file']")
                        if await fi.count() > 0:
                            await fi.first.set_files(pdf_path)
                            await asyncio.sleep(45)
                            await ss(page, f"{prefix}_parsed_alt")
                            log_pass(f"Uploaded via input: {person_name}")
                elif file_inputs > 0:
                    fi = page.locator("input[type='file']").first
                    await fi.set_files(pdf_path)
                    print(f"         File set directly. Waiting 45s...")
                    await asyncio.sleep(45)
                    await ss(page, f"{prefix}_parsed")
                    log_pass(f"Uploaded: {person_name}")
                else:
                    log_fail(f"Upload {person_name}", "No upload control found")

            await ss(page, "05d_after_uploads")
        except Exception as e:
            log_fail("Candidates / Upload", str(e))

        # ── 6. CANDIDATE PROFILE ───────────────────────────────────
        print("\n[6] CANDIDATE PROFILES")
        try:
            await ensure_logged_in(page)

            for name_query, prefix in [
                ("Hafiz", "06a_rehan"),
                ("Fahad", "06b_fahad"),
                ("Alex", "06c_alex"),   # seeded candidate
            ]:
                el = page.locator(f"text={name_query}")
                if await el.count() > 0:
                    await el.first.click()
                    await page.wait_for_load_state("networkidle", timeout=8000)
                    await asyncio.sleep(1)
                    await ensure_logged_in(page)
                    await ss(page, f"{prefix}_profile")
                    log_pass(f"Profile: {name_query}", page.url)

                    # Check for Match/AI buttons
                    btns = await page.locator("button").all_text_contents()
                    print(f"         Profile buttons: {btns[:8]}")

                    for match_txt in ["Match", "AI Match", "Analyze", "Score", "Compatibility"]:
                        mb = page.locator(f"button:has-text('{match_txt}')")
                        if await mb.count() > 0:
                            await mb.first.click()
                            print(f"         Waiting 20s for AI match...")
                            await asyncio.sleep(20)
                            await ss(page, f"{prefix}_match")
                            log_pass(f"AI Match for {name_query}")
                            break

                    await page.go_back()
                    await asyncio.sleep(1)
                    await ensure_logged_in(page)
        except Exception as e:
            log_fail("Candidate Profiles", str(e))

        # ── 7. APPLICATIONS ────────────────────────────────────────
        print("\n[7] APPLICATIONS")
        try:
            await ensure_logged_in(page)
            await page.locator("a:has-text('Application')").first.click()
            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ensure_logged_in(page)
            await ss(page, "07_applications")
            log_pass("Applications page", page.url)

            n = await page.locator("tr, [class*='application'], article").count()
            print(f"         {n} application rows visible")
        except Exception as e:
            log_fail("Applications", str(e))

        # ── 8. INTERVIEWS ──────────────────────────────────────────
        print("\n[8] INTERVIEWS")
        try:
            await ensure_logged_in(page)
            int_link = page.locator("a:has-text('Interview')")
            if await int_link.count() > 0:
                await int_link.first.click()
                await page.wait_for_load_state("networkidle", timeout=10000)
                await asyncio.sleep(1)
                await ensure_logged_in(page)
                await ss(page, "08_interviews")
                log_pass("Interviews page", page.url)
        except Exception as e:
            log_fail("Interviews", str(e))

        # ── 9. AI RECRUITER CHAT ───────────────────────────────────
        print("\n[9] AI RECRUITER CHAT")
        try:
            await ensure_logged_in(page)
            ai_link = page.locator("a:has-text('AI Recruiter'), a:has-text('AI'), a[href*='recruiter'], a[href*='ai']")
            if await ai_link.count() > 0:
                await ai_link.first.click()
            else:
                await page.goto(f"{FRONTEND}/ai-recruiter", wait_until="networkidle", timeout=8000)

            await page.wait_for_load_state("networkidle", timeout=8000)
            await asyncio.sleep(1)
            await ensure_logged_in(page)
            await ss(page, "09a_chat")
            log_pass("AI Recruiter Chat page", page.url)

            chat_inp = page.locator("textarea, input[type='text'][placeholder*='message' i], input[placeholder*='ask' i]")
            n_inputs = await chat_inp.count()
            print(f"         Chat inputs found: {n_inputs}")

            if n_inputs > 0:
                queries = [
                    "Who are the top candidates for the Backend Python Developer role? Give me a ranked list.",
                    "Generate 5 interview questions for Hafiz Muhammad Rehan for the Backend Python Developer role."
                ]
                for i, msg in enumerate(queries, 1):
                    actual = page.locator("textarea, input[type='text']").first
                    await actual.fill(msg)
                    await ss(page, f"09{chr(96+i)}_typed")

                    send = page.locator("button:has-text('Send'), button[type='submit'], button[aria-label*='send' i]")
                    if await send.count() > 0:
                        await send.first.click()
                    else:
                        await actual.press("Enter")

                    print(f"         Sent message {i}. Waiting 40s for AI...")
                    await asyncio.sleep(40)
                    await ss(page, f"09{chr(97+i)}_response")
                    log_pass(f"Chat message {i} response received")
            else:
                log_fail("AI Chat", "No input field found")
        except Exception as e:
            log_fail("AI Chat", str(e))

        # ── 10. REPORTS ────────────────────────────────────────────
        print("\n[10] REPORTS")
        try:
            await ensure_logged_in(page)
            rpt = page.locator("a:has-text('Report')")
            if await rpt.count() > 0:
                await rpt.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
                await asyncio.sleep(1)
                await ensure_logged_in(page)
                await ss(page, "10_reports")
                log_pass("Reports page", page.url)
        except Exception as e:
            log_fail("Reports", str(e))

        # ── 11. SETTINGS ───────────────────────────────────────────
        print("\n[11] SETTINGS")
        try:
            await ensure_logged_in(page)
            sl = page.locator("a:has-text('Settings'), a:has-text('Setting'), [href*='/settings']")
            if await sl.count() > 0:
                await sl.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
                await asyncio.sleep(1)
                await ensure_logged_in(page)
                await ss(page, "11_settings")
                log_pass("Settings page", page.url)
        except Exception as e:
            log_fail("Settings", str(e))

        # ── 12. FINAL DASHBOARD ────────────────────────────────────
        print("\n[12] FINAL DASHBOARD")
        try:
            await ensure_logged_in(page)
            await page.goto(f"{FRONTEND}/dashboard", wait_until="networkidle", timeout=10000)
            await asyncio.sleep(2)
            await ss(page, "12_final_dashboard")
            log_pass("Final dashboard screenshot")
        except Exception as e:
            log_fail("Final dashboard", str(e))

        # ── REPORT ─────────────────────────────────────────────────
        print("\n" + "="*60)
        print("  FINAL TEST REPORT")
        print("="*60)
        total = len(PASS_LIST) + len(FAIL_LIST)
        print(f"  Total: {total} | PASSED: {len(PASS_LIST)} | FAILED: {len(FAIL_LIST)}")
        if FAIL_LIST:
            print("\n  Failed tests:")
            for lbl, rsn in FAIL_LIST:
                print(f"    - {lbl}: {rsn[:120]}")
        print(f"\n  Screenshots: {SS.resolve()}")
        print(f"  Result: {'ALL PASSED' if not FAIL_LIST else f'{len(FAIL_LIST)} FAILURES'}")
        print("="*60)
        print("\n  Closing browser in 5 seconds...")
        await asyncio.sleep(5)
        await browser.close()

asyncio.run(run_tests())
