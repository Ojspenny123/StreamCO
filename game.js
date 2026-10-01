"use strict";

/**
 * StreamCo. Change the service name here only.
 */
const SERVICE_NAME = "StreamCo";

const STARTING_CASH = 10000;
const STARTING_SUBSCRIBERS = 100;
const STARTING_CONTENT_QUALITY = 1;
const STARTING_MONTHLY_PRICE = 5;
const STARTING_MARKETING_MULTIPLIER = 1;
const STARTING_CONTENT_UPKEEP = 0;

const MIN_MONTHLY_PRICE = 2;
const MAX_MONTHLY_PRICE = 20;
const TICK_MS = 1000;
const SAVE_EVERY_MS = 10000;
const SAVE_KEY = "streamco-save-v1";
const UPGRADE_COST_GROWTH = 1.15;
const BUFFERING_CHURN = 0.0025;
const FREE_USER_AD_REVENUE = 0.03;

const WIN_SUBSCRIBERS = 1000000;
const LOSE_CASH = -50000;
const LOSE_STREAK_DAYS = 30;

const BASE_RUNNING_COST = 8;
const PER_SUBSCRIBER_RUNNING_COST = 0.004;
const BASE_FLAT_SIGNUPS = 1.5;
const ORGANIC_SIGNUP_RATE = 0.008;
const MAX_LOG_ENTRIES = 40;
const MAX_HISTORY = 480;

const UPGRADES = [
  { id: "sitcom", group: "Content", name: "Commission a sitcom", effect: "Quality +1", cost: 2000, quality: 1, upkeep: 22, icon: "sitcom", event: "Your sitcom is a hit!" },
  { id: "movies", group: "Content", name: "Buy a movie library", effect: "Quality +2", cost: 5000, quality: 2, upkeep: 55, icon: "movies", event: "A movie library just landed." },
  { id: "drama", group: "Content", name: "Commission a flagship drama", effect: "Quality +4, higher upkeep", cost: 15000, quality: 4, upkeep: 160, icon: "drama", event: "The flagship drama is the talk of the service." },
  { id: "sports", group: "Content", name: "Sign a sports rights deal", effect: "Big growth boost, high daily cost", cost: 50000, marketing: 0.8, upkeep: 420, icon: "sports", event: "Sports rights are live." },
  { id: "social", group: "Growth", name: "Social media campaign", effect: "+10% growth", cost: 2500, marketing: 0.1, icon: "social", event: "The social campaign is picking up shares." },
  { id: "tv", group: "Growth", name: "TV advertising", effect: "+25% growth", cost: 8000, marketing: 0.25, icon: "tv", event: "The TV spot is on the air." },
  { id: "app", group: "Growth", name: "Mobile app", effect: "+15% growth", cost: 12000, marketing: 0.15, icon: "app", event: "The mobile app is in people's pockets." },
  { id: "recommendations", group: "Retention", name: "Better recommendations", effect: "-10% churn", cost: 4000, icon: "recs", event: "Recommendations are keeping people watching." },
  { id: "free-tier", group: "Retention", name: "Free ad-supported tier", effect: "+growth, small revenue per free user", cost: 6000, marketing: 0.12, icon: "free", event: "The free tier is open." },
  { id: "servers", group: "Platform", name: "Faster servers", effect: "Halves the buffering churn penalty", cost: 9000, icon: "servers", event: "Faster servers cleared the buffering." },
];

const TITLE_POOLS = {
  sitcom: [["Apartment 4B", "Comedy"], ["Desk Job", "Comedy"], ["The Group Chat", "Comedy"], ["Sunday Roast", "Comedy"], ["Neighbours Upstairs", "Comedy"]],
  movies: [["Afterlight", "Film"], ["Harbour Street", "Film"], ["Cold Open", "Film"], ["Paper Moons", "Film"], ["The Last Reel", "Film"]],
  drama: [["Crown of Salt", "Drama"], ["The Long Winter", "Drama"], ["Northline", "Drama"], ["Glass House", "Drama"], ["Meridian", "Drama"]],
  sports: [["Matchday", "Sports"], ["Prime Kickoff", "Sports"], ["Final Whistle", "Sports"], ["Home Advantage", "Sports"], ["Extra Time", "Sports"]],
};

const GENRE_GRADIENTS = {
  Comedy: "linear-gradient(165deg, #E50914, #5C1020)",
  Film: "linear-gradient(165deg, #3150C8, #141428)",
  Drama: "linear-gradient(165deg, #8C2C55, #1A1018)",
  Sports: "linear-gradient(165deg, #1C8A4A, #102418)",
};

const MILESTONES = [
  { id: "local", at: 1000, name: "Local Player", line: "A thousand people pressed play." },
  { id: "regional", at: 10000, name: "Regional Streamer", line: "Your catalogue is the talk of the region." },
  { id: "national", at: 100000, name: "National Contender", line: "The whole country is watching." },
  { id: "global", at: 1000000, name: "Global Giant", line: "A million subscribers. The world is watching.", win: true },
];

