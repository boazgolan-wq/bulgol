import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://localhost:8799/');await pg.wait_for_timeout(500)
    await pg.click('[data-tab=create]');await pg.fill('#stake','המפסיד מזמין פיצה <b>x</b>');await pg.screenshot(path='screenshots/1-create.png')
    await pg.click('[data-act=create]');await pg.wait_for_timeout(300);await pg.screenshot(path='screenshots/2-predict.png',full_page=True)
    await pg.click('[data-act=pick]');await pg.click('[data-act=start]');await pg.wait_for_timeout(5000);await pg.screenshot(path='screenshots/3-live.png',full_page=True)
    await pg.wait_for_timeout(13000);await pg.screenshot(path='screenshots/4-ball-popup.png')
    await pg.click('[data-act=close]');await pg.click('[data-tab=leagues]');await pg.screenshot(path='screenshots/5-leagues.png',full_page=True)
    await pg.click('[data-tab=me]');await pg.screenshot(path='screenshots/6-badges.png',full_page=True)
    await pg.click('#langbtn');await pg.click('[data-tab=home]');await pg.screenshot(path='screenshots/7-home-en.png')
    print('errors',errs);await b.close()
asyncio.run(main())
