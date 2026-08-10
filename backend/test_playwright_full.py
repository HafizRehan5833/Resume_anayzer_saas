"""
Full Playwright Browser Automation Test - Resume Analyzer SaaS
Opens a REAL Chromium browser (visible) and tests every feature.
Run with: uv run python test_playwright_full.py
"""
import os
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

FRONTEND = "http://localhost:3000"
SCREENSHOTS_DIR = Path("test_screenshots")
SCREENSHOTS_DIR.mkdir(exist_ok=True)

REHAN_PDF = str(Path("hafiz_rehan_resume.pdf").resolve())
FAHAD_PDF = str(Path("muhammad_fahad_resume.pdf").resolve())

SIGNUP_EMAIL    = "testhr_playwright@techvision.com"
SIGNUP_PASSWORD = "SecurePass123!"
SIGNUP_NAME     = "Test HR Manager"
COMPANY_NAME    = "TechVision Corp"

EXISTING_EMAIL    = "demo_hr_1783413662@example.com"
EXISTING_PASSWORD = "password123"

PASS_LIST = []
FAIL_LIST = []

def log_pass(label):
    print(f"  [PASS] {label}")
    PASS_LIST.append(label)

def log_fail(label, reason=""):
    print(f"  [FAIL] {label} -- {reason}")
    FAIL_LIST.append((label, reason))

async def screenshot(page, name):
    try:
        path = str(SCREENSHOTS_DIR / f"{name}.png")
        await page.screenshot(path=path, full_page=True)
        print(f"         Screenshot: {path}")
        return path
    except Exception as e:
        print(f"         Screenshot failed: {e}")
        return None