const ICONS = {
  sitcom: "M4 5h16v11H4V5zm2 13h12v2H6v-2z",
  movies: "M6 3h2v3H6V3zm4 0h2v3h-2V3zm4 0h2v3h-2V3zM4 8h16v13H4V8z",
  drama: "M12 2.8l2.1 4.4 4.8.7-3.5 3.4.8 4.8L12 14.2 7.8 16.1l.8-4.8L5.1 7.9l4.8-.7L12 2.8z",
  sports: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14z",
  social: "M8 11a3 3 0 110-6 3 3 0 010 6zm9 .5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM3 18.5V17c0-2 2-3.5 5-3.5s5 1.5 5 3.5v1.5H3zm11 .5v-1.4c0-.5.1-1 .4-1.4 1.4-.7 3.6-1.2 5.1-1.2 2.4 0 3.5 1.2 3.5 2.6V19h-9z",
  tv: "M3 6h18v11H3V6zm7 13h4v2h-4v-2z",
  app: "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zm1 2v14h6V4H9zm2 15h2v1h-2v-1z",
  recs: "M4 5h16v2H4V5zm0 6h10v2H4v-2zm0 6h12v2H4v-2zm13-7l4 3-4 3v-6z",
  free: "M12 3l8 4v2H4V7l8-4zM4 11h16v9H4v-9zm3 2v5h3v-5H7z",
  servers: "M3 3h18v6H3V3zm2 2v2h3V5H5zm0 8v2h3v-2H5zM3 11h18v6H3v-6z",
};

let timerId = null;
let saveTimer = null;
let state = createInitialState();
let owned = emptyOwned();
let library = [];
let history = [STARTING_SUBSCRIBERS];
let milestonesSeen = new Set();
let milestoneQueue = [];
let sessionLoaded = false;

function createInitialState() {
  return {
    day: 0,
    cash: STARTING_CASH,
    subscribers: STARTING_SUBSCRIBERS,
    freeUsers: 0,
    contentQuality: STARTING_CONTENT_QUALITY,
    monthlyPrice: STARTING_MONTHLY_PRICE,
    marketingMultiplier: STARTING_MARKETING_MULTIPLIER,
    contentUpkeep: STARTING_CONTENT_UPKEEP,
    daysBelowLoseLine: 0,
    status: "playing",
  };
}

function emptyOwned() {
  const counts = {};
  UPGRADES.forEach((upgrade) => {
    counts[upgrade.id] = 0;
  });
  return counts;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundCents(value) {
  return Math.round(value * 100) / 100;
}

function roundSubscribers(value) {
  return Math.round(value * 10000) / 10000;
}

function ownedCount(id) {
  return owned[id] || 0;
}

function upgradeById(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id) || null;
}

function upgradeCost(upgrade, count) {
  const ownedSoFar = count === undefined ? ownedCount(upgrade.id) : count;
  return Math.round(upgrade.cost * Math.pow(UPGRADE_COST_GROWTH, ownedSoFar));
}

function applyUpgradeEffects() {
  let quality = STARTING_CONTENT_QUALITY;
  let marketing = STARTING_MARKETING_MULTIPLIER;
  let upkeep = 0;
  UPGRADES.forEach((upgrade) => {
    const count = ownedCount(upgrade.id);
    quality += (upgrade.quality || 0) * count;
    marketing += (upgrade.marketing || 0) * count;
    upkeep += (upgrade.upkeep || 0) * count;
  });
  state.contentQuality = quality;
  state.marketingMultiplier = marketing;
  state.contentUpkeep = roundCents(upkeep);
}

function audienceOf(snapshotState) {
  return snapshotState.subscribers + (snapshotState.freeUsers || 0);
}

/**
 * Price attractiveness falls as the monthly price rises.
 * $5 => 1. About 1.8 at $2, about 0.4 at $20.
 */
function priceAttractiveness(monthlyPrice) {
  return Math.pow(5 / monthlyPrice, 0.65);
}

/**
 * Daily fraction of subscribers who leave.
 * Rises with price, falls with content quality and recommendations.
 * A buffering penalty remains until faster servers are bought.
 */
function churnRate(monthlyPrice, contentQuality, recommendationLevel = 0, serverLevel = 0) {
  const span = MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE;
  const priceLift = Math.pow((monthlyPrice - MIN_MONTHLY_PRICE) / span, 1.35);
  const base = 0.0015 + priceLift * 0.02;
  const qualityRelief = 1 / (1 + Math.max(0, contentQuality - 1) * 0.22);
  const buffering = BUFFERING_CHURN * Math.pow(0.5, serverLevel);
  const rate = (base * qualityRelief + buffering) * Math.pow(0.9, recommendationLevel);
  return clamp(rate, 0.001, 0.08);
}

function bufferingChurn(serverLevel = ownedCount("servers")) {
  return BUFFERING_CHURN * Math.pow(0.5, serverLevel);
}

function baseGrowth(subscribers) {
  return BASE_FLAT_SIGNUPS + subscribers * ORGANIC_SIGNUP_RATE;
}

