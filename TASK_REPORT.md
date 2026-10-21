# BulGol · בולגול — v2 (21.10.2026)
Points only, no money, no betting. PWA, plain HTML/CSS/JS. Live: https://boazgolan-wq.github.io/bulgol/

## Name
Chosen and approved: **בולגול / BulGol**. A quick search found no app with this name on App Store or Google Play. Alternates, not checked in depth: ניחושגול / NichuGol, פנדלי / Pendly.

## Data source (research)
| Source | Israeli league | Top 5 | Scorers/cards | Key |
|---|---|---|---|---|
| **TheSportsDB (chosen)** | ✅ Ligat HaAl 4644 | ✅ | ✅ timeline (goals and cards) | free public key `123`, no signup, CORS works |
| football-data.org free | ❌ | ✅ | limited on the free tier | signup required |
| API-Football free | ✅ | ✅ | ✅ | signup, 100 requests/day, key has to stay hidden on a server |
Free-key limits: per-round and per-event lookups only (that's what the app uses). A Patreon key ($9/month) unlocks full livescores. Corners are not available, so corners count only in simulation matches.

## What's real and what's still mock
- **Real:** fixtures for Ligat HaAl, EPL, La Liga, Serie A, Bundesliga and Ligue 1 (current round plus the next one, with crests). After kickoff the app polls every 60 seconds. At full time it scores the result, the first scorer (name matched to the scorer you typed), yellow and red card counts, joker x2, bold pick x1.5, and awards Ball of the Match.
- **Still mock/local:** friends (bots with random picks), chat replies, notifications. Data lives in localStorage on each device.
- **Invite link:** shares the match setup through the URL. A friend can open the same match on their own device, but predictions aren't shared until the backend is connected.
- **Backend prepared:** `js/cloud.js` (Supabase REST client with magic-link sign-in) and `supabase/schema.sql` (tables plus row-level security: you write only your own picks, only before kickoff; others' picks become visible after kickoff; chat only for members; points and winner are writable by a server job only). It switches on when `js/config.js` has a URL and anon key. Syncing matches, picks and chat to it is still to be wired and tested.

## New in v2
Real fixtures and auto-scoring; 13 languages (he en es fr de ar ru zh pt it ja hi tr) with auto-detect, a language switcher and RTL for Hebrew and Arabic; team crests everywhere with a colored-initials fallback; a live leaderboard with provisional points that re-sorts on every goal and animates rank changes ▲▼; redesign (stadium background, glass cards, animations, haptics); crowd-picks bar; stats (accuracy, streak, exact scores); kickoff countdown; invite links; app icon.
## Fixes
- Score order in RTL: the home score now sits on the home team's side.
- A simulated live match no longer resets when you leave: the simulation is time-based and catches up after you navigate away or reload.
## All v1 features kept
Open a match, predictions (score, scorer, cards, corners), joker, bold picks, locking at kickoff, live picks, Ball of the Match popup with applause and confetti, share card, the "what are we playing for" line, chat, leagues and season trophy, duels, fan ranking, achievements, notifications, ad/premium/sponsor slots.
## Security
CSP (scripts and styles only from the site; images and API calls only from TheSportsDB and Supabase); no inline scripts, styles or eval (dynamic styles go through CSSOM); all user and API text escaped; crest URLs whitelisted; inputs length-limited; no-referrer; RLS policies in the schema.

## Open items / needs Boaz
1. **Supabase account** (free tier): create a project, run `supabase/schema.sql`, put the URL and anon key in `js/config.js`. After that: wire sync, plus an Edge Function that scores at full time with the service key.
2. Optionally an API-Football key, or TheSportsDB Patreon, for full live minute-by-minute data and corners.
3. iOS/Android builds later (Capacitor); push notifications through FCM/APNs.
4. Crest images come from TheSportsDB (community-sourced) and are team trademarks; check licensing before a store launch.
5. Whether the repo stays public or goes private.
- Work rule: every request goes into the task list or report as soon as it's decided to do it.
- 21.10 הוספת 6 קבוצות ליגת העל + לוגואים
- 2026-10-21 21:01 v3: celebration (fireworks+applause+13-lang toast) on correct result, kick-off whistle (sim+real), 3-blast final whistle (WebAudio), single scrollable match list with league/time filters + inline quick prediction; 13 langs.
- 21.10 ברירת מחדל עברית (שפה אחרת רק בבחירה ידנית או ?lang=)
- 2026-10-21 21:18 חבר בוחן מדומה 'בוחן 🤖 (מדומה)' (js/tester.js): מתג ב'אני' (ברירת מחדל פעיל); כל 1–2 דק' פותח משחק אם יש פחות מ-3 פעילים (מתיקון fixtures שבמטמון, אחרת סימולציה) + התראה; מצטרף לכל משחק עם ניחוש; צ'אט לפני משחק/גולים/כרטיסים/סיום; מגיב לניחוש; בדירוג, ליגות, דו־קרבות (מקבל אתגר). בלי בקשות API נוספות; 13 שפות.
- 2026-10-21 21:21 חלון ניחושים: נפתח 48 ש' לפני המשחק ("נפתחים בעוד…"), נסגר 5 ש' לפני משחק אמיתי (ספירה לאחור + 'הניחושים נסגרו 5 שעות לפני המשחק'); משחקי סימולציה ננעלים בשריקה. רשימת fixtures כוללת גם eventsnextleague (עד 30). כפתור 📤 שתף משחק בכל כרטיס ובדף משחק; קישור ?m=&d= פותח ישר את המשחק אצל חבר (מסונן ומאומת). 13 שפות.

## v5 — FT single reveal, notifications, invite sheet
- During a match: card/hero show "in progress" (⏳), no score, no event feed, no mid-match table moves; live next-scorer card hidden (code kept, inert). Kick-off whistle kept.
- Full time: one reveal — final score + goal/card timeline, all picks scored, table animates up/down (FLIP), Ball of the Match popup, celebration, then final whistle.
- Real matches: no mid-match polling. First API call at kickoff+110 min, then every 5 min until FT (`FT_AFTER`/`FT_EVERY` in js/app.js).
- Simulation runs silently and reveals at 90'. Tester bot and friends only banter during play; tester reacts at FT.
- Notifications: `sw.js` (scope ./) + `js/push.js`. Permission is asked only on a user gesture (button on the "אני" screen, or after your first prediction). At FT it shows who won and the top predictor via `registration.showNotification`, with an in-app toast fallback.
- Web Push for a closed app is prepared but **NOT ACTIVE until Supabase is connected** and `CONFIG.VAPID_PUBLIC_KEY` is set: `push_subscriptions` table + RLS in supabase/schema.sql, `supabase/functions/notify-ft` (draft; VAPID private key/NOTIFY_SECRET are set as Supabase secrets, never in the repo). Clicking a notification opens `?m=<id>`.
- Share sheet (js/invite.js): saved friends (localStorage `bgFriends`, max 50, sanitized + escaped), Contact Picker (`navigator.contacts.select`, Android Chrome only, hidden elsewhere with a note), "send to selected" (1 phone → wa.me, several → sms:, none → navigator.share), copy link, and regular share.
- New strings: 13 languages for reveal/notifications; he/en for the share sheet (others fall back to English).
- Screenshots: screenshots/v5-*.png
- v5 fix: after FT every result text says 'X ניצחה 2:1' / 'תיקו' (resTxt, 13 langs) on Ball popup, share card, hero, toast, notification; looser FT detection from TheSportsDB.
- v5 fix: Hebrew team names for TheSportsDB fixtures (ALIAS_HE in js/data.js, fallback English), RTL fixture rows with <bdi>.