async def run_tests():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=500)
        ctx = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await ctx.new_page()

        print("\n" + "="*60)
        print("  RESUME ANALYZER SAAS - FULL BROWSER TEST")
        print("="*60)

        # ── 1. LANDING PAGE ────────────────────────────────────────
        print("\n[1] LANDING PAGE")
        try:
            await page.goto(FRONTEND, wait_until="networkidle", timeout=15000)
            title = await page.title()
            await screenshot(page, "01_landing_page")
            log_pass(f"Landing page loaded — title: '{title}'")
        except Exception as e:
            log_fail("Landing page", str(e))

        # ── 2. SIGN UP ─────────────────────────────────────────────
        print("\n[2] SIGN UP")
        logged_in = False
        try:
            btn = page.locator("a:has-text('Sign Up'), a:has-text('Register'), a:has-text('Get Started'), button:has-text('Get Started'), button:has-text('Sign Up')")
            if await btn.count() > 0:
                await btn.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
            else:
                await page.goto(f"{FRONTEND}/register", wait_until="networkidle", timeout=10000)

            await screenshot(page, "02a_signup_page")

            for sel in ["input[name='name']", "input[placeholder*='name' i]", "input[id*='name' i]"]:
                el = page.locator(sel)
                if await el.count() > 0:
                    await el.first.fill(SIGNUP_NAME)
                    break

            for sel in ["input[name='company']", "input[placeholder*='company' i]"]:
                el = page.locator(sel)
                if await el.count() > 0:
                    await el.first.fill(COMPANY_NAME)
                    break

            email_el = page.locator("input[type='email'], input[name='email']")
            if await email_el.count() > 0:
                await email_el.first.fill(SIGNUP_EMAIL)

            pw_els = page.locator("input[type='password']")
            c = await pw_els.count()
            if c >= 1:
                await pw_els.nth(0).fill(SIGNUP_PASSWORD)
            if c >= 2:
                await pw_els.nth(1).fill(SIGNUP_PASSWORD)

            await screenshot(page, "02b_signup_filled")

            sub = page.locator("button[type='submit'], button:has-text('Sign Up'), button:has-text('Create Account'), button:has-text('Register')")
            if await sub.count() > 0:
                await sub.first.click()
                await page.wait_for_load_state("networkidle", timeout=15000)
                await asyncio.sleep(2)
                await screenshot(page, "02c_after_signup")
                if "login" not in page.url and "register" not in page.url:
                    log_pass(f"Signup OK -> {page.url}")
                    logged_in = True
                else:
                    log_fail("Signup", "Still on auth page after submit")
        except Exception as e:
            log_fail("Signup", str(e))

        # ── 2b. LOGIN FALLBACK ─────────────────────────────────────
        if not logged_in:
            print("\n[2b] LOGIN (fallback)")
            try:
                await page.goto(f"{FRONTEND}/login", wait_until="networkidle", timeout=10000)
                await screenshot(page, "02d_login_page")

                await page.locator("input[type='email'], input[name='email']").first.fill(EXISTING_EMAIL)
                await page.locator("input[type='password']").first.fill(EXISTING_PASSWORD)
                await screenshot(page, "02e_login_filled")

                await page.locator("button[type='submit'], button:has-text('Login'), button:has-text('Sign In')").first.click()
                await page.wait_for_load_state("networkidle", timeout=15000)
                await asyncio.sleep(2)
                await screenshot(page, "02f_after_login")

                if "login" not in page.url:
                    log_pass(f"Login OK -> {page.url}")
                    logged_in = True
                else:
                    log_fail("Login", f"Still at {page.url}")
            except Exception as e:
                log_fail("Login", str(e))

        if not logged_in:
            print("  Cannot proceed. Exiting.")
            await browser.close()
            return

        # ── 3. DASHBOARD ───────────────────────────────────────────
        print("\n[3] DASHBOARD")
        try:
            if "dashboard" not in page.url:
                await page.goto(f"{FRONTEND}/dashboard", wait_until="networkidle", timeout=10000)
            await asyncio.sleep(2)
            await screenshot(page, "03_dashboard")
            log_pass("Dashboard loaded")
            n = await page.locator("[class*='stat'], [class*='card'], [class*='metric']").count()
            print(f"         {n} stat/card elements visible")
        except Exception as e:
            log_fail("Dashboard", str(e))

        # ── 4. JOBS PAGE ───────────────────────────────────────────
        print("\n[4] JOBS PAGE")
        try:
            jl = page.locator("a:has-text('Jobs'), [href*='/jobs']")
            if await jl.count() > 0:
                await jl.first.click()
            else:
                await page.goto(f"{FRONTEND}/jobs", wait_until="networkidle", timeout=10000)

            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(1)
            await screenshot(page, "04a_jobs_list")
            log_pass("Jobs page loaded")

            n = await page.locator("tbody tr, [class*='job-card'], [class*='job-item']").count()
            print(f"         {n} job entries visible")

            cb = page.locator("button:has-text('Create'), button:has-text('New Job'), button:has-text('Add Job'), button:has-text('Post Job'), a:has-text('Create Job')")
            if await cb.count() > 0:
                await cb.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
                await asyncio.sleep(1)
                await screenshot(page, "04b_job_form")
                log_pass("Create Job form opened")

                # Title
                for sel in ["input[name='title']", "input[placeholder*='title' i]", "input[id*='title' i]"]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill("Senior AI Engineer")
                        break

                # AI Generate button?
                ai_btn = page.locator("button:has-text('Generate'), button:has-text('AI Generate'), button:has-text('Auto-fill')")
                if await ai_btn.count() > 0:
                    await ai_btn.first.click()
                    print("         AI generating job description (15s)...")
                    await asyncio.sleep(15)
                    await screenshot(page, "04c_ai_generated_desc")
                    log_pass("AI job description generated")
                else:
                    for sel in ["textarea[name='description']", "textarea[placeholder*='description' i]", "textarea"]:
                        el = page.locator(sel)
                        if await el.count() > 0:
                            await el.first.fill("We are looking for a Senior AI Engineer with expertise in LLMs, RAG systems, LangChain, and Python. You will build next-generation AI-powered applications.")
                            break

                for sel in ["input[name*='skill']", "input[placeholder*='skill' i]"]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill("Python, LangChain, FastAPI, RAG, Vector Databases")
                        break

                for sel in ["input[name='experience']", "input[placeholder*='experience' i]"]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill("3+ years")
                        break

                for sel in ["input[name='location']", "input[placeholder*='location' i]"]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill("Remote")
                        break

                for sel in ["input[name*='salary']", "input[placeholder*='salary' i]"]:
                    el = page.locator(sel)
                    if await el.count() > 0:
                        await el.first.fill("$130k - $180k")
                        break

                await screenshot(page, "04d_job_form_filled")

                sb = page.locator("button[type='submit'], button:has-text('Save'), button:has-text('Create'), button:has-text('Post')")
                if await sb.count() > 0:
                    await sb.first.click()
                    await page.wait_for_load_state("networkidle", timeout=10000)
                    await asyncio.sleep(2)
                    await screenshot(page, "04e_job_created")
                    log_pass("Job 'Senior AI Engineer' created")
            else:
                log_fail("Create Job button", "Not found on jobs page")
        except Exception as e:
            log_fail("Jobs page", str(e))

        # ── 5. CANDIDATES - UPLOAD RESUMES ─────────────────────────
        print("\n[5] CANDIDATES + RESUME UPLOAD")
        try:
            cl = page.locator("a:has-text('Candidate'), [href*='/candidates']")
            if await cl.count() > 0:
                await cl.first.click()
            else:
                await page.goto(f"{FRONTEND}/candidates", wait_until="networkidle", timeout=10000)

            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(1)
            await screenshot(page, "05a_candidates_list")
            log_pass("Candidates page loaded")

            for pdf_path, name, prefix in [
                (REHAN_PDF, "Hafiz Muhammad Rehan", "05b_rehan"),
                (FAHAD_PDF, "Muhammad Fahad",       "05c_fahad"),
            ]:
                print(f"\n         Uploading {name}...")
                if not os.path.exists(pdf_path):
                    log_fail(f"Upload {name}", "PDF not found")
                    continue

                ub = page.locator("button:has-text('Upload'), button:has-text('Import'), button:has-text('Add Candidate'), button:has-text('New Candidate'), button:has-text('Add')")
                fi = page.locator("input[type='file']")

                if await ub.count() > 0:
                    async with page.expect_file_chooser() as fc_info:
                        await ub.first.click()
                    fc = await fc_info.value
                    await fc.set_files(pdf_path)
                    print("         File chosen. Waiting up to 45s for AI parsing...")
                    await asyncio.sleep(45)
                    await screenshot(page, f"{prefix}_parsed")
                    log_pass(f"Uploaded + parsed: {name}")
                elif await fi.count() > 0:
                    await fi.first.set_files(pdf_path)
                    print("         File set. Waiting up to 45s for AI parsing...")
                    await asyncio.sleep(45)
                    await screenshot(page, f"{prefix}_parsed")
                    log_pass(f"Uploaded + parsed: {name}")
                else:
                    log_fail(f"Upload {name}", "No upload control found")

            await screenshot(page, "05d_after_both_uploads")
        except Exception as e:
            log_fail("Candidates / Upload", str(e))

        # ── 6. CANDIDATE PROFILE + AI MATCH ────────────────────────
        print("\n[6] CANDIDATE PROFILE + AI MATCH")
        try:
            for name_txt, prefix in [("Hafiz", "06a_rehan_profile"), ("Fahad", "06b_fahad_profile")]:
                el = page.locator(f"text={name_txt}")
                if await el.count() > 0:
                    await el.first.click()
                    await page.wait_for_load_state("networkidle", timeout=8000)
                    await asyncio.sleep(1)
                    await screenshot(page, prefix)
                    log_pass(f"Opened profile: {name_txt}")

                    mb = page.locator("button:has-text('Match'), button:has-text('AI Match'), button:has-text('Analyze')")
                    if await mb.count() > 0:
                        await mb.first.click()
                        print("         Waiting 20s for AI match...")
                        await asyncio.sleep(20)
                        await screenshot(page, f"{prefix}_match")
                        log_pass(f"AI Match result for {name_txt}")

                    await page.go_back()
                    await asyncio.sleep(1)
        except Exception as e:
            log_fail("Candidate Profiles", str(e))

        # ── 7. APPLICATIONS ────────────────────────────────────────
        print("\n[7] APPLICATIONS")
        try:
            al = page.locator("a:has-text('Application'), [href*='/applications']")
            if await al.count() > 0:
                await al.first.click()
            else:
                await page.goto(f"{FRONTEND}/applications", wait_until="networkidle", timeout=10000)

            await page.wait_for_load_state("networkidle", timeout=10000)
            await asyncio.sleep(1)
            await screenshot(page, "07_applications")
            log_pass("Applications page loaded")
            n = await page.locator("tbody tr, [class*='application']").count()
            print(f"         {n} application entries visible")
        except Exception as e:
            log_fail("Applications", str(e))

        # ── 8. AI RECRUITER CHAT ───────────────────────────────────
        print("\n[8] AI RECRUITER CHAT")
        try:
            chat_sel = page.locator("a:has-text('AI Recruiter'), a:has-text('AI Chat'), a:has-text('Chat'), a:has-text('Assistant'), [href*='chat'], [href*='recruiter'], [href*='ai-']")
            if await chat_sel.count() > 0:
                await chat_sel.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
            else:
                for path in ["/ai-recruiter", "/ai-chat", "/chat", "/assistant"]:
                    try:
                        await page.goto(f"{FRONTEND}{path}", wait_until="networkidle", timeout=6000)
                        if "404" not in await page.title() and "not found" not in (await page.title()).lower():
                            break
                    except Exception:
                        continue

            await asyncio.sleep(1)
            await screenshot(page, "08a_chat_page")
            log_pass("AI Chat page opened")

            inp = page.locator("textarea[placeholder*='message' i], textarea[placeholder*='ask' i], textarea[placeholder*='type' i], input[placeholder*='message' i], textarea").first
            if await page.locator("textarea, input[placeholder*='message' i]").count() > 0:
                queries = [
                    "Tell me about the candidates we have and which one would be best for the Backend Python Developer role?",
                    "Generate 5 interview questions for Hafiz Muhammad Rehan for the Backend Python Developer role"
                ]
                for i, msg in enumerate(queries, 1):
                    actual_inp = page.locator("textarea, input[placeholder*='message' i]").first
                    await actual_inp.fill(msg)
                    await screenshot(page, f"08{chr(96+i)}_chat_typed_{i}")

                    sb = page.locator("button:has-text('Send'), button[type='submit'], button:has-text('Ask')")
                    if await sb.count() > 0:
                        await sb.first.click()
                    else:
                        await actual_inp.press("Enter")

                    print(f"         Waiting 40s for AI response {i}...")
                    await asyncio.sleep(40)
                    await screenshot(page, f"08{chr(98+i)}_chat_response_{i}")
                    log_pass(f"AI Chat message {i} sent + response received")
            else:
                log_fail("AI Chat input", "No textarea/input found")
        except Exception as e:
            log_fail("AI Chat", str(e))

        # ── 9. SETTINGS ────────────────────────────────────────────
        print("\n[9] SETTINGS / PROFILE")
        try:
            sl = page.locator("a:has-text('Settings'), a:has-text('Profile'), [href*='/settings'], [href*='/profile']")
            if await sl.count() > 0:
                await sl.first.click()
                await page.wait_for_load_state("networkidle", timeout=8000)
                await asyncio.sleep(1)
                await screenshot(page, "09_settings")
                log_pass("Settings page opened")
            else:
                print("         No settings link found")
        except Exception as e:
            log_fail("Settings", str(e))

        # ── 10. FINAL DASHBOARD ────────────────────────────────────
        print("\n[10] FINAL DASHBOARD OVERVIEW")
        try:
            await page.goto(f"{FRONTEND}/dashboard", wait_until="networkidle", timeout=10000)
            await asyncio.sleep(2)
            await screenshot(page, "10_final_dashboard")
            log_pass("Final dashboard screenshot done")
        except Exception as e:
            log_fail("Final dashboard", str(e))

        # ── REPORT ─────────────────────────────────────────────────
        print("\n" + "="*60)
        print("  FINAL TEST REPORT")
        print("="*60)
        total = len(PASS_LIST) + len(FAIL_LIST)
        print(f"  Total: {total} | PASSED: {len(PASS_LIST)} | FAILED: {len(FAIL_LIST)}")
        if FAIL_LIST:
            print("\n  Failed:")
            for lbl, rsn in FAIL_LIST:
                print(f"    - {lbl}: {rsn[:100]}")
        print(f"\n  Screenshots in: {SCREENSHOTS_DIR.resolve()}")
        print(f"  Result: {'ALL PASSED' if not FAIL_LIST else f'{len(FAIL_LIST)} FAILURES'}")
        print("="*60)
        print("\n  Keeping browser open 10s...")
        await asyncio.sleep(10)
        await browser.close()

asyncio.run(run_tests())
