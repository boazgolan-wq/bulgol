import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='he-IL');pg=await ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto('http://localhost:8799/');await pg.wait_for_timeout(500)
    await pg.click('[data-tab=create]');await pg.wait_for_selector('.fix',timeout=20000);await pg.wait_for_timeout(1500);await pg.screenshot(path='screenshots/v2-1-real-fixtures.png')
    await pg.fill('#stake','המפסיד מזמין פיצה <b>x</b>');await pg.click('[data-act=create]');await pg.wait_for_timeout(1500);await pg.screenshot(path='screenshots/v2-2-real-match.png',full_page=True)
    await pg.click('[data-tab=create]');await pg.click('#mdemo');await pg.click('[data-act=create]');await pg.wait_for_timeout(300);await pg.click('[data-act=pick]');await pg.click('[data-act=start]')
    await pg.wait_for_timeout(4000);await pg.click('[data-tab=home]');await pg.wait_for_timeout(2500);await pg.screenshot(path='screenshots/v2-3-home.png')
    await pg.click('.mcard >> nth=0');await pg.wait_for_timeout(1500);await pg.screenshot(path='screenshots/v2-4-live-board.png',full_page=True)
    await pg.wait_for_selector('.ballpop',timeout=30000);await pg.wait_for_timeout(900);await pg.screenshot(path='screenshots/v2-5-ball-popup.png')
    await pg.click('[data-act=close]');await pg.click('[data-tab=me]');await pg.screenshot(path='screenshots/v2-6-profile.png',full_page=True)
    await pg.click('[data-tab=leagues]');await pg.screenshot(path='screenshots/v2-7-leagues.png',full_page=True)
    await pg.select_option('#langsel','ar');await pg.click('[data-tab=home]');await pg.screenshot(path='screenshots/v2-8-arabic.png')
    await pg.select_option('#langsel','en');await pg.click('.mcard >> nth=0');await pg.screenshot(path='screenshots/v2-9-english.png')
    print('errors',errs);await b.close()
asyncio.run(main())
