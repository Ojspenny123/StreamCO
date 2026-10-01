# StreamCo

A single-page streaming-service tycoon. Plain HTML, CSS, and vanilla JavaScript. No backend.

The service name lives in one place: `SERVICE_NAME` at the top of `game.js`.

## Play

Open `index.html` in a browser. One real second is one in-game day.

The top bar shows cash, subscribers, the day, and a monthly price slider ($2.00–$20.00). Cash turns red when it is negative. Rising stats flash green and show a `+` change. Falling stats flash red and show a `-` change. The slider line reads `Growth: High / Medium / Low` and `Churn: High / Medium / Low`.

Buy upgrades on the left. Each purchase raises that upgrade's next price by 15%. Cards you cannot afford stay grey, with a grey cost and a disabled Buy button. Owned upgrades show a `xN` badge.

The right side shows your tier, a subscriber graph, and the poster library. Commissioned shows and licensed titles appear as 2:3 posters. The event log under the dashboard keeps the newest line at the top.

Reset asks for confirmation, then starts a new run. The footer reads "Created by OJ Spenny Gaming" on the dashboard and on the win screen.

The game saves to `localStorage` every 10 seconds, and also when you buy, release the price slider, leave the page, or win or lose. Opening the page restores the saved run. Milestones you already passed do not pop up again after a reload.

## Upgrades

- **Content** — sitcoms, movies, and dramas raise quality and daily upkeep, and add a poster. Sports rights raise growth and cost a lot to run.
- **Growth** — social, TV, and the mobile app raise the marketing multiplier.
- **Retention** — recommendations cut churn by 10% each time. The free ad-supported tier adds free viewers (about $0.03 per free viewer per day) and a small growth boost. Free viewers count in the subscriber total and do not pay the monthly price.
- **Platform** — faster servers halve the buffering churn penalty each time they are bought. The churn line keeps the word "buffering" until that penalty is under 0.1%.

## Economy

Starting position:

- Cash: $10,000
- Subscribers: 100
- Content quality: 1
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
StreamCo.buyUpgrade("sitcom")
StreamCo.upgradeCost(StreamCo.UPGRADES[0])
StreamCo.tick()
StreamCo.stop()
StreamCo.start()
StreamCo.reset()
StreamCo.saveGame()
StreamCo.loadGame()
```

`setContentQuality`, `setMarketingMultiplier`, and `setContentUpkeep` still override the formulas until the next purchase or reload. Owned upgrades are what get saved.
