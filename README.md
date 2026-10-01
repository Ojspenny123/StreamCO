# StreamCo

A single-page streaming-service tycoon. Plain HTML, CSS, and vanilla JavaScript. No backend.

The service name lives in one place: `SERVICE_NAME` at the top of `game.js`.

## Play

Open `index.html` in a browser. One real second is one in-game day at 1×. Pause, 2×, and 4× sit in the top bar. Space pauses. Keys 1, 2, and 3 set 1×, 2×, and 4×.

A new run starts by picking Easy, Normal, Hard, or Sandbox. Easy starts with $20,000 and two rivals. Normal starts with $10,000 and three. Hard starts with $6,000 and four, and bad events hit harder. Sandbox starts with $40,000, cannot go broke, and has no random events.

The top bar shows cash, subscribers, the day, and a monthly price slider ($2.00–$20.00). Cash turns red when it is negative. Rising stats flash green and show a `+` change. Falling stats flash red and show a `-` change. The slider line reads `Growth: High / Medium / Low` and `Churn: High / Medium / Low`. Brand sits under the service name. Timed effects show as chips with days remaining.

Buy growth, retention, and platform upgrades on the left. Each repeat purchase raises that upgrade's next price by 15%. Cards you cannot afford stay grey. Commissioning an original opens a picker for genre and budget. Movie libraries and sports rights are contracts.

The right side has Home, Analytics, Regions, Rivals, and Trophies. Home keeps the subscriber graph and the poster library. Click a tile for genre, release day, hit or flop, freshness, and upkeep. The event log under the dashboard keeps the newest line at the top and can filter All, Money, Events, or Rivals.

Reset asks for confirmation, then returns to the difficulty screen. The footer reads "Created by OJ Spenny Gaming" on the dashboard and on the win screen.

The game saves to `localStorage` every 10 seconds, and also when you buy, release the price slider, leave the page, or win or lose. Opening the page restores the saved run. If you were away, up to five minutes comes back at reduced efficiency with a welcome summary. Milestones you already passed do not pop up again after a reload. Settings can export or import that save as a text file.

## Catalogue

Genres are Comedy, Drama, Sport, Kids, Documentary, and Reality. Budgets are Low (5 days, $1,800), Standard (10 days, $4,500), and Premium (20 days, $12,000). Higher budgets cost more, take longer, and hit more often.

On release the title rolls a hit, an average result, or a flop. A hit adds a HIT badge, 50% more quality on that title, and +50% growth for 30 days. A flop keeps half the quality and nicks the brand. Freshness fades over 120 days, so old titles contribute less. Three genres on the service add 10% quality. Five add 20%. Genre popularity drifts between 0.8× and 1.4× every 60 days, and the hottest one shows a Trending chip.

A movie library lasts 180 days. Sports rights last 90 days and boost growth while the contract is live. Ten days before expiry you renew or let it go. Each renewal costs 20% more than the last.

## The rest of the company

Random events are listed in `EVENTS` inside `game.js`. One can fire every few weeks, never twice inside ten days. Choice cards pause the clock. Active effects sit under the brand gauge.

Rivals share the pool of new viewers with you. The leaderboard shows rank, subscribers, the last 30 days, and market share. Click a rival for a short graph.

You start in the UK. Europe, North America, Asia-Pacific, and Latin America can be unlocked. Without a localisation upgrade, growth in that region is halved. The subscriber total is the sum of the regions, and the million-subscriber win uses that total.

Brand runs from 0 to 100. It moves growth by up to 20% and hit chance by up to 5 points. Hits, awards, and a strong catalogue raise it. Flops, scandals, and a price above $15 lower it.

Twenty trophies sit on the trophy shelf. Each one adds 1% growth for the rest of the run. Win, lose, or sell, and the score is stored with the top five for that difficulty.

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

- Subscription revenue = paying subscribers × (monthly price / 30)
- Ad revenue = free viewers × $0.03
- Paying growth = base growth × content quality × marketing multiplier × price attractiveness
- Base growth = 1.5 + paying subscribers × 0.008
- Price attractiveness falls as the price rises ($5 = 1, about 1.8 at $2, about 0.4 at $20)
- Churn rises with price, falls with content quality and recommendations, and includes a buffering penalty until servers catch up
- Daily costs = running costs + content upkeep
- Running costs = $8 + paying subscribers × $0.004

Milestones pop up at 1,000 (Local Player), 10,000 (Regional Streamer), and 100,000 (National Contender). Win at 1,000,000 subscribers with the Global Giant screen. Lose if cash stays strictly below -$50,000 for 30 days in a row.

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
```

`setContentQuality`, `setMarketingMultiplier`, and `setContentUpkeep` still override the formulas until the next purchase or reload. Owned upgrades are what get saved.