/** Gross new paying subscribers today, before churn. */
function subscriberGrowth(subscribers, contentQuality, marketingMultiplier, monthlyPrice) {
  return (
    baseGrowth(subscribers) *
    contentQuality *
    marketingMultiplier *
    priceAttractiveness(monthlyPrice)
  );
}

function freeNetChange(freeUsers, freeTier, monthlyPrice, contentQuality, recommendationLevel, serverLevel) {
  if (freeTier <= 0) return 0;
  const signups = (2 + freeUsers * 0.012) * freeTier * priceAttractiveness(monthlyPrice);
  const leaving = freeUsers * churnRate(monthlyPrice, contentQuality, recommendationLevel, serverLevel) * 0.7;
  return signups - leaving;
}

function dailyRevenue(subscribers, monthlyPrice) {
  return subscribers * (monthlyPrice / 30);
}

function runningCosts(subscribers) {
  return BASE_RUNNING_COST + subscribers * PER_SUBSCRIBER_RUNNING_COST;
}

function dailyCosts(subscribers, contentUpkeep) {
  return runningCosts(subscribers) + contentUpkeep;
}

function growthLabel(attractiveness) {
  if (attractiveness >= 1.15) return "High";
  if (attractiveness >= 0.7) return "Medium";
  return "Low";
}

function churnLabel(rate) {
  if (rate <= 0.0045) return "Low";
  if (rate <= 0.01) return "Medium";
  return "High";
}

function formatCash(amount) {
  const rounded = Math.round(amount);
  const body = Math.abs(rounded).toLocaleString("en-US");
  return rounded < 0 ? `-$${body}` : `$${body}`;
}

function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/** One decimal, remainder dropped, so 12,450 is 12.4K and 1,200,000 is 1.2M. */
function formatOneDecimal(value) {
  const truncated = Math.floor(value * 10 + 1e-8) / 10;
  return truncated.toFixed(1);
}

