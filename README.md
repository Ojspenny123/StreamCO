# StreamCo

A single-page streaming-service tycoon. Plain HTML, CSS, and vanilla JavaScript. No backend and no build step.

Play it online: https://comfy-blancmange-b6c90e.netlify.app/

The product name lives in one place: `SERVICE_NAME` at the top of `game.js`. Tunable targets live in `config.js`.

## Play

Open the live site, or `index.html` in a browser. The clock does not run on load. A new game goes Title, then Setup, then How to Play, then **Let's go!**. Continue appears only when a save exists, and that is when a saved run resumes.

One in-game day lasts 5 real seconds at 1× (`secondsPerDay` in `config.js`), 2.5 seconds at 2×, and 1.25 seconds at 4×. Pause, 2×, and 4× sit in the top bar. Space pauses. Keys 1, 2, and 3 set 1×, 2×, and 4×, and choosing a speed while paused resumes at that speed. Pause is a slim banner: the clock stops, and you can still buy content, change the price, and use the dashboards. The game also pauses when the browser tab is hidden, and it resumes when you come back unless you paused yourself. **?** in the top bar reopens How to Play and pauses the run, then restores the previous pause state. Decision popups pause the clock the same way. Continue loads a save already paused. A new game starts running.

Setup offers Easy, Normal, and Hard, plus a Sandbox checkbox (no defeat, no random events) and an optional service name. Easy starts with $20,000 and two rivals. Normal starts with $10,000 and three. Hard starts with $6,000 and four, and bad events hit harder. Tick **Don't show this again** on How to Play to skip that guide on later new games.

The top bar shows cash, a credit bar, subscribers, the day, and a monthly price slider ($2.00–$20.00). Cash turns red and shows an In debt chip when it is negative. A purchase you can afford in cash is Buy. A purchase that fits inside the credit limit is Buy on credit and shows the balance after. Anything past the limit stays grey. The first time you go into debt, the game explains daily interest. Rising stats flash green and show a `+` change. Falling stats flash red and show a `-` change. The slider line reads `Growth: High / Medium / Low` and `Churn: High / Medium / Low`. A jump of more than $2 raises churn for 14 days. An optional ad-supported tier sits under the slider. Brand sits under the service name, with the subscriber hero, milestone bar, crowd of TV icons, market-share bar, and the Road to Empire meters. Timed effects show as chips with days remaining.

Buy growth, retention, and platform upgrades on the left. Each repeat purchase raises that upgrade's next price by 15%. The Content desk licenses famous titles or creates an original. Sports packages are contracts: Football, Basketball, Tennis, and Motorsport.

The right side has Home, Analytics, Regions, Rivals, and Trophies. Home keeps the subscriber graph and the poster library. Click a tile for genre, release day, hit or flop, freshness, and upkeep. The event log under the dashboard keeps the newest line at the top and can filter All, Money, Events, or Rivals.

Reset asks for confirmation, then returns to the title screen and clears the save. The footer reads "Created by OJ Spenny Gaming" on the dashboard, the title screen, How to Play, and the win screen.

The game saves to `localStorage` every 10 seconds, and also when you buy, release the price slider, leave the page, or win or lose. Older saves still load. Continue is the only path that catches up time away, up to five minutes at reduced efficiency, and that catch-up does not advance a bankruptcy countdown or the empire hold. Milestones you already passed do not pop up again after a reload. Settings can export or import a save, replay How to Play, reset the tutorial, and refresh the catalogue.

## Catalogue

The Content desk loads a catalogue from TMDB and falls back to `data/fallback.json` if the network fails. That fallback shows an Offline catalogue note. Shelves cover trending, critics, crowd pleasers, genres, and local originals for unlocked regions. Search still works on the live catalogue. A licensed title can be owned once. Offers rotate about every 30 days. TV contracts last 90 days and films 180. Sports packages last 90 days.

Create an original by picking a format, a typed or Surprise title, a lead and a supporting actor, a fictional director, a budget, and a marketing spend. Low takes about 5 days, Standard about 10, and Premium about 20, adjusted by the format and the director. Review Day shows critic and audience scores and a fictional headline. Tags are HIT, FLOP, Critics' Darling, and Guilty Pleasure. Series can order a new season from the title card.

Freshness fades over 120 days. Three genres add 10% quality. Five add 20%. Trends start from the TMDB trending shelf and drift between 0.8× and 1.4× every 60 days. Ten days before a contract ends you renew or let it go. Each renewal costs 20% more and scales with the audience.

## The rest of the company

Random events are listed in `EVENTS` inside `game.js`. One can fire every few weeks, never twice inside ten days. Choice cards pause the clock. Active effects sit under the brand gauge.

