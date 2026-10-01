# StreamCo

A single-page streaming-service tycoon. Plain HTML, CSS, and vanilla JavaScript. No backend.

The service name lives in one place: `SERVICE_NAME` at the top of `game.js`.

## Step 1 — console simulation

This step runs the game loop and the money / subscriber math. There is no dashboard yet. Open `index.html` in a browser and watch the developer console. One real second is one in-game day.

Starting position:

- Cash: $10,000
- Subscribers: 100
- Content quality: 1
- Monthly price: $5.00 (clamped between $2 and $20)

Each day:

- Revenue = subscribers × (monthly price / 30)
- Subscriber growth = base growth × content quality × marketing multiplier × price attractiveness
- Base growth = 1.5 + subscribers × 0.008
- Price attractiveness falls as the price rises ($5 = 1, about 1.8 at $2, about 0.4 at $20)
- Churn rises with price and falls with content quality
- Daily costs = running costs + content upkeep
- Running costs = $8 + subscribers × $0.004

Win at 1,000,000 subscribers. Lose if cash stays below -$50,000 for 30 days in a row. The loop stops and prints `WIN` or `LOSE`.

Cash is shown in whole dollars (`$12,450`, or `-$50,000` when negative). Subscriber totals below 10,000 keep a thousands separator. From 10,000 upward they use one decimal with the remainder dropped, so 12,450 is `12.4K` and 1,200,000 is `1.2M`.

### Console commands

```js
StreamCo.getState()
StreamCo.setMonthlyPrice(8)
StreamCo.setContentQuality(3)
StreamCo.setMarketingMultiplier(1.25)
StreamCo.setContentUpkeep(100)
StreamCo.tick()
StreamCo.stop()
StreamCo.start()
StreamCo.reset()
```

`setContentQuality`, `setMarketingMultiplier`, and `setContentUpkeep` are temporary knobs so the formulas can be tested before upgrades exist.

## Later steps

2. Dashboard layout wired to these stats
3. Upgrades and the 15% cost increase
4. Price slider and churn
5. Milestones, win/lose screens, save/load
6. Content library, subscriber graph, and visual polish