function formatSubscribers(value) {
  const n = Math.round(value);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${sign}${formatOneDecimal(abs / 1000000)}M`;
  if (abs >= 10000) return `${sign}${formatOneDecimal(abs / 1000)}K`;
  return `${sign}${abs.toLocaleString("en-US")}`;
}

function formatSignedNumber(value, digits) {
  const text = Math.abs(value).toFixed(digits);
  if (value > 0) return `+${text}`;
  if (value < 0) return `-${text}`;
  return text;
}

function formatSignedMoney(amount) {
  const text = Math.abs(amount).toFixed(2);
  if (amount > 0) return `+$${text}`;
  if (amount < 0) return `-$${text}`;
  return `$${text}`;
}

function snapshot() {
  const recommendations = ownedCount("recommendations");
  const servers = ownedCount("servers");
  const freeTier = ownedCount("free-tier");
  const freeUsers = state.freeUsers || 0;
  const attractiveness = priceAttractiveness(state.monthlyPrice);
  const churn = churnRate(state.monthlyPrice, state.contentQuality, recommendations, servers);
  const growth = subscriberGrowth(
    state.subscribers,
    state.contentQuality,
    state.marketingMultiplier,
    state.monthlyPrice
  );
  const leaving = state.subscribers * churn;
  const netPaid = growth - leaving;
  const netFree = freeNetChange(
    freeUsers,
    freeTier,
    state.monthlyPrice,
    state.contentQuality,
    recommendations,
    servers
  );
  const adRevenue = freeUsers * FREE_USER_AD_REVENUE;
  const revenue = dailyRevenue(state.subscribers, state.monthlyPrice) + adRevenue;
  const costs = dailyCosts(state.subscribers, state.contentUpkeep);
  const buffering = bufferingChurn(servers);

  return {
    serviceName: SERVICE_NAME,
    day: state.day,
    cash: state.cash,
    subscribers: state.subscribers,
    freeUsers,
    audience: state.subscribers + freeUsers,
    contentQuality: state.contentQuality,
    monthlyPrice: state.monthlyPrice,
    marketingMultiplier: state.marketingMultiplier,
    contentUpkeep: state.contentUpkeep,
    daysBelowLoseLine: state.daysBelowLoseLine,
    status: state.status,
    priceAttractiveness: attractiveness,
    growthLabel: growthLabel(attractiveness),
    churnRate: churn,
    churnLabel: churnLabel(churn),
    bufferingChurn: buffering,
    baseGrowth: baseGrowth(state.subscribers),
    subscriberGrowth: growth,
    subscribersLost: leaving,
    netPaid,
    netFree,
    netSubscribers: netPaid,
    netAudience: netPaid + netFree,
    adRevenue,
    dailyRevenue: revenue,
    runningCosts: runningCosts(state.subscribers),
    dailyCosts: costs,
    netCash: revenue - costs,
    owned: { ...owned },
  };
}

function logIntro() {
  const view = snapshot();
  console.log(
    `%c${SERVICE_NAME}%c dashboard running. 1 real second = 1 day. ` +
      `Cash ${formatCash(view.cash)}, subscribers ${formatSubscribers(view.audience)}, ` +
      `quality ${view.contentQuality}, price ${formatPrice(view.monthlyPrice)}. ` +
      `Growth: ${view.growthLabel} / Churn: ${view.churnLabel}.`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0"
  );
}

function logDay(before, after) {
  const cashColor = after.cash < 0 ? "color:#FF4D4F;font-weight:700" : "color:#FFFFFF;font-weight:700";
  const deltaSubColor = before.netAudience < 0 ? "color:#FF4D4F;font-weight:700" : "color:#2ECC71;font-weight:700";
  const deltaCashColor = before.netCash < 0 ? "color:#FF4D4F;font-weight:700" : "color:#2ECC71;font-weight:700";
  console.log(
    `%c${SERVICE_NAME}%c Day ${after.day}` +
      `  Cash %c${formatCash(after.cash)}%c (%c${formatSignedMoney(before.netCash)}%c)` +
      `  Subs %c${formatSubscribers(after.audience)}%c (%c${formatSignedNumber(before.netAudience, 2)}%c)` +
      `  Quality ${after.contentQuality}` +
      `  Price ${formatPrice(after.monthlyPrice)}` +
      `  Growth ${before.growthLabel}` +
      `  Churn ${before.churnLabel} ${(before.churnRate * 100).toFixed(2)}%`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0",
    cashColor,
    "color:#A0A0B0",
    deltaCashColor,
    "color:#A0A0B0",
    "color:#FFFFFF;font-weight:700",
    "color:#A0A0B0",
    deltaSubColor,
    "color:#A0A0B0"
  );
}

function logOutcome() {
  if (state.status === "won") {
    console.log(
      `%c${SERVICE_NAME}%c WIN — ${formatSubscribers(audienceOf(state))} subscribers on day ${state.day}. Final cash ${formatCash(state.cash)}.`,
      "color:#E50914;font-weight:700",
      "color:#2ECC71;font-weight:700"
    );
    return;
  }
  if (state.status === "lost") {
    console.log(
      `%c${SERVICE_NAME}%c LOSE — cash stayed below ${formatCash(LOSE_CASH)} for ${LOSE_STREAK_DAYS} days. ` +
        `Day ${state.day}, cash ${formatCash(state.cash)}, subscribers ${formatSubscribers(audienceOf(state))}.`,
      "color:#E50914;font-weight:700",
      "color:#FF4D4F;font-weight:700"
    );
  }
}

function rememberAudience(total) {
  history.push(Math.round(total));
  if (history.length > MAX_HISTORY) history.shift();
}

function checkMilestones(total) {
  MILESTONES.forEach((milestone) => {
    if (milestone.win || total < milestone.at || milestonesSeen.has(milestone.id)) return;
    milestonesSeen.add(milestone.id);
    milestoneQueue.push(milestone);
    pushEvent(state.day, [{ text: `Reached ${milestone.name}.`, tone: "up" }]);
  });
  if (state.status === "won") milestonesSeen.add("global");
}

/**
 * Advance one in-game day. Pass { log: false } to skip the console line.
 */
function tick(options) {
  const shouldLog = !options || options.log !== false;
  if (state.status !== "playing") return snapshot();

  const before = snapshot();
  state.subscribers = roundSubscribers(Math.max(0, state.subscribers + before.netPaid));
  state.freeUsers = roundSubscribers(Math.max(0, (state.freeUsers || 0) + before.netFree));
  state.cash = roundCents(state.cash + before.netCash);
  state.day += 1;

  if (state.cash < LOSE_CASH) state.daysBelowLoseLine += 1;
  else state.daysBelowLoseLine = 0;

  const audience = audienceOf(state);
  if (audience >= WIN_SUBSCRIBERS) state.status = "won";
  else if (state.daysBelowLoseLine >= LOSE_STREAK_DAYS) state.status = "lost";

  rememberAudience(audience);
  checkMilestones(audience);

  const after = snapshot();
  if (shouldLog) logDay(before, after);
  renderTick(before, after);
  if (state.status !== "playing") {
    stop();
    if (shouldLog) logOutcome();
    saveGame();
  }
  return after;
}

function start() {
  if (timerId !== null || state.status !== "playing") return;
  timerId = setInterval(tick, TICK_MS);
}

function stop() {
  if (timerId === null) return;
  clearInterval(timerId);
  timerId = null;
}

function resetProgress() {
  state = createInitialState();
  owned = emptyOwned();
  library = [];
  history = [STARTING_SUBSCRIBERS];
  milestonesSeen = new Set();
  milestoneQueue = [];
  uiEvents = [openingEvent()];
}

function reset() {
  stop();
  resetProgress();
  clearSave();
  logIntro();
  resetUi();
  saveGame();
  start();
  return snapshot();
}

function warnNumber(label) {
  console.warn(`${SERVICE_NAME}: ${label} must be a finite number.`);
}

function setMonthlyPrice(price, options) {
  const next = Number(price);
  if (!Number.isFinite(next)) {
    warnNumber("monthly price");
    return state.monthlyPrice;
  }
  state.monthlyPrice = clamp(roundCents(next), MIN_MONTHLY_PRICE, MAX_MONTHLY_PRICE);
  const view = snapshot();
  syncView();
  if (!options || !options.quiet) {
    console.log(
      `%c${SERVICE_NAME}%c Monthly price set to ${formatPrice(state.monthlyPrice)}. Growth: ${view.growthLabel} / Churn: ${view.churnLabel}.`,
      "color:#E50914;font-weight:700",
      "color:#A0A0B0"
    );
  }
  return state.monthlyPrice;
}

function setContentQuality(quality) {
  const next = Number(quality);
  if (!Number.isFinite(next)) {
    warnNumber("content quality");
    return state.contentQuality;
  }
  state.contentQuality = Math.max(0, next);
  syncView();
  return state.contentQuality;
}

function setMarketingMultiplier(multiplier) {
  const next = Number(multiplier);
  if (!Number.isFinite(next)) {
    warnNumber("marketing multiplier");
    return state.marketingMultiplier;
  }
  state.marketingMultiplier = Math.max(0, next);
  syncView();
  return state.marketingMultiplier;
}

function setContentUpkeep(upkeep) {
  const next = Number(upkeep);
  if (!Number.isFinite(next)) {
    warnNumber("content upkeep");
    return state.contentUpkeep;
  }
  state.contentUpkeep = Math.max(0, roundCents(next));
  syncView();
  return state.contentUpkeep;
}

function nextTitle(id, count) {
  const pool = TITLE_POOLS[id] || [["Untitled", "Original"]];
  const index = count - 1;
  const base = pool[index % pool.length];
  const cycle = Math.floor(index / pool.length);
  const title = cycle === 0 ? base[0] : `${base[0]} ${cycle + 1}`;
  return { title, genre: base[1], upgradeId: id };
}

function buyUpgrade(id) {
  const upgrade = upgradeById(id);
  if (!upgrade || state.status !== "playing") return false;
  const count = ownedCount(id);
  const cost = upgradeCost(upgrade, count);
  if (state.cash < cost) return false;

  state.cash = roundCents(state.cash - cost);
  owned[id] = count + 1;
  applyUpgradeEffects();
  if (TITLE_POOLS[id]) library.push(nextTitle(id, owned[id]));
  pushEvent(state.day, [{ text: upgrade.event, tone: "neutral" }]);
  if (hasUi()) {
    flashStat("cash-value", -1);
    showDelta("cash-delta", formatSignedMoney(-cost), "down");
    renderLibrary(true);
  }
  syncView();
  saveGame();
  return true;
}

function serialize() {
  return {
    version: 1,
    state: { ...state },
    owned: { ...owned },
    library,
    history,
    milestones: [...milestonesSeen],
    events: uiEvents,
  };
}

function saveGame() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize()));
  } catch (err) {
    // Ignore a full or blocked store. The run still continues.
  }
}

function clearSave() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    // Ignore.
  }
}

function loadGame() {
  if (typeof localStorage === "undefined") return false;
  let data;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    data = JSON.parse(raw);
  } catch (err) {
    return false;
  }
  if (!data || data.version !== 1 || !data.state) return false;
  if (!Number.isFinite(data.state.cash) || !Number.isFinite(data.state.subscribers)) return false;

  state = { ...createInitialState(), ...data.state };
  state.freeUsers = Number.isFinite(state.freeUsers) ? state.freeUsers : 0;
  owned = { ...emptyOwned(), ...(data.owned || {}) };
  applyUpgradeEffects();
  library = Array.isArray(data.library) ? data.library : [];
  history = Array.isArray(data.history) && data.history.length ? data.history.slice(-MAX_HISTORY) : [audienceOf(state)];
  milestonesSeen = new Set(Array.isArray(data.milestones) ? data.milestones : []);
  MILESTONES.forEach((milestone) => {
    if (audienceOf(state) >= milestone.at) milestonesSeen.add(milestone.id);
  });
  milestoneQueue = [];
  uiEvents = Array.isArray(data.events) && data.events.length ? data.events.slice(0, MAX_LOG_ENTRIES) : [openingEvent()];
  sessionLoaded = true;
  return true;
}

function startAutosave() {
  if (saveTimer !== null || typeof localStorage === "undefined") return;
  saveTimer = setInterval(saveGame, SAVE_EVERY_MS);
}

const api = {
  SERVICE_NAME,
  MIN_MONTHLY_PRICE,
  MAX_MONTHLY_PRICE,
  WIN_SUBSCRIBERS,
  LOSE_CASH,
  LOSE_STREAK_DAYS,
  UPGRADES,
  getState: snapshot,
  setMonthlyPrice,
  setContentQuality,
  setMarketingMultiplier,
  setContentUpkeep,
  buyUpgrade,
  upgradeCost,
  tick,
  start,
  stop,
  reset,
  saveGame,
  loadGame,
  priceAttractiveness,
  churnRate,
  subscriberGrowth,
  dailyRevenue,
  dailyCosts,
  formatCash,
  formatSubscribers,
};

globalThis.StreamCo = api;

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

const animators = new Map();
const deltaTimers = new Map();
let uiEvents = [openingEvent()];
let uiBound = false;
let animationGeneration = 0;

function hasUi() {
  return typeof document !== "undefined" && !!document.getElementById("cash-value");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
  return el;
}

function tierName(subscribers) {
  if (subscribers >= 1000000) return "Global Giant";
  if (subscribers >= 100000) return "National Contender";
  if (subscribers >= 10000) return "Regional Streamer";
  if (subscribers >= 1000) return "Local Player";
  return "New Service";
}

function formatQuality(quality) {
  return Number.isInteger(quality) ? String(quality) : quality.toFixed(1);
}

function formatMoneyPrecise(amount) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paintSlider(price) {
  const slider = document.getElementById("price-slider");
  if (!slider) return;
  if (document.activeElement !== slider) slider.value = String(price);
  const current = Number(slider.value);
  const pct = ((current - MIN_MONTHLY_PRICE) / (MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE)) * 100;
  slider.style.setProperty("--fill", `${pct}%`);
}

function paint(view) {
  document.querySelectorAll(".js-service-name").forEach((el) => {
    el.textContent = SERVICE_NAME;
  });
  document.title = SERVICE_NAME;

  const cashEl = setText("cash-value", formatCash(view.cash));
  if (cashEl) cashEl.classList.toggle("is-negative", view.cash < 0);
  setText("subs-value", formatSubscribers(view.audience));
  setText("day-value", view.day.toLocaleString("en-US"));
  setText("price-value", formatPrice(view.monthlyPrice));
  setText("price-outlook", `Growth: ${view.growthLabel} / Churn: ${view.churnLabel}`);
  paintSlider(view.monthlyPrice);
  setText("tier-name", tierName(view.audience));
  setText("quality-value", formatQuality(view.contentQuality));
  setText("revenue-value", formatMoneyPrecise(view.dailyRevenue));
  setText("costs-value", formatMoneyPrecise(view.dailyCosts));

  const churnBits = `${(view.churnRate * 100).toFixed(2)}% · ${view.churnLabel}`;
  setText("churn-value", view.bufferingChurn >= 0.001 ? `${churnBits} · buffering` : churnBits);

  const split = document.getElementById("audience-split");
  if (split) {
    const showSplit = view.freeUsers > 0 || ownedCount("free-tier") > 0;
    split.hidden = !showSplit;
    split.textContent = showSplit
      ? `Paid ${formatSubscribers(view.subscribers)} · Free ${formatSubscribers(view.freeUsers)}`
      : "";
  }

  updateUpgradeCards(view);
  showEndScreen();
}

function updateUpgradeCards(view) {
  UPGRADES.forEach((upgrade) => {
    const card = document.querySelector(`[data-upgrade="${upgrade.id}"]`);
    if (!card) return;
    const count = ownedCount(upgrade.id);
    const cost = upgradeCost(upgrade, count);
    const affordable = view.status === "playing" && view.cash >= cost;
    card.classList.toggle("is-unaffordable", !affordable);
    const costEl = card.querySelector(".upgrade-cost");
    if (costEl) costEl.textContent = formatCash(cost);
    const badge = card.querySelector(".owned-badge");
    if (badge) {
      badge.hidden = count <= 0;
      badge.textContent = `x${count}`;
    }
    const button = card.querySelector(".buy-button");
    if (button) {
      button.disabled = !affordable;
      button.setAttribute("aria-label", `Buy ${upgrade.name} for ${formatCash(cost)}`);
    }
  });
}

function animateValue(id, from, to, render) {
  const el = document.getElementById(id);
  if (!el) return;
  const previous = animators.get(id);
  if (previous) cancelAnimationFrame(previous);

  if (prefersReducedMotion() || from === to) {
    render(el, to);
    return;
  }

  const generation = animationGeneration;
  const duration = 180;
  const start = performance.now();

  function frame(now) {
    if (generation !== animationGeneration) return;
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    render(el, from + (to - from) * eased);
    if (generation !== animationGeneration) return;
    if (t < 1) animators.set(id, requestAnimationFrame(frame));
    else animators.delete(id);
  }

  animators.set(id, requestAnimationFrame(frame));
}

function renderCash(el, value) {
  el.textContent = formatCash(value);
  el.classList.toggle("is-negative", value < 0);
}

function renderSubscribers(el, value) {
  el.textContent = formatSubscribers(value);
}

function flashStat(id, direction) {
  const el = document.getElementById(id);
  if (!el || direction === 0) return;
  el.classList.remove("flash-up", "flash-down");
  void el.offsetWidth;
  el.classList.add(direction > 0 ? "flash-up" : "flash-down");
  window.setTimeout(() => {
    el.classList.remove("flash-up", "flash-down");
  }, 700);
}

function showDelta(id, text, tone) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("up", "down");
  if (tone) el.classList.add(tone);
  const existing = deltaTimers.get(id);
  if (existing) window.clearTimeout(existing);
  deltaTimers.set(id, window.setTimeout(() => {
    el.textContent = "";
    el.classList.remove("up", "down");
    deltaTimers.delete(id);
  }, 900));
}

function renderLog() {
  if (typeof document === "undefined") return;
  const list = document.getElementById("event-log");
  if (!list) return;
  const stickToTop = list.scrollTop < 8;
  list.replaceChildren();
  uiEvents.forEach((event) => {
    const item = document.createElement("li");
    const day = document.createElement("span");
    day.className = "log-day";
    day.textContent = `Day ${event.day}: `;
    item.append(day);
    event.parts.forEach((part) => {
      const span = document.createElement("span");
      span.className = `log-part ${part.tone || "neutral"}`;
      span.textContent = part.text;
      item.append(span);
    });
    list.append(item);
  });
  if (stickToTop) list.scrollTop = 0;
}

function pushEvent(day, parts) {
  uiEvents.unshift({ day, parts });
  if (uiEvents.length > MAX_LOG_ENTRIES) uiEvents.length = MAX_LOG_ENTRIES;
  renderLog();
}

function openingEvent() {
  return {
    day: 0,
    parts: [{
      text: `${SERVICE_NAME} is open. ${formatSubscribers(STARTING_SUBSCRIBERS)} subscribers, ${formatCash(STARTING_CASH)} cash.`,
      tone: "neutral",
    }],
  };
}

function syncView() {
  if (!hasUi()) return;
  paint(snapshot());
  drawChart();
}

function renderTick(before, after) {
  if (!hasUi()) return;
  paint(after);

  const cashEl = document.getElementById("cash-value");
  const subsEl = document.getElementById("subs-value");
  if (cashEl) renderCash(cashEl, before.cash);
  if (subsEl) renderSubscribers(subsEl, before.audience);

  animateValue("cash-value", before.cash, after.cash, renderCash);
  animateValue("subs-value", before.audience, after.audience, renderSubscribers);
  flashStat("cash-value", after.cash - before.cash);
  flashStat("subs-value", after.audience - before.audience);

  if (before.netCash !== 0) {
    showDelta("cash-delta", formatSignedMoney(before.netCash), before.netCash > 0 ? "up" : "down");
  }
  if (before.netAudience !== 0) {
    showDelta(
      "subs-delta",
      formatSignedNumber(before.netAudience, 2),
      before.netAudience > 0 ? "up" : "down"
    );
  }

  const streak = after.daysBelowLoseLine;
  if (streak === 1 || streak === 10 || streak === 20) {
    pushEvent(after.day, [{
      text: `Debt streak ${streak}/${LOSE_STREAK_DAYS}. Cash is ${formatCash(after.cash)}.`,
      tone: "warn",
    }]);
  }
  if (after.status === "won") {
    pushEvent(after.day, [{ text: "Global Giant. A million subscribers.", tone: "up" }]);
  } else if (after.status === "lost") {
    pushEvent(after.day, [{ text: "The service closes.", tone: "down" }]);
  }

  showNextMilestone();
  drawChart();
}

function resetUi() {
  animationGeneration += 1;
  animators.forEach((frame) => cancelAnimationFrame(frame));
  animators.clear();
  deltaTimers.forEach((timer) => clearTimeout(timer));
  deltaTimers.clear();
  if (!Array.isArray(uiEvents) || uiEvents.length === 0) uiEvents = [openingEvent()];
  if (!hasUi()) return;
  paint(snapshot());
  renderLog();
  renderLibrary(false);
  drawChart();
  const cashDelta = document.getElementById("cash-delta");
  const subsDelta = document.getElementById("subs-delta");
  if (cashDelta) cashDelta.textContent = "";
  if (subsDelta) subsDelta.textContent = "";
  const modal = document.getElementById("milestone-modal");
  if (modal) modal.hidden = true;
}

function makeIcon(kind) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "22");
  svg.setAttribute("height", "22");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", ICONS[kind] || ICONS.sitcom);
  svg.append(path);
  return svg;
}

function renderUpgradeList() {
  const root = document.getElementById("upgrade-list");
  if (!root) return;
  root.replaceChildren();
  let section = null;
  let list = null;
  let group = "";
  UPGRADES.forEach((upgrade) => {
    if (upgrade.group !== group) {
      group = upgrade.group;
      section = document.createElement("section");
      section.className = "upgrade-section";
      const heading = document.createElement("h3");
      heading.className = "upgrade-group";
      heading.textContent = group;
      list = document.createElement("div");
      list.className = "upgrade-list";
      section.append(heading, list);
      root.append(section);
    }
    list.append(buildUpgradeCard(upgrade));
  });
  updateUpgradeCards(snapshot());
}

function buildUpgradeCard(upgrade) {
  const card = document.createElement("article");
  card.className = "upgrade-card";
  card.dataset.upgrade = upgrade.id;

  const icon = document.createElement("div");
  icon.className = "upgrade-icon";
  icon.append(makeIcon(upgrade.icon));

  const copy = document.createElement("div");
  const name = document.createElement("h4");
  name.className = "upgrade-name";
  name.textContent = upgrade.name;
  const effect = document.createElement("p");
  effect.className = "upgrade-effect";
  effect.textContent = upgrade.effect;
  copy.append(name, effect);

  const badge = document.createElement("span");
  badge.className = "owned-badge";
  badge.hidden = true;

  const meta = document.createElement("div");
  meta.className = "upgrade-meta";
  const cost = document.createElement("p");
  cost.className = "upgrade-cost";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "buy-button";
  button.textContent = "Buy";
  button.addEventListener("click", () => buyUpgrade(upgrade.id));
  meta.append(cost, button);

  card.append(icon, copy, badge, meta);
  return card;
}

function renderLibrary(animateNewest) {
  const root = document.getElementById("posters");
  const empty = document.getElementById("library-empty");
  if (!root) return;
  if (empty) empty.hidden = library.length > 0;
  root.replaceChildren();
  library.forEach((item, index) => {
    const tile = document.createElement("article");
    tile.className = index === library.length - 1 && animateNewest ? "poster is-new" : "poster";
    tile.style.background = GENRE_GRADIENTS[item.genre] || GENRE_GRADIENTS.Film;
    const title = document.createElement("p");
    title.className = "poster-title";
    title.textContent = item.title;
    const genre = document.createElement("p");
    genre.className = "poster-genre";
    genre.textContent = item.genre;
    tile.append(title, genre);
    root.append(tile);
  });
  const empties = Math.max(0, 4 - library.length);
  for (let i = 0; i < empties; i += 1) {
    const slot = document.createElement("div");
    slot.className = "poster-empty";
    root.append(slot);
  }
}

function drawChart() {
  const canvas = document.getElementById("subscriber-chart");
  if (!canvas || typeof canvas.getContext !== "function") return;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const series = history.length ? history : [STARTING_SUBSCRIBERS];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const pad = 10;
  const points = series.map((value, index) => {
    const x = series.length === 1 ? width / 2 : pad + (index / (series.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / span) * (height - pad * 2);
    return [x, y];
  });

  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(points[points.length - 1][0], height - 1);
  ctx.lineTo(points[0][0], height - 1);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, pad, 0, height);
  gradient.addColorStop(0, "rgba(229, 9, 20, 0.38)");
  gradient.addColorStop(1, "rgba(229, 9, 20, 0)");
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#E50914";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function showNextMilestone() {
  const modal = document.getElementById("milestone-modal");
  if (!modal || !modal.hidden || state.status !== "playing") return;
  const next = milestoneQueue.shift();
  if (!next) return;
  setText("milestone-title", next.name);
  setText("milestone-line", next.line);
  modal.hidden = false;
  const button = document.getElementById("milestone-continue");
  if (button) button.focus();
}

function continueMilestone() {
  const modal = document.getElementById("milestone-modal");
  if (modal) modal.hidden = true;
  showNextMilestone();
  saveGame();
}

function fillEndStats(id) {
  const root = document.getElementById(id);
  if (!root) return;
  const view = snapshot();
  const rows = [
    ["Day", view.day.toLocaleString("en-US"), false],
    ["Subscribers", formatSubscribers(view.audience), false],
    ["Cash", formatCash(view.cash), view.cash < 0],
    ["Quality", formatQuality(view.contentQuality), false],
  ];
  root.replaceChildren();
  rows.forEach(([label, value, negative]) => {
    const wrap = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    if (negative) detail.className = "is-negative";
    wrap.append(term, detail);
    root.append(wrap);
  });
}

function showEndScreen() {
  const win = document.getElementById("win-screen");
  const lose = document.getElementById("lose-screen");
  if (!win || !lose) return;
  if (state.status === "won") {
    const modal = document.getElementById("milestone-modal");
    if (modal) modal.hidden = true;
    lose.hidden = true;
    fillEndStats("win-stats");
    win.hidden = false;
    return;
  }
  if (state.status === "lost") {
    const modal = document.getElementById("milestone-modal");
    if (modal) modal.hidden = true;
    win.hidden = true;
    fillEndStats("lose-stats");
    lose.hidden = false;
    return;
  }
  win.hidden = true;
  lose.hidden = true;
}

function bindUi() {
  if (uiBound) return;
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmed = window.confirm(`Reset ${SERVICE_NAME}? The current run will be lost.`);
      if (confirmed) reset();
    });
  }
  const slider = document.getElementById("price-slider");
  if (slider) {
    slider.addEventListener("input", () => setMonthlyPrice(slider.value, { quiet: true }));
    slider.addEventListener("change", saveGame);
  }
  const continueButton = document.getElementById("milestone-continue");
  if (continueButton) continueButton.addEventListener("click", continueMilestone);
  ["win-again", "lose-again"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.addEventListener("click", reset);
  });
  document.addEventListener("keydown", (event) => {
    const modal = document.getElementById("milestone-modal");
    if (event.key === "Escape" && modal && !modal.hidden) continueMilestone();
  });
  const chart = document.getElementById("subscriber-chart");
  if (chart && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(chart);
  }
  window.addEventListener("pagehide", saveGame);
  uiBound = true;
}

function mountUi() {
  if (!hasUi()) return;
  bindUi();
  renderUpgradeList();
  if (!sessionLoaded) uiEvents = [openingEvent()];
  resetUi();
}

if (typeof document !== "undefined") {
  const loaded = loadGame();
  document.title = SERVICE_NAME;
  mountUi();
  if (!loaded) logIntro();
  start();
  startAutosave();
}