Rivals share the pool of new viewers with you. The leaderboard shows rank, subscribers, the last 30 days, and market share. Click a rival for a short graph.

You start in the UK. Europe, North America, Asia-Pacific, and Latin America can be unlocked. Without a localisation upgrade, growth in that region is halved. The subscriber total is the sum of the regions.

Brand runs from 0 to 100. It moves growth and the value of the company. Hits and awards raise it. Flops, a price above $15, and heavy credit use lower it.

Trophies sit on the shelf. Each one adds 1% growth for the rest of the run. Win, lose, or sell, and the score is stored with the top five for that difficulty.

## Upgrades

- **Growth** — social, TV, and the mobile app raise the marketing multiplier.
- **Retention** — recommendations cut churn by 10% each time. The free ad-supported tier adds free viewers (about $0.03 per free viewer per day) and a small growth boost. Free viewers are counted separately and do not pay the monthly price.
- **Platform** — faster servers halve the buffering churn penalty each time they are bought. The churn line keeps the word "buffering" until that penalty is under 0.1%.

## Economy

Starting position on Normal:

- Cash: $10,000
- Subscribers: 100, all in the UK
- Content quality: 1
- Brand: 50
- Monthly price: $5.00 (clamped between $2 and $20)

Each day:

- Subscription revenue = paying subscribers × (monthly price / 30). The ad-supported tier blends in a cheaper rate.
- Serving each subscriber costs money every day, so a $2 price can lose money as the audience grows.
- Content upkeep rises as the audience gets larger.
- Growth is capped by a price-sensitive share of the regions you have unlocked.
- Churn rises with price, falls with content quality and recommendations, and includes a buffering penalty until servers catch up.
- Daily costs = running costs + scaled content upkeep + interest while cash is negative.
- Credit starts at $75,000 on Easy, $50,000 on Normal, and $30,000 on Hard, then grows with recent revenue and brand. Interest is 0.1% of the overdraft per day, and 0.15% on Hard.
- Company value = average daily profit over the last 30 days × 365 × a multiple, plus subscribers × value per subscriber, plus cash, plus brand × brand value. Negative cash is the debt, and it is not subtracted twice.

Milestones are 1,000 (Local Player), 10,000 (Regional Streamer), 100,000 (National Contender), 1,000,000 (Global Contender), and 5,000,000 (Industry Leader). None of those is the win.

Streaming Empire requires holding all three goals for 30 days. On Normal that is $85,000,000 company value, 2,800,000 subscribers, and a healthy business: profitable for 60 days with debt under 25% of the credit limit. Easy is $28,000,000 and 1,200,000 subscribers. Hard is $220,000,000 and 5,600,000. A Normal run at 1× is aimed at roughly 45 to 60 minutes, and it should not be winnable in under about 20 minutes. Sandbox still charges interest and can reach the empire, and it does not go bankrupt. Time away is caught up for at most five real minutes, which is 60 game days at the 5-second day.

Bankruptcy starts when cash falls below minus the credit limit. You have 30 days to climb back. The countdown resets if you do. Sandbox has no countdown. The loss screen offers Try again.

Cash is shown in whole dollars (`$12,450`, or `-$50,000` when negative). Subscriber totals below 10,000 keep a thousands separator. From 10,000 upward they use one decimal with the remainder dropped, so 12,450 is `12.4K` and 1,200,000 is `1.2M`.

### Console commands

```js
StreamCo.getState()
StreamCo.setMonthlyPrice(8)
StreamCo.commission("Comedy", "low")
StreamCo.buyUpgrade("social")
StreamCo.unlockRegion("europe")
StreamCo.tick()
StreamCo.stop()
StreamCo.start()
StreamCo.reset()
StreamCo.saveGame()
StreamCo.loadGame()
StreamCo.balanceTest()
```

`setContentQuality`, `setMarketingMultiplier`, and `setContentUpkeep` still override the formulas until the next purchase or reload. Owned upgrades are what get saved.

## Releases

Every production deploy bumps `gameVersion` and `releaseDate` in `config.js`. Add the same notes to `CHANGELOG.md` and `changelog.js`. Put the version in the commit message (`v3.4: ...`). Create and push the matching git tag (`v3.4`). Update the `?v=` query on `style.css`, `config.js`, `changelog.js`, and `game.js` in `index.html`, and the `<title>` text, by hand. Use a patch bump for a fix (`3.4` to `3.4.1`) and a minor bump for a feature (`3.4` to `3.5`) unless a version was specified. Do not deploy without the changelog entry. The live version is read from `config.js`. Nothing else in the game should hard-code it.
