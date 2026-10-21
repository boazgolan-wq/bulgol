import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome');ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='he-IL');pg=await ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    await pg.goto('http://localhost:8799/');await pg.wait_for_timeout(500)
    await pg.click('[data-tab=create]');await pg.click('#mdemo');await pg.wait_for_timeout(300);await pg.click('[data-act=create]');await pg.wait_for_timeout(300);await pg.click('[data-act=pick]');await pg.click('[data-act=start]')
    await pg.wait_for_timeout(9000)
    txt=await pg.inner_text('.hero');print('HERO',txt.replace('\n',' | '))
    print('feed visible',await pg.locator('#feed').count(),'chat',await pg.inner_text('#chat'))
    await pg.screenshot(path='screenshots/v5-1-in-progress.png',full_page=True)
    await pg.click('[data-tab=home]');await pg.wait_for_timeout(500);await pg.screenshot(path='screenshots/v5-2-list-in-progress.png')
    await pg.click('[data-open] >> nth=0');await pg.wait_for_timeout(300)
    await pg.wait_for_selector('.hero .pill.done',timeout=30000);await pg.wait_for_timeout(1000);await pg.screenshot(path='screenshots/v5-3-ft-reveal.png',full_page=True)
    await pg.wait_for_timeout(1500);await pg.screenshot(path='screenshots/v5-4-ft-table-moves.png',full_page=True)
    await pg.wait_for_selector('.ballpop',timeout=8000);await pg.wait_for_timeout(900);await pg.screenshot(path='screenshots/v5-fix-ball.png');print('BALL',await pg.inner_text('.ballpop'))
    await pg.click('[data-act=close]');await pg.click('[data-tab=me]');await pg.screenshot(path='screenshots/v5-6-notif-button.png',full_page=True)
    await pg.click('[data-tab=home]');await pg.click('[data-act=sharem] >> nth=0');await pg.fill('#fn','דני <b>');await pg.fill('#fp','052-123-4567');await pg.click('[data-act=iadd]');await pg.fill('#fn','Rina');await pg.click('[data-act=iadd]');await pg.wait_for_timeout(300);await pg.screenshot(path='screenshots/v5-invite.png')
    print('rows',await pg.locator('.frow').count(),await pg.inner_text('.flist'));await pg.click('[data-act=close]')
    print('sw',await pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.length)"))
    for l in ['en','ar','ja']:
      await pg.select_option('#langsel',l);await pg.wait_for_timeout(200)
    print('errors',errs);await b.close()
asyncio.run(main())
