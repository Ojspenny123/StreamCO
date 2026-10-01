"use strict";

/**
 * StreamCo. Change the service name here only.
 * New events belong in the EVENTS array. New trophies belong in ACHIEVEMENTS.
 */
const SERVICE_NAME = "StreamCo";

const STARTING_SUBSCRIBERS = 100;
const STARTING_MONTHLY_PRICE = 5;
const MIN_MONTHLY_PRICE = 2;
const MAX_MONTHLY_PRICE = 20;
const SAVE_EVERY_MS = 10000;
const SAVE_KEY = "streamco-save-v2";
const SAVE_KEY_V1 = "streamco-save-v1";
const SCORE_KEY = "streamco-scores-v1";
const SETTINGS_KEY = "streamco-settings-v1";
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

const CONFIG = (typeof window !== "undefined" && window.STREAMCO_CONFIG)
  || (typeof require === "function" ? require("./config.js") : {});

const DIFFICULTIES = CONFIG.difficulties;

const GENRES = ["Comedy", "Drama", "Sport", "Kids", "Documentary", "Reality"];

const TITLE_NAMES = {
  Comedy: ["Apartment 4B", "Desk Job", "The Group Chat", "Sunday Roast", "Neighbours Upstairs"],
  Drama: ["Crown of Salt", "The Long Winter", "Northline", "Glass House", "Meridian"],
  Sport: ["Matchday", "Prime Kickoff", "Final Whistle", "Home Advantage", "Extra Time"],
  Kids: ["Button Moon Club", "The Pencil Pirates", "Tiny Trains", "Waffle World", "Star Cub"],
  Documentary: ["Afterlight", "Harbour Street", "Cold Open", "Paper Moons", "The Last Reel"],
  Reality: ["House Share", "The Golden Table", "Island Votes", "Makeover Monday", "Blind Booking"],
};

const GENRE_GRADIENTS = {
  Comedy: "linear-gradient(165deg, #E50914, #5C1020)",
  Drama: "linear-gradient(165deg, #8C2C55, #1A1018)",
  Sport: "linear-gradient(165deg, #1C8A4A, #102418)",
  Kids: "linear-gradient(165deg, #F5A623, #6A3A10)",
  Documentary: "linear-gradient(165deg, #3150C8, #141428)",
  Reality: "linear-gradient(165deg, #C46BFF, #2A1840)",
};

const BUDGETS = {
  low: { id: "low", name: "Low", cost: 1800, days: 5, quality: 1, upkeep: 18, hit: 0.15, flop: 0.2 },
  standard: { id: "standard", name: "Standard", cost: 4500, days: 10, quality: 2.2, upkeep: 48, hit: 0.25, flop: 0.1 },
  premium: { id: "premium", name: "Premium", cost: 12000, days: 20, quality: 4.5, upkeep: 140, hit: 0.4, flop: 0.05 },
};

const LICENSES = {
  movies: { id: "movies", name: "Movie library", genre: "Documentary", title: "The Vault Catalogue", cost: 5000, days: 180, quality: 2.4, upkeep: 55 },
  sports: { id: "sports", name: "Sports rights", genre: "Sport", title: "Live Fixture Pack", cost: 50000, days: 90, quality: 1.4, upkeep: 420, marketing: 0.8 },
  football: { id: "football", name: "Football Package", genre: "Sport", title: "Football Package", cost: 24000, days: 90, quality: 1.7, upkeep: 210, marketing: 0.28 },
  basketball: { id: "basketball", name: "Basketball Package", genre: "Sport", title: "Basketball Package", cost: 20000, days: 90, quality: 1.5, upkeep: 180, marketing: 0.22 },
  tennis: { id: "tennis", name: "Tennis Package", genre: "Sport", title: "Tennis Package", cost: 14000, days: 90, quality: 1.2, upkeep: 120, marketing: 0.12 },
  motorsport: { id: "motorsport", name: "Motorsport Package", genre: "Sport", title: "Motorsport Package", cost: 26000, days: 90, quality: 1.6, upkeep: 200, marketing: 0.24 },
};
if (CONFIG.sports) {
  Object.keys(CONFIG.sports).forEach((id) => {
    LICENSES[id] = Object.assign({ id, marketing: 0.2 }, CONFIG.sports[id]);
  });
}
(CONFIG.moviePacks || []).forEach((pack) => {
  LICENSES[pack.id] = Object.assign({ id: pack.id, marketing: 0 }, pack);
});

const REGIONS = [
  { id: "uk", name: "United Kingdom", tam: 4200000, tolerance: 1, favourite: "Comedy", unlock: 0, localise: 0, rival: "flixora", color: "#E50914" },
  { id: "europe", name: "Europe", tam: 9000000, tolerance: 0.92, favourite: "Drama", unlock: 28000, localise: 12000, rival: "primetime", color: "#4C6FFF" },
  { id: "na", name: "North America", tam: 16000000, tolerance: 1.2, favourite: "Reality", unlock: 52000, localise: 18000, rival: "streamly", color: "#F5A623" },
  { id: "apac", name: "Asia-Pacific", tam: 14000000, tolerance: 0.78, favourite: "Kids", unlock: 64000, localise: 18000, rival: "cinebox", color: "#2ECC71" },
  { id: "latam", name: "Latin America", tam: 8000000, tolerance: 0.72, favourite: "Sport", unlock: 36000, localise: 14000, rival: null, localName: "Onda Max", color: "#C46BFF" },
];

(CONFIG.regions || []).forEach((patch) => {
  const region = REGIONS.find((item) => item.id === patch.id);
  if (!region) return;
  ["tam", "tolerance", "unlock", "localise"].forEach((key) => {
    if (patch[key] != null) region[key] = patch[key];
  });
});
if (CONFIG.budgets) {
  Object.keys(CONFIG.budgets).forEach((id) => {
    if (BUDGETS[id]) Object.assign(BUDGETS[id], CONFIG.budgets[id]);
  });
}

const RIVAL_ROSTER = [
  { id: "flixora", name: "Flixora", color: "#FF6B4A", personality: "aggressive", blurb: "Undercuts on price and spends heavily on ads.", price: 4, quality: 2.4, marketing: 1.45, brand: 46, subscribers: 180 },
  { id: "primetime", name: "PrimeTime+", color: "#4C6FFF", personality: "steady", blurb: "Slow, expensive, and always commissioning.", price: 8, quality: 3.4, marketing: 1.15, brand: 58, subscribers: 220 },
  { id: "streamly", name: "Streamly", color: "#2ECC71", personality: "chaotic", blurb: "Brilliant one month and a mess the next.", price: 5, quality: 2.2, marketing: 1.25, brand: 50, subscribers: 150 },
  { id: "cinebox", name: "Cinebox", color: "#F5A623", personality: "premium", blurb: "Fewer subscribers, very proud of the catalogue.", price: 12, quality: 4.2, marketing: 1.05, brand: 62, subscribers: 130 },
];

const UPGRADES = [
  { id: "commission", group: "Content", name: "Content desk", effect: "Acquire a title or create an original", action: "commission", icon: "sitcom" },
  { id: "movies", group: "Content", name: "Movie library", effect: "A different film bundle each time", action: "library", icon: "movies" },
  { id: "expand", group: "Content", name: "Expand library", effect: "+4 title slots", cost: (CONFIG.library && CONFIG.library.expandCost) || 12000, icon: "movies", event: "The library has more room." },
  { id: "football", group: "Content", name: "Football Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "basketball", group: "Content", name: "Basketball Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "tennis", group: "Content", name: "Tennis Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "motorsport", group: "Content", name: "Motorsport Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "cricket", group: "Content", name: "Cricket Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "combat", group: "Content", name: "Combat Sports Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "rugby", group: "Content", name: "Rugby Package", effect: "90-day sports deal", action: "license", icon: "sports" },
  { id: "social", group: "Growth", name: "Social media campaign", effect: "+10% growth", cost: 2500, marketing: 0.1, icon: "social", event: "The social campaign is picking up shares." },
  { id: "tv", group: "Growth", name: "TV advertising", effect: "+25% growth", cost: 8000, marketing: 0.25, icon: "tv", event: "The TV spot is on the air." },
  { id: "app", group: "Growth", name: "Mobile app", effect: "+15% growth", cost: 12000, marketing: 0.15, icon: "app", event: "The mobile app is in people's pockets." },
  { id: "recommendations", group: "Retention", name: "Better recommendations", effect: "-10% churn", cost: 4000, icon: "recs", event: "Recommendations are keeping people watching." },
  { id: "free-tier", group: "Retention", name: "Free ad-supported tier", effect: "+growth, small revenue per free user", cost: 6000, marketing: 0.12, icon: "free", event: "The free tier is open." },
  { id: "servers", group: "Platform", name: "Faster servers", effect: "Halves the buffering churn penalty", cost: 9000, icon: "servers", event: "Faster servers cleared the buffering." },
];

const MILESTONES = [
  { id: "local", at: 1000, name: "Local Player", line: "A thousand people pressed play." },
  { id: "regional", at: 10000, name: "Regional Streamer", line: "Your catalogue is the talk of the region." },
  { id: "national", at: 100000, name: "National Contender", line: "The whole country is watching." },
  { id: "global", at: 1000000, name: "Global Contender", line: "A million subscribers. The world is watching." },
  { id: "leader", at: 5000000, name: "Industry Leader", line: "Five million subscribers. The industry is taking notes." },
];

const ICONS = {
  sitcom: "M4 5h16v11H4V5zm2 13h12v2H6v-2z",
  movies: "M6 3h2v3H6V3zm4 0h2v3h-2V3zm4 0h2v3h-2V3zM4 8h16v13H4V8z",
  sports: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14z",
  social: "M8 11a3 3 0 110-6 3 3 0 010 6zm9 .5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM3 18.5V17c0-2 2-3.5 5-3.5s5 1.5 5 3.5v1.5H3zm11 .5v-1.4c0-.5.1-1 .4-1.4 1.4-.7 3.6-1.2 5.1-1.2 2.4 0 3.5 1.2 3.5 2.6V19h-9z",
  tv: "M3 6h18v11H3V6zm7 13h4v2h-4v-2z",
  app: "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zm1 2v14h6V4H9zm2 15h2v1h-2v-1z",
  recs: "M4 5h16v2H4V5zm0 6h10v2H4v-2zm0 6h12v2H4v-2zm13-7l4 3-4 3v-6z",
  free: "M12 3l8 4v2H4V7l8-4zM4 11h16v9H4v-9zm3 2v5h3v-5H7z",
  servers: "M3 3h18v6H3V3zm2 2v2h3V5H5zm0 8v2h3v-2H5zM3 11h18v6H3v-6z",
};

const TUTORIAL = [
  { selector: "#price-slider", text: "Price changes growth and churn. Cheap grows fast and can lose money. Raise it gradually." },
  { selector: ".upgrades", text: "The content desk acquires real titles or builds originals. Sports packages are contracts." },
  { selector: "#cash-value", text: "You can buy on credit up to the limit. Interest is charged every day the balance is negative." },
  { selector: "#posters", text: "The library shows productions and titles. Click a tile for scores, cast, freshness, and the contract." },
  { selector: ".event-log", text: "Newest news sits at the top. Filter it when money, events, and rivals start talking over each other." },
];

let rng = Math.random;
let titleSerial = 1;
let state = null;
let owned = null;
let titles = [];
let rivals = [];
let effects = [];
let analytics = [];
let history = [STARTING_SUBSCRIBERS];
let milestonesSeen = new Set();
let achievements = new Set();
let qualityOverride = null;
let marketingOverride = null;
let upkeepOverride = null;
let timerId = null;
let lastClockNow = 0;
let dayFraction = 0;
let glide = null;
let saveTimer = null;
let simOffline = false;
let offlineNotes = [];
let blocking = false;
let welcomeHold = false;
let menuDepth = 0;
let promptQueue = [];
let activeEvent = null;
let pendingRenewId = null;
let logFilter = "all";
let currentTab = "home";
let tableSort = { key: "revenue", dir: -1 };
let libraryFilter = "all";
let librarySort = "newest";
let tutorialIndex = -1;
let settings = { animations: true, tutorialDismissed: false, skipGuide: false };
let draft = { difficulty: "normal", sandbox: false, name: "" };
let guideMode = "new";
let guidePage = 0;
let guideOpen = false;
let catalogueReady = true;
let cataloguePromise = null;
let wasPausedBeforeGuide = false;
let uiEvents = [];
let uiBound = false;
let animationGeneration = 0;
const animators = new Map();
const deltaTimers = new Map();
const pendingRenew = new Set();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function random() {
  return rng();
}

function rollInt(span) {
  return Math.floor(random() * span);
}

function roundCents(value) {
  return Math.round(value * 100) / 100;
}

function roundSubscribers(value) {
  return Math.round(value * 10000) / 10000;
}

function difficulty() {
  const base = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
  if (state && state.sandbox && base.events !== false) {
    return Object.assign({}, base, { events: false, canLose: false, name: `${base.name} · Sandbox` });
  }
  return base;
}

function displayName() {
  const name = state && typeof state.serviceName === "string" ? state.serviceName.trim() : "";
  return name || SERVICE_NAME;
}

function regionDef(id) {
  return REGIONS.find((region) => region.id === id);
}

function upgradeById(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id) || null;
}

function ownedCount(id) {
  return owned[id] || 0;
}

function emptyOwned() {
  const counts = {};
  UPGRADES.forEach((upgrade) => {
    if (!upgrade.action) counts[upgrade.id] = 0;
  });
  return counts;
}

function defaultTrends() {
  const trends = {};
  GENRES.forEach((genre) => {
    trends[genre] = 1;
  });
  return trends;
}

function createRegions() {
  const regions = {};
  REGIONS.forEach((def) => {
    regions[def.id] = {
      unlocked: def.id === "uk",
      localised: def.id === "uk",
      subscribers: def.id === "uk" ? STARTING_SUBSCRIBERS : 0,
      tam: def.tam,
    };
  });
  return regions;
}

function createRivals(diff) {
  return RIVAL_ROSTER.slice(0, diff.rivals).map((template, index) => {
    const subscribers = Math.round(template.subscribers * diff.rivalStrength);
    return {
      id: template.id,
      name: template.name,
      color: template.color,
      personality: template.personality,
      blurb: template.blurb,
      price: template.price,
      quality: template.quality,
      marketing: template.marketing,
      brand: template.brand,
      subscribers,
      nextAction: 18 + index * 6 + rollInt(8),
      history: [subscribers],
    };
  });
}

function createInitialState(difficultyId) {
  const diff = DIFFICULTIES[difficultyId] || DIFFICULTIES.normal;
  return {
    day: 0,
    cash: diff.cash,
    subscribers: STARTING_SUBSCRIBERS,
    freeUsers: 0,
    monthlyPrice: STARTING_MONTHLY_PRICE,
    daysBelowLoseLine: 0,
    status: "playing",
    brand: 50,
    difficulty: diff.id,
    speed: 1,
    paused: false,
    revenueShare: 0,
    marketingPenalty: 0,
    regions: createRegions(),
    genreTrends: defaultTrends(),
    licenseGeneration: { movies: 0, sports: 0 },
    nextEventDay: diff.events ? diff.eventMin + rollInt(diff.eventSpan) : Infinity,
    lastEventDay: -100,
    recentEvents: [],
    eventDays: [],
    hitCount: 0,
    flopCount: 0,
    releaseCount: 0,
    sawNegativeCash: false,
    sawDeepRed: false,
    rejectedBuyout: false,
    survivedPriceWar: false,
    beatRival: false,
    sportsSigned: false,
    scoreSaved: false,
    serviceName: SERVICE_NAME,
    sandbox: false,
    profitHistory: [],
    profitableStreak: 0,
    sweetStreak: 0,
    empireHold: 0,
    explainedDebt: false,
    boughtOnCredit: false,
    debtRepaid: 0,
    highCreditDays: 0,
    creditWarned: false,
    creditBonus: 0,
    touchedHighCredit: false,
    priceHikeDays: 0,
    priceAnchor: STARTING_MONTHLY_PRICE,
    adTier: false,
    trendsSeeded: false,
    localHits: {},
    risingStarHit: false,
    criticsDarling: false,
    aListCast: 0,
    savedAt: Date.now(),
  };
}

function resetProgress(difficultyId) {
  state = createInitialState(difficultyId);
  owned = emptyOwned();
  titles = [];
  rivals = createRivals(difficulty());
  effects = [];
  analytics = [];
  history = [STARTING_SUBSCRIBERS];
  milestonesSeen = new Set();
  achievements = new Set();
  qualityOverride = null;
  marketingOverride = null;
  upkeepOverride = null;
  titleSerial = 1;
  pendingRenew.clear();
  promptQueue = [];
  activeEvent = null;
  pendingRenewId = null;
  blocking = false;
  uiEvents = [openingEvent()];
}

function paidSubscribers() {
  return REGIONS.reduce((sum, def) => sum + (state.regions[def.id].subscribers || 0), 0);
}

function totalTam() {
  return REGIONS.reduce((sum, def) => {
    const region = state.regions[def.id];
    return region.unlocked ? sum + region.tam : sum;
  }, 0);
}

function freshnessOf(title) {
  if (title.status !== "released") return 1;
  const rules = econ();
  const span = (rules.freshnessDays || 120) * (title.outcome === "darling" ? 1.45 : 1);
  const age = Math.max(0, state.day - (title.releaseDay || 0));
  return clamp(1 - age / span, rules.freshnessFloor || 0.2, 1);
}

function titleContribution(title) {
  if (title.status !== "released") return 0;
  if (title.kind === "licensed" && title.contractDays <= 0) return 0;
  const trend = state.genreTrends[title.genre] || 1;
  return (title.quality || 0) * freshnessOf(title) * trend;
}

function releasedGenres() {
  const genres = new Set();
  titles.forEach((title) => {
    if (titleContribution(title) > 0) genres.add(title.genre);
  });
  return genres;
}

function diminishFactor(index, table) {
  const list = table && table.length ? table : [1, 0.8, 0.65, 0.5, 0.4, 0.32];
  if (index < list.length) return list[index];
  return list[list.length - 1] * Math.pow(0.85, index - list.length + 1);
}

function currentQuality() {
  if (qualityOverride != null) return qualityOverride;
  const rules = econ();
  const groups = {};
  titles.forEach((title) => {
    const value = titleContribution(title);
    if (!value) return;
    const key = title.genre || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(value);
  });
  let quality = 1;
  Object.keys(groups).forEach((key) => {
    const table = key === "Sport" ? (rules.sportsDiminish || rules.diminish) : rules.diminish;
    groups[key].sort((a, b) => b - a);
    groups[key].forEach((value, index) => {
      quality += value * diminishFactor(index, table);
    });
  });
  const count = releasedGenres().size;
  if (count >= 5) quality *= rules.variety5 || 1.2;
  else if (count >= 3) quality *= rules.variety3 || 1.1;
  const damp = rules.qualityDamp || 1;
  return damp === 1 ? quality : Math.pow(Math.max(quality, 0.2), damp);
}

function varietyLabel() {
  const count = releasedGenres().size;
  if (count >= 5) return "Variety +20%";
  if (count >= 3) return "Variety +10%";
  return "";
}

function activeSports() {
  return titles.some((title) => title.genre === "Sport" && title.kind === "licensed" && title.status === "released" && title.contractDays > 0 && !effects.some((effect) => effect.sportsPause));
}

function currentMarketing() {
  if (marketingOverride != null) return marketingOverride;
  let marketing = 1 - (state.marketingPenalty || 0);
  UPGRADES.forEach((upgrade) => {
    if (upgrade.marketing) marketing += upgrade.marketing * ownedCount(upgrade.id);
  });
  if (!effects.some((effect) => effect.sportsPause)) {
    const boosts = [];
    titles.forEach((title) => {
      const license = title.licenseId && LICENSES[title.licenseId];
      if (license && license.marketing && title.status === "released" && title.contractDays > 0) boosts.push(license.marketing);
    });
    boosts.sort((a, b) => b - a);
    boosts.forEach((value, index) => {
      marketing += value * diminishFactor(index, econ().sportsDiminish);
    });
  }
  return Math.max(0.4, marketing);
}

function currentUpkeep() {
  if (upkeepOverride != null) return upkeepOverride;
  return titles.reduce((sum, title) => {
    if (title.status !== "released") return sum;
    if (title.kind === "licensed" && title.contractDays <= 0) return sum;
    return sum + (title.upkeep || 0);
  }, 0);
}

function serverLevel() {
  return ownedCount("servers") + (effects.some((effect) => effect.servers) ? 1 : 0);
}

function econ() {
  return CONFIG.economy || {};
}

function priceAttractiveness(monthlyPrice) {
  const rules = econ();
  return Math.pow((rules.anchorPrice || 8) / monthlyPrice, rules.pricePower || 0.85);
}

function churnRate(monthlyPrice, contentQuality, recommendationLevel = 0, serverLevelValue = 0) {
  const rules = econ();
  const span = MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE;
  const priceLift = Math.pow((monthlyPrice - MIN_MONTHLY_PRICE) / span, rules.churnPower || 1.45);
  const base = (rules.churnBase || 0.0016) + priceLift * (rules.churnPrice || 0.028);
  const qualityRelief = 1 / (1 + Math.max(0, contentQuality - 1) * (rules.qualityRelief || 0.18));
  const buffering = BUFFERING_CHURN * Math.pow(0.5, serverLevelValue);
  const hike = state && state.priceHikeDays > 0 ? (rules.hikeChurn || 0) : 0;
  const rate = (base * qualityRelief + buffering + hike) * Math.pow(0.9, recommendationLevel);
  return clamp(rate, 0.001, rules.churnCap || 0.09);
}

function baseGrowth(subscribers) {
  const rules = econ();
  return (rules.flatSignups || BASE_FLAT_SIGNUPS) + subscribers * (rules.organicRate || ORGANIC_SIGNUP_RATE);
}

function subscriberGrowth(subscribers, contentQuality, marketingMultiplier, monthlyPrice) {
  return baseGrowth(subscribers) * contentQuality * marketingMultiplier * priceAttractiveness(monthlyPrice);
}

function revenuePerSub(price) {
  const rules = econ();
  if (!state || !state.adTier) return price / 30;
  const mix = rules.adMix || 0;
  return ((price * (1 - mix) + (rules.adPrice || 0) * mix) / 30) + (rules.adDaily || 0) * mix;
}

function upkeepScale(subs) {
  const rules = econ();
  return 1 + (subs / (rules.contentScaleSubs || 1500000)) * (rules.contentScale || 0);
}

function interestRate() {
  const credit = CONFIG.credit || {};
  if (state && state.difficulty === "hard") return credit.hardDailyInterest || 0.0015;
  return credit.dailyInterest || 0.001;
}

function dailyInterest(cash) {
  if (!(cash < 0)) return 0;
  return Math.abs(cash) * interestRate();
}

function creditLimit() {
  const credit = CONFIG.credit || {};
  const start = credit[state.difficulty] || credit.normal || 50000;
  const recent = analytics.slice(-30);
  const avg = recent.length ? recent.reduce((sum, row) => sum + (row.revenue || 0), 0) / recent.length : 0;
  return Math.max(start, avg * (credit.revenueMultiple || 45) + (state.brand || 0) * (credit.brandBonus || 0)) + (state.creditBonus || 0);
}

function canSpend(cost) {
  return state.cash - cost >= -creditLimit();
}

function payKind(cost) {
  if (state.cash >= cost) return "cash";
  if (canSpend(cost)) return "credit";
  return "over";
}

function trySpend(cost) {
  if (!canSpend(cost)) return false;
  const next = roundCents(state.cash - cost);
  if (hasUi() && !simOffline) {
    const limit = creditLimit();
    const first = state.cash >= 0 && next < 0 && !state.explainedDebt;
    const close = Math.max(0, -next) > limit * ((CONFIG.credit || {}).confirmRatio || 0.8);
    if (first || close) {
      const message = first
        ? `This puts ${displayName()} in debt. Interest is charged every day until cash is back above zero.`
        : `This uses most of the credit limit. Balance after: ${formatCash(next)}.`;
      if (!window.confirm(message)) return false;
      if (first) state.explainedDebt = true;
    }
  }
  const wasClear = state.cash >= 0;
  state.cash = next;
  if (wasClear && state.cash < 0) {
    state.explainedDebt = true;
    state.boughtOnCredit = true;
  }
  return true;
}

function captureRate(price) {
  const rules = econ();
  return clamp(Math.pow((rules.captureAnchor || 7.5) / price, rules.capturePower || 0.72), rules.captureMin || 0.08, rules.captureMax || 0.55);
}

function marketCeiling(price) {
  return Math.max(800, totalTam() * captureRate(price) * (0.75 + clamp(state.brand, 0, 100) / 200));
}

function saturation(subs, price) {
  return clamp(1 - subs / marketCeiling(price), 0.05, 1);
}

function rivalPressure(price, quality) {
  if (!rivals.length) return 1;
  const rules = econ();
  const avgPrice = rivals.reduce((sum, rival) => sum + rival.price, 0) / rivals.length;
  const avgQuality = rivals.reduce((sum, rival) => sum + rival.quality, 0) / rivals.length;
  if (price > avgPrice + (rules.rivalGapPrice || 3) && quality < avgQuality) return rules.rivalGapPenalty || 0.72;
  return 1;
}

function companyValue() {
  const rules = econ();
  const recent = (state.profitHistory || []).slice(-30);
  const avg = recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : 0;
  return avg * 365 * (rules.profitMultiple || 0.22) + paidSubscribers() * (rules.valuePerSub || 16) + state.cash + state.brand * (rules.brandValue || 0);
}

function empireGoals() {
  return empireTarget(state.difficulty || "normal");
}

function businessHealthy() {
  const debt = Math.max(0, -state.cash);
  const limit = Math.max(1, creditLimit());
  return (state.profitableStreak || 0) >= (CONFIG.profitableDays || 60) && debt < limit * (CONFIG.healthyDebtRatio || 0.25);
}

function freeNetChange(freeUsers, freeTier, monthlyPrice, contentQuality, recommendationLevel, serverLevelValue) {
  if (freeTier <= 0) return 0;
  const signups = (2 + freeUsers * 0.012) * freeTier * priceAttractiveness(monthlyPrice);
  const leaving = freeUsers * churnRate(monthlyPrice, contentQuality, recommendationLevel, serverLevelValue) * 0.7;
  return signups - leaving;
}

function dailyRevenue(subscribers, monthlyPrice) {
  return subscribers * revenuePerSub(monthlyPrice);
}

function runningCosts(subscribers) {
  const rules = econ();
  return (rules.baseRunning || BASE_RUNNING_COST) + subscribers * (rules.perSubCost || PER_SUBSCRIBER_RUNNING_COST);
}

function dailyCosts(subscribers, contentUpkeep) {
  return runningCosts(subscribers) + contentUpkeep * upkeepScale(subscribers) + dailyInterest(state ? state.cash : 0);
}

function appealOf(quality, marketing, price, brand) {
  const brandMod = 1 + clamp((brand - 50) / 50, -1, 1) * 0.2;
  return Math.max(0.05, quality) * Math.max(0.05, marketing) * priceAttractiveness(price) * brandMod;
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

function formatQuality(quality) {
  return Number.isInteger(quality) ? String(quality) : quality.toFixed(1);
}

function forecast(price, subs) {
  const rules = econ();
  const paid = subs == null ? paidSubscribers() : subs;
  const quality = currentQuality();
  const marketing = currentMarketing();
  const recommendations = ownedCount("recommendations");
  const servers = serverLevel();
  const freeUsers = state.freeUsers || 0;
  const attractiveness = priceAttractiveness(price);
  const tam = totalTam();
  let extraChurn = 0;
  if (tam > 0 && paid > tam) extraChurn = clamp((paid / tam - 1) * 0.04, 0, 0.08);
  const churn = clamp(churnRate(price, quality, recommendations, servers) + extraChurn, 0.001, rules.churnCap || 0.09);
  const brandMod = 1 + clamp((state.brand - 50) / 50, -1, 1) * (rules.brandGrowth || 0.2);
  const effectMod = effects.reduce((product, effect) => product * (effect.growth || 1), 1);
  const achievementMod = 1 + achievements.size * 0.01;
  const sat = saturation(paid, price);
  const gap = rivalPressure(price, quality);
  const adBoost = state.adTier ? (rules.adGrowth || 1) : 1;
  const organic = subscriberGrowth(paid, quality, marketing, price) * brandMod * effectMod * achievementMod * sat * gap * adBoost;
  const playerAppeal = appealOf(quality, marketing, price, state.brand);
  const rivalAppeal = rivals.reduce((sum, rival) => sum + appealOf(rival.quality, rival.marketing, rival.price, rival.brand), 0);
  const share = playerAppeal / (playerAppeal + rivalAppeal || 1);
  const newcomers = ((rules.newcomerBase || 4) + tam * (rules.newcomerTam || 0)) * share * sat;
  const incoming = Math.max(0, organic + newcomers);
  const leaving = paid * churn;
  const effectRevenue = effects.reduce((sum, effect) => sum + (effect.revenuePerDay || 0), 0);
  const effectCost = effects.reduce((sum, effect) => sum + (effect.costPerDay || 0), 0);
  const adRevenue = freeUsers * FREE_USER_AD_REVENUE;
  const revenue = dailyRevenue(paid, price) + adRevenue + effectRevenue;
  const interest = dailyInterest(state.cash);
  const costs = dailyCosts(paid, currentUpkeep()) + effectCost + revenue * (state.revenueShare || 0);
  const netFree = freeNetChange(freeUsers, ownedCount("free-tier"), price, quality, recommendations, servers);
  return {
    paid, quality, marketing, freeUsers, attractiveness, churn, incoming, leaving, revenue, costs, interest, adRevenue, netFree,
    netPaid: incoming - leaving,
    netCash: revenue - costs,
    share,
  };
}

function snapshot() {
  const view = forecast(state.monthlyPrice);
  const paid = view.paid;
  const quality = view.quality;
  const marketing = view.marketing;
  const upkeep = currentUpkeep();
  const freeUsers = view.freeUsers;
  const attractiveness = view.attractiveness;
  const churn = view.churn;
  const incoming = view.incoming;
  const leaving = view.leaving;
  const adRevenue = view.adRevenue;
  const revenue = view.revenue;
  const costs = view.costs;
  const netFree = view.netFree;
  state.subscribers = paid;

  return {
    serviceName: displayName(),
    sandbox: !!state.sandbox,
    day: state.day,
    cash: state.cash,
    subscribers: paid,
    freeUsers,
    audience: paid + freeUsers,
    contentQuality: quality,
    monthlyPrice: state.monthlyPrice,
    marketingMultiplier: marketing,
    contentUpkeep: upkeep,
    daysBelowLoseLine: state.daysBelowLoseLine,
    status: state.status,
    brand: state.brand,
    difficulty: state.difficulty,
    speed: state.speed,
    paused: state.paused,
    priceAttractiveness: attractiveness,
    growthLabel: growthLabel(attractiveness),
    churnRate: churn,
    churnLabel: churnLabel(churn),
    bufferingChurn: BUFFERING_CHURN * Math.pow(0.5, serverLevel()),
    incoming,
    leaving,
    netPaid: incoming - leaving,
    netFree,
    netSubscribers: incoming - leaving,
    netAudience: incoming - leaving + netFree,
    adRevenue,
    dailyRevenue: revenue,
    dailyCosts: costs,
    netCash: revenue - costs,
    interest: view.interest,
    companyValue: companyValue(),
    creditLimit: creditLimit(),
    debt: Math.max(0, -state.cash),
    empireHold: state.empireHold || 0,
    adTier: !!state.adTier,
    profitableStreak: state.profitableStreak || 0,
    owned: { ...owned },
    regions: JSON.parse(JSON.stringify(state.regions)),
    titles: titles.map((title) => ({ ...title, freshness: freshnessOf(title), contribution: titleContribution(title) })),
    rivals: rivals.map((rival) => ({ ...rival, history: rival.history.slice() })),
    effects: effects.map((effect) => ({ ...effect })),
    achievements: [...achievements],
    genreTrends: { ...state.genreTrends },
    eventDays: state.eventDays.slice(),
    variety: varietyLabel(),
  };
}

function regionWeights() {
  return REGIONS.map((def) => {
    const region = state.regions[def.id];
    if (!region.unlocked) return 0;
    const loc = region.localised ? 1 : 0.5;
    const priceFit = Math.pow((def.tolerance * (econ().anchorPrice || 8)) / state.monthlyPrice, econ().pricePower || 0.85);
    const trend = state.genreTrends[def.favourite] || 1;
    const favouriteLive = titles.some((title) => titleContribution(title) > 0 && title.genre === def.favourite);
    return region.tam * loc * priceFit * trend * (favouriteLive ? 1.15 : 1);
  });
}

function distribute(amount) {
  if (!(amount > 0)) return;
  const weights = regionWeights();
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  REGIONS.forEach((def, index) => {
    const region = state.regions[def.id];
    region.subscribers = roundSubscribers(region.subscribers + amount * (weights[index] / total));
  });
}

function shed(amount) {
  if (!(amount > 0)) return;
  const paid = paidSubscribers();
  if (paid <= 0) return;
  REGIONS.forEach((def) => {
    const region = state.regions[def.id];
    const next = region.subscribers - amount * (region.subscribers / paid);
    region.subscribers = roundSubscribers(Math.max(0, next));
  });
}

function addSubscribers(amount) {
  if (amount >= 0) distribute(amount);
  else shed(-amount);
}

function nextTitleName(genre) {
  const pool = TITLE_NAMES[genre] || ["Untitled"];
  const used = titles.filter((title) => title.genre === genre).length;
  const base = pool[used % pool.length];
  const cycle = Math.floor(used / pool.length);
  return cycle === 0 ? base : `${base} ${cycle + 1}`;
}

function makeTitle(fields) {
  const title = {
    id: `t${titleSerial}`,
    name: "Untitled",
    genre: "Comedy",
    kind: "original",
    tier: "low",
    status: "producing",
    daysLeft: 0,
    totalDays: 0,
    quality: 0,
    upkeep: 0,
    cost: 0,
    outcome: null,
    releaseDay: null,
    contractDays: 0,
    licenseId: null,
    ...fields,
  };
  titleSerial += 1;
  titles.push(title);
  return title;
}

function clearOverrides() {
  qualityOverride = null;
  marketingOverride = null;
  upkeepOverride = null;
}

function commission(genre, tierId) {
  if (state.status !== "playing") return false;
  const budget = BUDGETS[tierId];
  if (!budget || !GENRES.includes(genre)) return false;
  if (libraryFull()) {
    toast("The library is full. Expand it to add more.");
    return false;
  }
  if (!trySpend(budget.cost)) return false;
  clearOverrides();
  const title = makeTitle({
    name: nextTitleName(genre),
    genre,
    tier: budget.id,
    status: "producing",
    daysLeft: budget.days,
    totalDays: budget.days,
    plannedQuality: budget.quality,
    plannedUpkeep: budget.upkeep,
    cost: budget.cost,
    series: true,
    format: genre === "Comedy" ? "sitcom" : "drama",
  });
  pushEvent(state.day, [{ text: `${title.name} enters production (${budget.name}, ${budget.days} days).`, tone: "neutral" }], "money");
  saveGame();
  syncView();
  return true;
}

function librarySlots() {
  const rules = CONFIG.library || {};
  return (rules.slots || 12) + ownedCount("expand") * (rules.expandSlots || 4);
}

function slotsUsed() {
  return titles.filter((title) => title.status === "released" || title.status === "producing").length;
}

function libraryFull() {
  return slotsUsed() >= librarySlots();
}

function sportsLive() {
  return titles.filter((title) => title.genre === "Sport" && title.kind === "licensed" && title.status === "released" && title.contractDays > 0);
}

function catalogCost(id) {
  const def = LICENSES[id];
  if (!def) return 0;
  const generation = state.licenseGeneration[id] || 0;
  return Math.round(def.cost * Math.pow(CONFIG.renewRise || 1.2, generation));
}

function licenseCost(id) {
  const def = LICENSES[id];
  let cost = catalogCost(id);
  if (def && def.genre === "Sport") cost = Math.round(cost * Math.pow(econ().sportsCostStep || 1.25, sportsLive().length));
  return cost;
}

function activeLicense(id) {
  return titles.some((title) => title.licenseId === id && title.status === "released" && title.contractDays > 0);
}

function moviePackList() {
  return (CONFIG.moviePacks || []).map((pack) => LICENSES[pack.id]).filter(Boolean);
}

function nextMoviePack() {
  return moviePackList().find((pack) => !activeLicense(pack.id)) || null;
}

function ownedMoviePacks() {
  return moviePackList().filter((pack) => activeLicense(pack.id)).length;
}

function signLicense(id, silent) {
  if (state.status !== "playing" && !silent) return false;
  const def = LICENSES[id];
  if (!def || activeLicense(id)) return false;
  if (libraryFull()) {
    toast("The library is full. Expand it to add more.");
    return false;
  }
  const cost = licenseCost(id);
  if (!trySpend(cost)) return false;
  clearOverrides();
  state.licenseGeneration[id] = (state.licenseGeneration[id] || 0) + 1;
  if (id === "sports" || def.genre === "Sport") state.sportsSigned = true;
  const title = makeTitle({
    name: def.title,
    genre: def.genre,
    kind: "licensed",
    tier: "license",
    status: "released",
    quality: def.quality,
    upkeep: def.upkeep,
    cost,
    outcome: "licensed",
    releaseDay: state.day,
    contractDays: def.days,
    licenseId: id,
  });
  pushEvent(state.day, [{ text: `${def.name} signed for ${formatCash(cost)}. ${def.days} days on the clock.`, tone: "neutral" }], "money");
  checkAchievements();
  saveGame();
  syncView();
  return title;
}

function upgradeCost(upgrade, count) {
  if (!upgrade) return 0;
  if (upgrade.action === "library") {
    const next = nextMoviePack();
    return next ? licenseCost(next.id) : 0;
  }
  if (upgrade.action === "license") return licenseCost(upgrade.id);
  if (upgrade.action === "commission") return BUDGETS.low.cost;
  const ownedSoFar = count === undefined ? ownedCount(upgrade.id) : count;
  return Math.round((upgrade.cost || 0) * Math.pow(UPGRADE_COST_GROWTH, ownedSoFar));
}

function buyUpgrade(id) {
  const upgrade = upgradeById(id);
  if (!upgrade || state.status !== "playing") return false;
  if (upgrade.action === "commission") {
    openCommission();
    return false;
  }
  if (upgrade.action === "library") {
    const next = nextMoviePack();
    return next ? !!signLicense(next.id) : false;
  }
  if (upgrade.action === "license") return !!signLicense(id);
  const count = ownedCount(id);
  const cost = upgradeCost(upgrade, count);
  if (!trySpend(cost)) return false;
  clearOverrides();
  owned[id] = count + 1;
  pushEvent(state.day, [{ text: upgrade.event, tone: "neutral" }], "money");
  if (hasUi()) {
    flashStat("cash-value", -1);
    showDelta("cash-delta", formatSignedMoney(-cost), "down");
  }
  saveGame();
  syncView();
  return true;
}

function unlockRegion(id) {
  const def = regionDef(id);
  const region = def && state.regions[id];
  if (!def || !region || region.unlocked || state.status !== "playing") return false;
  if (!trySpend(def.unlock)) return false;
  region.unlocked = true;
  pushEvent(state.day, [{ text: `${def.name} is on the map.`, tone: "up" }], "money");
  checkAchievements();
  saveGame();
  syncView();
  return true;
}

function localiseRegion(id) {
  const def = regionDef(id);
  const region = def && state.regions[id];
  if (!def || !region || !region.unlocked || region.localised || state.status !== "playing") return false;
  if (!trySpend(def.localise)) return false;
  region.localised = true;
  pushEvent(state.day, [{ text: `${def.name} now has subtitles, dubs, and local art.`, tone: "up" }], "money");
  saveGame();
  syncView();
  return true;
}

function changeBrand(delta, reason, scaleBad) {
  const amount = scaleBad && delta < 0 ? delta * difficulty().severity : delta;
  const before = Math.round(state.brand);
  state.brand = clamp(state.brand + amount, 0, 100);
  const shown = Math.round(state.brand) - before;
  if (reason && shown !== 0) {
    pushEvent(state.day, [{
      text: `${shown > 0 ? "+" : ""}${shown} Brand: ${reason}`,
      tone: shown > 0 ? "up" : "down",
    }], "events");
  }
}

function rollOutcome(budget) {
  const brandBonus = clamp((state.brand - 50) / 50, -1, 1) * 0.05;
  const flop = budget.flop;
  const hit = clamp(budget.hit + brandBonus, 0, Math.max(0, 0.95 - flop));
  const roll = random();
  if (roll < flop) return "flop";
  if (roll < flop + hit) return "hit";
  return "average";
}

function releaseOriginal(title) {
  const budget = BUDGETS[title.tier] || BUDGETS.low;
  const scored = scoreRelease(title, budget);
  title.status = "released";
  title.outcome = scored.tag;
  title.critic = scored.critic;
  title.audience = scored.audience;
  title.releaseDay = state.day;
  title.upkeep = title.plannedUpkeep || budget.upkeep;
  title.quality = scored.quality;
  state.releaseCount += 1;
  if (scored.tag === "hit" || scored.tag === "guilty") {
    if (scored.tag === "hit") state.hitCount += 1;
    changeBrand(scored.tag === "hit" ? 4 : 1, scored.tag === "hit" ? "Hit" : "Guilty pleasure");
    effects.push({ id: `hit-${title.id}`, sourceId: title.id, label: `${title.name} is a ${scored.tag === "hit" ? "hit" : "guilty pleasure"}`, days: scored.tag === "hit" ? 30 : 18, growth: scored.tag === "hit" ? 1.5 : 1.28 });
  } else if (scored.tag === "flop") {
    state.flopCount += 1;
    changeBrand(-3, "Flop");
  } else if (scored.tag === "darling") {
    state.criticsDarling = true;
    changeBrand(5, "Critics' darling");
    effects.push({ id: `darling-${title.id}`, sourceId: title.id, label: `${title.name} is a critics' darling`, days: 40, growth: 1.12 });
  } else {
    changeBrand(1, "Solid release");
  }
  if (scored.spike > 0) addSubscribers(scored.spike);
  if (title.localRegion && (scored.tag === "hit" || scored.audience >= 70)) {
    state.localHits = state.localHits || {};
    state.localHits[title.localRegion] = true;
  }
  if (title.cast && title.cast.some((actor) => actor.archetype === "Rising Star") && scored.tag === "hit") state.risingStarHit = true;
  const line = reviewHeadline(title);
  pushEvent(state.day, [{ text: line, tone: scored.tag === "flop" ? "down" : "up" }], "events");
  if (hasUi() && !simOffline) enqueuePrompt({ type: "review", titleId: title.id, line });
  checkAchievements();
}

function advanceProductions() {
  titles.forEach((title) => {
    if (title.status !== "producing") return;
    title.daysLeft -= 1;
    if (title.daysLeft <= 0) releaseOriginal(title);
  });
}

function expireLicense(title) {
  title.status = "expired";
  title.contractDays = 0;
  pendingRenew.delete(title.id);
  pushEvent(state.day, [{ text: `${title.name} left the catalogue.`, tone: "down" }], "money");
}

function renewTitle(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return false;
  const cost = renewalCost(title);
  if (!trySpend(cost)) return false;
  const known = title.licenseId && LICENSES[title.licenseId];
  if (known) state.licenseGeneration[title.licenseId] = (state.licenseGeneration[title.licenseId] || 0) + 1;
  else title.renewals = (title.renewals || 0) + 1;
  title.contractDays = known ? known.days : (title.contractLength || 90);
  title.releaseDay = state.day;
  title.cost += cost;
  pendingRenew.delete(title.id);
  pushEvent(state.day, [{ text: `Renewed ${title.name} for ${formatCash(cost)}.`, tone: "neutral" }], "money");
  saveGame();
  syncView();
  return true;
}

function dropLicense(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return;
  expireLicense(title);
  pendingRenew.delete(id);
  saveGame();
  syncView();
}

function renewalCost(title) {
  const base = title.licenseId ? catalogCost(title.licenseId) : Math.round((title.cost || 1000) * (CONFIG.renewRise || 1.2));
  let cost = Math.round(base * upkeepScale(paidSubscribers()));
  if (title.genre === "Sport") {
    const ordered = sportsLive().slice().sort((a, b) => (a.releaseDay || 0) - (b.releaseDay || 0));
    const rank = Math.max(0, ordered.findIndex((item) => item.id === title.id));
    cost = Math.round(cost * Math.pow(econ().sportsRenewStep || 1.35, rank));
  }
  return cost;
}

function offerRenewal(title) {
  if (pendingRenew.has(title.id)) return;
  pendingRenew.add(title.id);
  const cost = renewalCost(title);
  if (simOffline || !hasUi()) {
    if (state.cash >= cost + 2000) {
      renewTitle(title.id);
      offlineNotes.push(`Renewed ${title.name}.`);
    } else {
      dropLicense(title.id);
      offlineNotes.push(`Let ${title.name} lapse.`);
    }
    return;
  }
  enqueuePrompt({ type: "renew", titleId: title.id, cost });
}

function advanceContracts() {
  const due = [];
  titles.forEach((title) => {
    if (title.kind !== "licensed" || title.status !== "released") return;
    if (pendingRenew.has(title.id)) return;
    title.contractDays -= 1;
    if (title.contractDays === 10) due.push(title);
    else if (title.contractDays <= 0) expireLicense(title);
  });
  if (!due.length) return;
  if (simOffline || !hasUi()) {
    due.forEach(offerRenewal);
    return;
  }
  due.forEach((title) => pendingRenew.add(title.id));
  enqueuePrompt({ type: "renewals", ids: due.map((title) => title.id) });
}

function driftTrends() {
  GENRES.forEach((genre) => {
    const delta = (random() - 0.5) * 0.3;
    state.genreTrends[genre] = clamp((state.genreTrends[genre] || 1) + delta, 0.8, 1.4);
  });
  pushEvent(state.day, [{ text: "Tastes shifted. Check which genre is trending.", tone: "neutral" }], "events");
}

function decayEffects() {
  effects.forEach((effect) => {
    effect.days -= 1;
  });
  effects = effects.filter((effect) => effect.days > 0);
}

function driftBrand(before) {
  let passive = 0;
  let reason = "";
  if (state.monthlyPrice > 15) {
    passive -= 0.25;
    reason = "Price above $15";
  } else if ((state.highCreditDays || 0) >= ((CONFIG.credit || {}).brandStrainDays || 12)) {
    passive -= 0.15;
    reason = "Investors nervous";
  } else if (before.netCash > 0) {
    passive += 0.12;
    reason = "Steady run";
  }
  if (before.contentQuality >= 8) {
    passive += 0.1;
    if (!reason || reason === "Steady run") reason = "Strong catalogue";
  }
  if (passive) changeBrand(passive, reason, false);
}

function rivalAppealNow(rival) {
  return appealOf(rival.quality, rival.marketing, rival.price, rival.brand);
}

function tickRivals(playerBefore) {
  const tam = totalTam();
  const quality = currentQuality();
  const marketing = currentMarketing();
  const playerAppeal = appealOf(quality, marketing, state.monthlyPrice, state.brand);
  const totalAppeal = playerAppeal + rivals.reduce((sum, rival) => sum + rivalAppealNow(rival), 0);
  rivals.forEach((rival) => {
    const previous = rival.subscribers;
    const organic = subscriberGrowth(rival.subscribers, rival.quality, rival.marketing, rival.price);
    const rules = econ();
    const newcomers = ((rules.newcomerBase || 4) + tam * (rules.newcomerTam || 0)) * (rivalAppealNow(rival) / (totalAppeal || 1));
    const churn = churnRate(rival.price, rival.quality, 0, 1);
    let net = (organic + newcomers - rival.subscribers * churn) * difficulty().rivalStrength;
    rival.quality += rules.rivalDrift || 0;
    if (rival.subscribers > marketCeiling(rival.price) * 0.85) net *= 0.45;
    if (rival.personality === "chaotic") net *= 0.75 + random() * 0.7;
    if (rival.subscribers > tam * 0.45) net *= 0.7;
    const cap = rival.subscribers * 0.08 + 12;
    net = clamp(net, -rival.subscribers * 0.05, cap);
    rival.subscribers = Math.max(0, rival.subscribers + net);
    rival.history.push(Math.round(rival.subscribers));
    if (rival.history.length > 180) rival.history.shift();
    const playerAfter = paidSubscribers();
    if (playerBefore <= previous && playerAfter > rival.subscribers) {
      state.beatRival = true;
      toast(`You passed ${rival.name}.`);
      pushEvent(state.day, [{ text: `Passed ${rival.name} on the leaderboard.`, tone: "up" }], "rivals");
    }
    rival.nextAction -= 1;
    if (rival.nextAction <= 0) {
      rivalAct(rival);
      rival.nextAction = 25 + rollInt(26);
    }
  });
}

function rivalAct(rival) {
  let action = "blitz";
  const roll = random();
  if (rival.personality === "aggressive" && roll < 0.5) action = "price";
  else if (rival.personality === "steady" && roll < 0.45) action = "launch";
  else if (rival.personality === "chaotic" && roll < 0.33) action = "dip";
  else if (rival.personality === "premium" && roll < 0.5) action = "launch";
  else action = ["price", "launch", "acquire", "blitz"][rollInt(4)];

  if (action === "price") {
    rival.price = clamp(roundCents(rival.price - 1), MIN_MONTHLY_PRICE, MAX_MONTHLY_PRICE);
    pushEvent(state.day, [{ text: `${rival.name} cut its price to ${formatPrice(rival.price)}.`, tone: "warn" }], "rivals");
  } else if (action === "launch") {
    rival.quality += 1.1;
    pushEvent(state.day, [{ text: `${rival.name} launched a flagship. Their catalogue got sharper.`, tone: "warn" }], "rivals");
  } else if (action === "acquire") {
    rival.subscribers *= 1.12;
    pushEvent(state.day, [{ text: `${rival.name} bought a smaller service and swallowed its subscribers.`, tone: "warn" }], "rivals");
  } else if (action === "dip") {
    rival.quality = Math.max(1, rival.quality * 0.9);
    pushEvent(state.day, [{ text: `${rival.name} shipped a flop and spent the week apologising.`, tone: "up" }], "rivals");
  } else {
    rival.marketing += 0.18;
    pushEvent(state.day, [{ text: `${rival.name} bought a marketing blitz.`, tone: "warn" }], "rivals");
  }
}

function growMarkets() {
  const rate = econ().marketGrowth || 1.00035;
  REGIONS.forEach((def) => {
    const region = state.regions[def.id];
    if (region.unlocked) region.tam *= rate;
  });
}

function checkEndings() {
  if (state.status !== "playing") return;
  const goals = empireGoals();
  const valueOk = companyValue() >= goals.companyValue;
  const subsOk = paidSubscribers() >= goals.subscribers;
  const healthy = businessHealthy();
  if (!simOffline) {
    if (valueOk && subsOk && healthy) state.empireHold = (state.empireHold || 0) + 1;
    else state.empireHold = 0;
    if (state.empireHold >= (CONFIG.holdDays || 30)) {
      state.status = "won";
      pushEvent(state.day, [{ text: "Streaming Empire. The three goals held.", tone: "up" }], "events");
      return;
    }
  }
  if (!difficulty().canLose) {
    state.daysBelowLoseLine = 0;
    return;
  }
  if (simOffline) return;
  if (state.cash < -creditLimit()) {
    state.daysBelowLoseLine += 1;
    const limitDays = (CONFIG.credit || {}).bankruptcyDays || 30;
    if (state.daysBelowLoseLine === 1 || state.daysBelowLoseLine === 10 || state.daysBelowLoseLine === 20) {
      pushEvent(state.day, [{ text: `Bankruptcy countdown ${state.daysBelowLoseLine}/${limitDays}.`, tone: "warn" }], "money");
    }
    if (state.daysBelowLoseLine >= limitDays) {
      state.status = "lost";
      pushEvent(state.day, [{ text: "The service closes.", tone: "down" }], "money");
    }
  } else {
    state.daysBelowLoseLine = 0;
  }
}

function trendingGenre() {
  let best = null;
  let bestValue = 1.1;
  GENRES.forEach((genre) => {
    const value = state.genreTrends[genre] || 1;
    if (value > bestValue) {
      best = genre;
      bestValue = value;
    }
  });
  return best ? { genre: best, value: bestValue } : null;
}

function applyEffect(effect) {
  if (effect.type === "growth") {
    effects.push({ id: `fx-${state.day}-${random()}`, label: effect.label, days: effect.days, growth: effect.value });
  } else if (effect.type === "revenue") {
    effects.push({ id: `fx-${state.day}-r`, label: effect.label, days: effect.days, revenuePerDay: effect.value });
  } else if (effect.type === "cost") {
    const value = effect.value * (effect.scale ? difficulty().severity : 1);
    effects.push({ id: `fx-${state.day}-c`, label: effect.label, days: effect.days, costPerDay: value });
  } else if (effect.type === "brand") {
    changeBrand(effect.value, effect.reason || effect.label, !!effect.scale);
  } else if (effect.type === "cash") {
    const value = effect.value < 0 && effect.scale ? effect.value * difficulty().severity : effect.value;
    if (value < 0 && !canSpend(-value)) return;
    state.cash = roundCents(state.cash + value);
    if (value < 0 && state.cash < 0) state.boughtOnCredit = true;
  } else if (effect.type === "subs") {
    const paid = paidSubscribers();
    const delta = effect.relative ? paid * effect.value : effect.value;
    const scaled = delta < 0 && effect.scale ? delta * difficulty().severity : delta;
    addSubscribers(scaled);
  } else if (effect.type === "delay") {
    titles.forEach((title) => {
      if (title.status === "producing") {
        title.daysLeft += effect.days;
        title.totalDays += effect.days;
      }
    });
  } else if (effect.type === "servers") {
    effects.push({ id: `fx-srv-${state.day}`, label: effect.label, days: effect.days, servers: true });
  } else if (effect.type === "sold") {
    state.status = "sold";
    pushEvent(state.day, [{ text: "You sold the company.", tone: "warn" }], "events");
  } else if (effect.type === "reject-buyout") {
    state.rejectedBuyout = true;
    changeBrand(1, "Stayed independent");
  } else if (effect.type === "share") {
    state.cash = roundCents(state.cash + effect.cash);
    state.revenueShare = (state.revenueShare || 0) + effect.value;
  } else if (effect.type === "credit-bonus") {
    state.creditBonus = Math.max(-creditLimit() * 0.5, (state.creditBonus || 0) + effect.value);
    pushEvent(state.day, [{ text: `Credit limit ${effect.value > 0 ? "raised" : "cut"} by ${formatCash(Math.abs(effect.value))}.`, tone: effect.value > 0 ? "up" : "warn" }], "money");
  } else if (effect.type === "clear-debt") {
    if (state.cash < 0) {
      state.debtRepaid = (state.debtRepaid || 0) + (-state.cash);
      state.cash = 0;
      pushEvent(state.day, [{ text: "The overdraft is cleared.", tone: "up" }], "money");
    }
  } else if (effect.type === "debt-dip") {
    const ratio = creditLimit() > 0 ? Math.max(0, -state.cash) / creditLimit() : 0;
    effects.push({ id: `fx-dip-${state.day}`, label: "Rival launch", days: 12, growth: ratio > 0.5 ? 0.72 : 0.9 });
  } else if (effect.type === "price") {
    state.monthlyPrice = clamp(roundCents(state.monthlyPrice + effect.delta), MIN_MONTHLY_PRICE, MAX_MONTHLY_PRICE);
  } else if (effect.type === "flag") {
    state[effect.flag] = true;
  } else if (effect.type === "marketing") {
    state.marketingPenalty = Math.max(0, (state.marketingPenalty || 0) + effect.value);
  } else if (effect.type === "pull") {
    const original = [...titles].reverse().find((title) => title.kind === "original" && title.status === "released");
    if (original) {
      original.status = "pulled";
      original.upkeep = 0;
      effects = effects.filter((item) => item.sourceId !== original.id);
      pushEvent(state.day, [{ text: `Pulled ${original.name}. The quality walks out with it.`, tone: "down" }], "events");
    }
  } else if (effect.type === "boost-newest") {
    const original = [...titles].reverse().find((title) => title.kind === "original" && title.status === "released");
    if (original) original.quality += effect.value;
  } else if (effect.type === "trend") {
    effect.genres.forEach((genre) => {
      state.genreTrends[genre] = clamp((state.genreTrends[genre] || 1) + effect.value, 0.8, 1.4);
    });
  } else if (effect.type === "sports-pause") {
    effects.push({ id: `fx-sport-${state.day}`, label: effect.label, days: effect.days, sportsPause: true });
  } else if (effect.type === "instant") {
    makeTitle({
      name: effect.name,
      genre: effect.genre,
      kind: "original",
      tier: "low",
      status: "released",
      quality: effect.quality,
      upkeep: 12,
      cost: effect.cost || 0,
      outcome: "average",
      releaseDay: state.day,
    });
    state.releaseCount += 1;
  } else if (effect.type === "discount-commission") {
    const genre = GENRES[rollInt(GENRES.length)];
    const budget = BUDGETS.low;
    const cost = Math.round(budget.cost * 0.5);
    if (state.cash >= cost) {
      state.cash = roundCents(state.cash - cost);
      makeTitle({
        name: nextTitleName(genre),
        genre,
        tier: "low",
        status: "producing",
        daysLeft: budget.days,
        totalDays: budget.days,
        plannedQuality: budget.quality,
        plannedUpkeep: budget.upkeep,
        cost,
      });
      pushEvent(state.day, [{ text: `A holiday special starts filming for ${formatCash(cost)}.`, tone: "up" }], "events");
    }
  } else if (effect.type === "tax") {
    state.cash = roundCents(state.cash + Math.min(4000, 800 + state.day * 2));
  } else if (effect.type === "lawsuit") {
    if (random() < 0.5) {
      changeBrand(-7, "Lost the lawsuit", true);
      state.cash = roundCents(state.cash - 4000 * difficulty().severity);
    } else {
      changeBrand(2, "Won the lawsuit");
    }
  } else if (effect.type === "tech") {
    if (ownedCount("app") > 0) {
      effects.push({ id: `fx-tech-${state.day}`, label: "New devices", days: 20, growth: 1.3 });
      pushEvent(state.day, [{ text: "The phone app caught the new devices.", tone: "up" }], "events");
    } else {
      changeBrand(-1, "Viewers moved to phones", true);
    }
  }
}

function applyOption(event, option) {
  activeEvent = null;
  (option.effects || []).forEach(applyEffect);
  pushEvent(state.day, [{ text: `${event.title}: ${option.label}.`, tone: "neutral" }], "events");
  if (simOffline) offlineNotes.push(`${event.title}: ${option.label}.`);
  checkAchievements();
  if (state.status !== "playing") finishRun();
  else saveGame();
  syncView();
}

const EVENTS = [
  { id: "viral", emoji: "🔥", title: "The group chat cannot cope", description: "A clip escapes. Strangers are quoting it in shops.", weight: 4, minDay: 8, condition: () => paidSubscribers() > 80, autoOption: 0, options: [
    { id: "ride", label: "Let it spread", summary: "+35% growth for 12 days.", effects: [{ type: "growth", value: 1.35, days: 12, label: "Viral buzz" }] },
  ] },
  { id: "influencer", emoji: "🤳", title: "Influencer, incoming", description: "Someone with a ring light offers a review. Their rate card has a small font.", weight: 3, minDay: 6, autoOption: 1, options: [
    { id: "pay", label: "Pay $1,500", summary: "+4 Brand and +20% growth for 10 days.", effects: [{ type: "cash", value: -1500 }, { type: "brand", value: 4, reason: "Influencer review" }, { type: "growth", value: 1.2, days: 10, label: "Influencer review" }] },
    { id: "skip", label: "Smile and decline", summary: "No spend. No boost.", effects: [] },
  ] },
  { id: "meme", emoji: "🐸", title: "You are the meme", description: "A still from your show is now a reaction image. This is somehow good.", weight: 3, minDay: 12, condition: () => paidSubscribers() > 200, autoOption: 0, options: [
    { id: "post", label: "Lean in", summary: "A burst of new subscribers.", effects: [{ type: "subs", value: 0.03, relative: true }, { type: "subs", value: 20 }] },
  ] },
  { id: "outage", emoji: "🛑", title: "Buffering, nationally", description: "The play button spins. Group chats turn unkind.", weight: 3, minDay: 15, autoOption: 0, options: [
    { id: "apologise", label: "Post the apology", summary: "Lose about 4% of subscribers and 5 Brand.", effects: [{ type: "subs", value: -0.04, relative: true, scale: true }, { type: "brand", value: -5, reason: "Outage", scale: true }] },
  ] },
  { id: "leak", emoji: "🗞️", title: "Inbox, leaked", description: "A spreadsheet of who watched what is suddenly a hobby for journalists.", weight: 2, minDay: 20, autoOption: 0, options: [
    { id: "own", label: "Own it", summary: "Brand takes a heavy hit.", effects: [{ type: "brand", value: -8, reason: "Data leak", scale: true }] },
  ] },
  { id: "bomb", emoji: "💣", title: "Review bombed", description: "A rating site looks like a dartboard. Half the darts say 'mid'.", weight: 3, minDay: 18, condition: () => paidSubscribers() > 250, autoOption: 0, options: [
    { id: "discount", label: "Cut the price", summary: "Price drops by $1. Brand loses 1.", effects: [{ type: "price", delta: -1 }, { type: "brand", value: -1, reason: "Discount apology" }] },
    { id: "ignore", label: "Ignore the pile-on", summary: "Brand -4 and a growth dip for two weeks.", effects: [{ type: "brand", value: -4, reason: "Review bomb", scale: true }, { type: "growth", value: 0.85, days: 14, label: "Review bomb" }] },
  ] },
  { id: "scandal", emoji: "🎭", title: "A cast member is late", description: "Someone missed the morning call. The rumour mill is doing cardio. It is about the schedule, nothing darker.", weight: 3, minDay: 16, condition: () => titles.some((title) => (title.kind === "original" || title.cast) && title.status === "released"), autoOption: 0, options: [
    { id: "pull", label: "Delay a scene", summary: "The newest original loses a little quality. The brand steadies.", effects: [{ type: "pull" }, { type: "brand", value: 1, reason: "Handled the delay" }] },
    { id: "ride", label: "Shoot around them", summary: "Brand -2, and a short burst of curious viewers.", effects: [{ type: "brand", value: -2, reason: "Late to set", scale: true }, { type: "growth", value: 1.12, days: 8, label: "Curious viewers" }] },
  ] },
  { id: "buyout", emoji: "🤝", title: "An offer for the lot", description: "A rival slides a number across the table. It is not an insult. It is also not a dynasty.", weight: 2, minDay: 45, condition: () => paidSubscribers() > 800, autoOption: 1, options: [
    { id: "sell", label: "Sell", summary: "The run ends now with a modest score.", effects: [{ type: "sold" }] },
    { id: "stay", label: "Stay independent", summary: "The trophy for saying no, and +1 Brand.", effects: [{ type: "reject-buyout" }] },
  ] },
  { id: "investor", emoji: "💼", title: "Money with a tail", description: "An investor loves the logo. They love a slice of future revenue a little more.", weight: 2, minDay: 12, condition: () => state.cash < 12000 && !state.revenueShare, autoOption: 1, options: [
    { id: "take", label: "Take $8,000", summary: "8% of daily revenue walks out the door from now on.", effects: [{ type: "share", cash: 8000, value: 0.08 }] },
    { id: "no", label: "Keep the whole pie", summary: "No cash. No leash.", effects: [] },
  ] },
  { id: "ads", emoji: "📺", title: "A brand with a jingle", description: "They will pay to sit in front of your play button. Your play button may never emotionally recover.", weight: 3, minDay: 10, autoOption: 0, options: [
    { id: "yes", label: "Run the ads", summary: "+$120 a day for 20 days. Brand -2.", effects: [{ type: "revenue", value: 120, days: 20, label: "Ad deal" }, { type: "brand", value: -2, reason: "Ad deal" }] },
    { id: "no", label: "Keep the screen clean", summary: "+1 Brand.", effects: [{ type: "brand", value: 1, reason: "Turned down the ads" }] },
  ] },
  { id: "strike", emoji: "🪧", title: "Nobody is on set", description: "The call sheet is a list of people not coming in. Craft services weeps alone.", weight: 3, minDay: 10, condition: () => titles.some((title) => title.status === "producing"), autoOption: 0, options: [
    { id: "wait", label: "Wait it out", summary: "Every production slips 6 days.", effects: [{ type: "delay", days: 6 }] },
  ] },
  { id: "regulation", emoji: "📜", title: "A new form to fill", description: "The regulator has discovered streaming. Compliance is a subscription you did not mean to buy.", weight: 2, minDay: 25, autoOption: 0, options: [
    { id: "file", label: "File the forms", summary: "Extra daily costs for 30 days.", effects: [{ type: "cost", value: 45, days: 30, label: "Regulation", scale: true }] },
  ] },
  { id: "tech", emoji: "📱", title: "Everyone has a new rectangle", description: "A gadget launch moves viewing into pockets. Pockets are a distribution strategy.", weight: 2, minDay: 20, autoOption: 0, options: [
    { id: "adapt", label: "See who kept up", summary: "Growth if you own the mobile app. Otherwise the brand sighs.", effects: [{ type: "tech" }] },
  ] },
  { id: "cameo", emoji: "⭐", title: "They will do one scene", description: "A famous person will stand near your logo for an afternoon. Their agent has already cleared their throat.", weight: 2, minDay: 14, condition: () => titles.some((title) => title.kind === "original" && title.status === "released"), autoOption: 1, options: [
    { id: "hire", label: "Pay $3,000", summary: "Your newest original gets a quality bump.", effects: [{ type: "cash", value: -3000 }, { type: "boost-newest", value: 0.8 }] },
    { id: "pass", label: "Wish them well", summary: "No cameo. No invoice.", effects: [] },
  ] },
  { id: "awards", emoji: "🏆", title: "Awards night", description: "You win something shaped like a guilty spoon. The speech runs long. The brand does not mind.", weight: 2, minDay: 20, condition: () => currentQuality() >= 3, autoOption: 0, options: [
    { id: "bow", label: "Accept the spoon", summary: "+6 Brand, and the best title gets a little sharper.", effects: [{ type: "brand", value: 6, reason: "Award win" }, { type: "boost-newest", value: 0.4 }] },
  ] },
  { id: "dance", emoji: "💃", title: "The dance escapes", description: "A chorus from your titles is now a challenge. Knees everywhere are filing complaints.", weight: 3, minDay: 8, autoOption: 0, options: [
    { id: "join", label: "Post the tutorial", summary: "+40% growth for 8 days.", effects: [{ type: "growth", value: 1.4, days: 8, label: "Dance challenge" }] },
  ] },
  { id: "cats", emoji: "🐱", title: "The cat library", description: "Someone offers you every cat video ever filmed. The contract is mostly paw prints.", weight: 2, minDay: 5, autoOption: 0, options: [
    { id: "sign", label: "License the cats ($800)", summary: "Chairman Meow joins the catalogue immediately.", effects: [{ type: "cash", value: -800 }, { type: "instant", name: "Chairman Meow", genre: "Kids", quality: 1.1, cost: 800 }] },
    { id: "no", label: "Remain a serious business", summary: "No cats. The brand stays solemn.", effects: [] },
  ] },
  { id: "war", emoji: "💸", title: "Price war", description: "A rival just made 'free-ish' a strategy. Your subscribers are doing maths.", weight: 3, minDay: 31, autoOption: 1, options: [
    { id: "match", label: "Match them", summary: "Your price drops $1 and growth ticks up for 15 days.", effects: [{ type: "price", delta: -1 }, { type: "growth", value: 1.1, days: 15, label: "Price war" }, { type: "flag", flag: "survivedPriceWar" }] },
    { id: "hold", label: "Hold the price", summary: "Brand +2, but growth cools for 15 days.", effects: [{ type: "brand", value: 2, reason: "Held the price" }, { type: "growth", value: 0.85, days: 15, label: "Price war" }, { type: "flag", flag: "survivedPriceWar" }] },
  ] },
  { id: "binge", emoji: "🍿", title: "Accidental binge weekend", description: "Rain, a long weekend, and nothing else on. People stay.", weight: 3, minDay: 7, condition: () => paidSubscribers() > 100, autoOption: 0, options: [
    { id: "host", label: "Keep the servers warm", summary: "A few percent more subscribers.", effects: [{ type: "subs", value: 0.025, relative: true }] },
  ] },
  { id: "critic", emoji: "✍️", title: "A critic, unreasonably kind", description: "A review uses the word 'transportive' with a straight face.", weight: 2, minDay: 18, condition: () => currentQuality() >= 5, autoOption: 0, options: [
    { id: "frame", label: "Frame the review", summary: "+4 Brand.", effects: [{ type: "brand", value: 4, reason: "Critic's darling" }] },
  ] },
  { id: "festival", emoji: "🎪", title: "Festival season", description: "Comedy and kids are suddenly what people put on in tents.", weight: 2, minDay: 20, autoOption: 0, options: [
    { id: "programme", label: "Lean into the season", summary: "Comedy and Kids trend upward.", effects: [{ type: "trend", genres: ["Comedy", "Kids"], value: 0.12 }] },
  ] },
  { id: "lawsuit", emoji: "⚖️", title: "See you in court", description: "Someone claims they invented the play button. Their lawyer has a very shiny pen.", weight: 2, minDay: 22, autoOption: 0, options: [
    { id: "settle", label: "Settle for $2,500", summary: "It goes away. So does the cash.", effects: [{ type: "cash", value: -2500 }] },
    { id: "fight", label: "Fight it", summary: "A coin toss between a brand win and an expensive loss.", effects: [{ type: "lawsuit" }] },
  ] },
  { id: "holiday", emoji: "🎁", title: "The holiday hole", description: "Every rival has a special. You have a gap shaped like December.", weight: 2, minDay: 12, autoOption: 1, options: [
    { id: "rush", label: "Rush a cheap special", summary: "Half-price low-budget production starts today.", effects: [{ type: "discount-commission" }] },
    { id: "skip", label: "Sit this one out", summary: "No special. No scramble.", effects: [] },
  ] },
  { id: "poach", emoji: "🪝", title: "Talent poaching", description: "Your growth lead has a meeting that is definitely not a meeting.", weight: 2, minDay: 20, autoOption: 0, options: [
    { id: "retain", label: "Pay $2,000 to keep them", summary: "Marketing stays put.", effects: [{ type: "cash", value: -2000 }] },
    { id: "wave", label: "Wave goodbye", summary: "Marketing takes a permanent nick.", effects: [{ type: "marketing", value: 0.15 }] },
  ] },
  { id: "grant", emoji: "🏛️", title: "A cultural grant", description: "An arts body would like to fund something with subtitles and feelings.", weight: 2, minDay: 12, condition: () => !titles.some((title) => title.genre === "Documentary" && title.status !== "expired" && title.status !== "pulled"), autoOption: 0, options: [
    { id: "accept", label: "Take the grant", summary: "+$2,500 cash.", effects: [{ type: "cash", value: 2500 }] },
  ] },
  { id: "backlash", emoji: "😬", title: "Reality, a bit too real", description: "Viewers have decided your reality show is a social problem. They are not entirely wrong.", weight: 2, minDay: 18, condition: () => titles.some((title) => title.genre === "Reality" && title.status === "released"), autoOption: 0, options: [
    { id: "note", label: "Issue a careful note", summary: "Brand -4.", effects: [{ type: "brand", value: -4, reason: "Reality backlash", scale: true }] },
  ] },
  { id: "blackout", emoji: "🏟️", title: "Sports blackout", description: "The league remembers it has lawyers. Your live pack flickers.", weight: 2, minDay: 12, condition: () => activeSports(), autoOption: 1, options: [
    { id: "pay", label: "Pay $4,000 to stay live", summary: "The rights keep working.", effects: [{ type: "cash", value: -4000 }] },
    { id: "dark", label: "Go dark for a week", summary: "Sports stop boosting growth for 7 days.", effects: [{ type: "sports-pause", days: 7, label: "Sports blackout" }] },
  ] },
  { id: "tax", emoji: "🧾", title: "A pleasant accountant", description: "A credit you forgot to claim has been sitting in a folder named 'later'.", weight: 2, minDay: 15, autoOption: 0, options: [
    { id: "claim", label: "Claim it", summary: "A cash refund scaled to how long you have been open.", effects: [{ type: "tax" }] },
  ] },
  { id: "word", emoji: "🗣️", title: "Word of mouth", description: "People are recommending you without being paid, which feels like a magic trick.", weight: 2, minDay: 20, condition: () => state.brand >= 65, autoOption: 0, options: [
    { id: "listen", label: "Don't interrupt them", summary: "+20% growth for 20 days.", effects: [{ type: "growth", value: 1.2, days: 20, label: "Word of mouth" }] },
  ] },
  { id: "burst", emoji: "🖥️", title: "Burst capacity", description: "A server vendor will lend you a very fast cupboard for a few weeks.", weight: 2, minDay: 10, autoOption: 1, options: [
    { id: "rent", label: "Pay $2,000", summary: "Buffering penalty halves for 20 days.", effects: [{ type: "cash", value: -2000 }, { type: "servers", days: 20, label: "Burst servers" }] },
    { id: "no", label: "Make do", summary: "The spinner stays.", effects: [] },
  ] },
  { id: "limit-up", emoji: "🏦", title: "The bank likes the logo", description: "A cheerful letter offers a larger credit limit. The interest rate does not get kinder.", weight: 2, minDay: 20, autoOption: 0, options: [
    { id: "accept", label: "Take the room", summary: "Credit limit rises.", effects: [{ type: "credit-bonus", value: 20000 }] },
    { id: "no", label: "Stay as you are", summary: "No extra rope.", effects: [] },
  ] },
  { id: "limit-down", emoji: "📉", title: "The bank clears its throat", description: "Your limit is being trimmed. Highly borrowed services hear this first.", weight: 2, minDay: 25, condition: () => creditLimit() > 0 && Math.max(0, -state.cash) > creditLimit() * 0.45, autoOption: 0, options: [
    { id: "nod", label: "Sign the new terms", summary: "The credit limit drops.", effects: [{ type: "credit-bonus", value: -15000 }] },
  ] },
  { id: "wipe", emoji: "🧽", title: "An investor with a cloth", description: "They will clear the overdraft if you hand them a slice of daily revenue.", weight: 2, minDay: 18, condition: () => state.cash < -5000 && !state.revenueShare, autoOption: 1, options: [
    { id: "deal", label: "Clear the debt", summary: "Cash returns to zero. 6% of revenue leaves each day.", effects: [{ type: "clear-debt" }, { type: "share", cash: 0, value: 0.06 }] },
    { id: "keep", label: "Keep the debt", summary: "The overdraft stays. So does the whole pie.", effects: [] },
  ] },
  { id: "interview", emoji: "🎙️", title: "A very nice interview", description: "A cast member chats about the show and remembers everyone's name. The clip is kind.", weight: 3, minDay: 12, condition: () => titles.some((title) => title.status === "released"), autoOption: 0, options: [
    { id: "share", label: "Share the clip", summary: "+2 Brand and a little growth.", effects: [{ type: "brand", value: 2, reason: "Viral interview" }, { type: "growth", value: 1.12, days: 8, label: "Kind interview" }] },
  ] },
  { id: "buzz", emoji: "✨", title: "Awards buzz", description: "A fictional podcast says your newest title is 'in the conversation'. Nobody has won anything yet.", weight: 2, minDay: 20, condition: () => titles.some((title) => title.status === "released" && (title.critic || 0) >= 70), autoOption: 0, options: [
    { id: "smile", label: "Enjoy the rumour", summary: "+3 Brand.", effects: [{ type: "brand", value: 3, reason: "Awards buzz" }] },
  ] },
  { id: "rival-launch", emoji: "🚀", title: "A rival opens a new lane", description: "One of the other services just launched something loud. Borrowed money makes this sting more.", weight: 2, minDay: 30, autoOption: 0, options: [
    { id: "match", label: "Answer with marketing", summary: "Spend $3,000 or sit through a growth dip. The dip is worse in debt.", effects: [{ type: "cash", value: -3000 }, { type: "growth", value: 1.08, days: 12, label: "Answered the launch" }] },
    { id: "wait", label: "Let them have the week", summary: "Growth cools. It cools harder if you are highly in debt.", effects: [{ type: "debt-dip" }] },
  ] },
  { id: "device", emoji: "📺", title: "A new rectangle, again", description: "Shops are full of a gadget that plays video. Your app either fits or it doesn't.", weight: 2, minDay: 16, autoOption: 0, options: [
    { id: "ship", label: "Rush a build ($2,500)", summary: "Growth bump if you already have the mobile app.", effects: [{ type: "cash", value: -2500 }, { type: "tech" }] },
    { id: "later", label: "Ship it next month", summary: "No spend. A small brand sigh if the app is missing.", effects: [{ type: "tech" }] },
  ] },
];

function eventWeight(event) {
  if (state.day < (event.minDay || 0)) return 0;
  if (event.condition && !event.condition()) return 0;
  let weight = event.weight || 1;
  const ratio = creditLimit() > 0 ? Math.max(0, -state.cash) / creditLimit() : 0;
  if ((event.id === "war" || event.id === "rival-launch") && ratio > 0.4) weight *= 1.8;
  if (event.id === "war" && rivals.length) {
    const avg = rivals.reduce((sum, rival) => sum + rival.price, 0) / rivals.length;
    if (state.monthlyPrice < avg - (econ().cheapWarGap || 3)) weight *= 2;
  }
  return weight;
}

function maybeEvent() {
  if (!difficulty().events || blocking) return;
  if (state.day < state.nextEventDay) return;
  if (state.day - state.lastEventDay < 10) return;
  let pool = EVENTS.map((event) => ({ event, w: eventWeight(event) })).filter((item) => item.w > 0 && !state.recentEvents.includes(item.event.id));
  if (!pool.length) {
    pool = EVENTS.map((event) => ({ event, w: eventWeight(event) })).filter((item) => item.w > 0);
  }
  if (!pool.length) {
    state.nextEventDay = state.day + 5;
    return;
  }
  const total = pool.reduce((sum, item) => sum + item.w, 0);
  let roll = random() * total;
  let chosen = pool[pool.length - 1].event;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= pool[i].w;
    if (roll <= 0) {
      chosen = pool[i].event;
      break;
    }
  }
  state.lastEventDay = state.day;
  state.eventDays.push(state.day);
  state.recentEvents.unshift(chosen.id);
  state.recentEvents = state.recentEvents.slice(0, 8);
  const diff = difficulty();
  state.nextEventDay = state.day + diff.eventMin + rollInt(diff.eventSpan);
  presentEvent(chosen);
}

function presentEvent(event) {
  if (simOffline || !hasUi()) {
    applyOption(event, event.options[event.autoOption || 0]);
    return;
  }
  activeEvent = event;
  enqueuePrompt({ type: "event", event });
}

function diagnose() {
  const expiring = titles.find((title) => title.kind === "licensed" && title.status === "released" && title.contractDays > 0 && title.contractDays <= 14);
  const view = snapshot();
  if (state.cash < 0) return { problem: "The service is in debt.", tip: "Interest is daily. Debt only helps if the purchase earns more than it costs." };
  if (state.monthlyPrice <= 3) return { problem: "The price is very low.", tip: "Every subscriber costs money to serve. A slightly higher price can be the sweet spot." };
  if (state.monthlyPrice >= 16) return { problem: "The price is high.", tip: "Growth and brand both cool above $15. Step down gradually." };
  if (expiring) return { problem: `${expiring.name} expires in ${expiring.contractDays} days.`, tip: "Renew it, or commission something in that genre before the quality walks out." };
  if (view.churnRate > 0.01) return { problem: "Churn is high.", tip: "A lower price, more recommendations, or a hit will slow the exits." };
  if (state.brand < 35) return { problem: "The brand is dented.", tip: "A hit, an award, or a week without scandals will lift it." };
  if (!titles.some((title) => title.status === "producing") && view.contentQuality < 3) return { problem: "The catalogue is thin.", tip: "Commission into whichever genre is trending before freshness fades." };
  return { problem: "Nothing is on fire.", tip: "Look at the price chart and the trending chip before the next commission." };
}

function bestTitle() {
  let best = null;
  titles.forEach((title) => {
    const contribution = titleContribution(title);
    if (!best || contribution > best.contribution) best = { name: title.name, contribution };
  });
  return best && best.contribution > 0 ? best.name : "No standout title";
}

function maybeWeekly() {
  if (state.day === 0 || state.day % 30 !== 0) return;
  const recent = analytics.slice(-30);
  const profit = recent.reduce((sum, row) => sum + (row.profit != null ? row.profit : row.revenue - row.costs), 0);
  const interest = recent.reduce((sum, row) => sum + (row.interest || 0), 0);
  const then = history.length > 30 ? history[history.length - 31] : history[0];
  const valueThen = recent.length && recent[0].value != null ? recent[0].value : companyValue();
  const report = {
    profit,
    interest,
    valueChange: companyValue() - valueThen,
    subChange: paidSubscribers() - then,
    best: bestTitle(),
    ...diagnose(),
  };
  if (simOffline || !hasUi()) {
    if (!offlineNotes.includes("A 30-day report was filed.")) offlineNotes.push("A 30-day report was filed.");
    return;
  }
  enqueuePrompt({ type: "weekly", report });
}

const ACHIEVEMENTS = [
  { id: "first-hit", name: "First Hit", hint: "Release a hit.", test: () => state.hitCount >= 1 },
  { id: "out-of-red", name: "Out of the Red", hint: "Climb back to positive cash.", test: () => state.sawNegativeCash && state.cash >= 0 },
  { id: "five-genres", name: "5 Genres", hint: "Have five genres on the service.", test: () => releasedGenres().size >= 5 },
  { id: "beat-rival", name: "Beat a Rival", hint: "Pass a rival on the leaderboard.", test: () => state.beatRival },
  { id: "price-war", name: "Survive a Price War", hint: "Face a price war.", test: () => state.survivedPriceWar },
  { id: "club-10k", name: "10K Club", hint: "Reach 10,000 subscribers.", test: () => paidSubscribers() >= 10000 },
  { id: "club-100k", name: "100K Club", hint: "Reach 100,000 subscribers.", test: () => paidSubscribers() >= 100000 },
  { id: "club-1m", name: "1M Club", hint: "Reach 1,000,000 subscribers.", test: () => paidSubscribers() >= 1000000 },
  { id: "millionaire", name: "Cash Millionaire", hint: "Hold $1,000,000.", test: () => state.cash >= 1000000 },
  { id: "global", name: "Global", hint: "Unlock every region.", test: () => REGIONS.every((def) => state.regions[def.id].unlocked) },
  { id: "brand-icon", name: "Brand Icon", hint: "Reach Brand 90.", test: () => state.brand >= 90 },
  { id: "comeback", name: "Comeback Kid", hint: "Recover from below -$20,000.", test: () => state.sawDeepRed && state.cash >= 0 },
  { id: "no-flops", name: "No Flops", hint: "Release 10 originals without a flop.", test: () => state.releaseCount >= 10 && state.flopCount === 0 },
  { id: "sports-fan", name: "Sports Fan", hint: "Sign sports rights.", test: () => state.sportsSigned },
  { id: "speed-run", name: "Speed Run", hint: "Win in under 400 days.", test: () => state.status === "won" && state.day < 400 },
  { id: "rejected-buyout", name: "Rejected the Buyout", hint: "Turn down a rival's offer.", test: () => state.rejectedBuyout },
  { id: "first-release", name: "First Release", hint: "Release an original.", test: () => state.releaseCount >= 1 },
  { id: "passport", name: "Passport", hint: "Unlock a second region.", test: () => REGIONS.filter((def) => state.regions[def.id].unlocked).length >= 2 },
  { id: "premium", name: "Premium Bet", hint: "Release a premium original.", test: () => titles.some((title) => title.tier === "premium" && title.status === "released") },
  { id: "full-shelf", name: "Full Shelf", hint: "Have 10 titles on the service.", test: () => titles.filter((title) => title.status === "released").length >= 10 },
  { id: "critics-darling", name: "Critics' Darling", hint: "Release a critics' darling.", test: () => state.criticsDarling },
  { id: "star-maker", name: "Star Maker", hint: "Score a hit with a rising star.", test: () => state.risingStarHit },
  { id: "big-spender", name: "Big Spender", hint: "Make a first purchase on credit.", test: () => state.boughtOnCredit },
  { id: "debt-free", name: "Debt Free", hint: "Clear $50,000 of debt.", test: () => (state.debtRepaid || 0) >= 50000 },
  { id: "danger", name: "Living Dangerously", hint: "Touch 90% of the credit limit and climb back.", test: () => state.touchedHighCredit && state.cash >= 0 },
  { id: "blockbuster", name: "Blockbuster Library", hint: "Own 5 titles rated 8.0 or better.", test: () => titles.filter((title) => title.status === "released" && (title.tmdbVote || 0) >= 8).length >= 5 },
  { id: "star-studded", name: "Star Studded", hint: "Cast 3 A-list actors.", test: () => (state.aListCast || 0) >= 3 },
  { id: "local-hero", name: "Local Hero", hint: "Release a hit local original in every unlocked region beyond home.", test: () => REGIONS.filter((def) => def.id !== "uk" && state.regions[def.id].unlocked).every((def) => state.localHits && state.localHits[def.id]) && REGIONS.some((def) => def.id !== "uk" && state.regions[def.id].unlocked) },
  { id: "sweet-spot", name: "Sweet Spot", hint: "Stay profitable for 90 days between $6 and $12.", test: () => (state.sweetStreak || 0) >= 90 },
];

function checkAchievements() {
  if (state.cash < 0) state.sawNegativeCash = true;
  if (state.cash < -20000) state.sawDeepRed = true;
  ACHIEVEMENTS.forEach((achievement) => {
    if (achievements.has(achievement.id) || !achievement.test()) return;
    achievements.add(achievement.id);
    toast(`Trophy: ${achievement.name}`);
    pushEvent(state.day, [{ text: `Trophy unlocked: ${achievement.name}. +1% growth.`, tone: "up" }], "events");
  });
}

function computeScore() {
  const subs = paidSubscribers();
  const speedBonus = state.status === "won" ? Math.max(0, 800 - state.day) : 0;
  let score = subs * 0.02 + Math.max(0, state.cash) * 0.01 + state.brand * 50 + achievements.size * 400 + speedBonus;
  if (state.status === "sold") score = subs * 0.01 + Math.max(0, state.cash) * 0.005 + state.brand * 20 + 2500;
  return Math.round(score);
}

function readScores() {
  if (typeof localStorage === "undefined") return {};
  try {
    const data = JSON.parse(localStorage.getItem(SCORE_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch (err) {
    return {};
  }
}

function scoreBucket() {
  if (state.sandbox && state.difficulty !== "sandbox") return "sandbox";
  return state.difficulty;
}

function recordScore() {
  if (state.scoreSaved || typeof localStorage === "undefined") return;
  const all = readScores();
  const bucket = scoreBucket();
  const list = Array.isArray(all[bucket]) ? all[bucket] : [];
  list.push({
    score: computeScore(),
    day: state.day,
    subs: Math.round(paidSubscribers()),
    cash: Math.round(state.cash),
    brand: Math.round(state.brand),
  });
  list.sort((a, b) => b.score - a.score);
  all[bucket] = list.slice(0, 5);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(all));
  } catch (err) {
    // Ignore a blocked store.
  }
  state.scoreSaved = true;
}

function finishRun() {
  recordScore();
  stop();
  saveGame();
  if (hasUi()) showEndScreen();
}

function applyNumbers(before, offline) {
  const eff = offline ? 0.55 : 1;
  distribute(before.incoming * eff);
  shed(before.leaving * eff);
  state.freeUsers = roundSubscribers(Math.max(0, (state.freeUsers || 0) + before.netFree * eff));
  state.cash = roundCents(state.cash + before.netCash * eff);
  state.subscribers = paidSubscribers();
}

function tick(options) {
  const offline = !!(options && options.offline);
  const shouldLog = !options || options.log !== false;
  if (!state || state.status !== "playing") return snapshot();
  if (blocking && !offline) return snapshot();
  const previousOffline = simOffline;
  simOffline = offline;
  state.day += 1;
  if (state.priceHikeDays > 0) state.priceHikeDays -= 1;
  decayEffects();
  advanceProductions();
  advanceContracts();
  const before = snapshot();
  const playerBefore = before.subscribers;
  const cashBefore = state.cash;
  applyNumbers(before, offline);
  if (cashBefore < 0 && state.cash > cashBefore) {
    state.debtRepaid = (state.debtRepaid || 0) + Math.min(-cashBefore, state.cash - cashBefore);
  }
  if (before.netCash > 0) {
    state.profitableStreak = (state.profitableStreak || 0) + 1;
    if (state.monthlyPrice >= 6 && state.monthlyPrice <= 12) state.sweetStreak = (state.sweetStreak || 0) + 1;
    else state.sweetStreak = 0;
  } else {
    state.profitableStreak = 0;
    state.sweetStreak = 0;
  }
  state.profitHistory = state.profitHistory || [];
  state.profitHistory.push(before.netCash);
  if (state.profitHistory.length > 90) state.profitHistory.shift();
  const debt = Math.max(0, -state.cash);
  const limit = creditLimit();
  if (limit > 0 && debt > limit * 0.8) state.highCreditDays = (state.highCreditDays || 0) + 1;
  else state.highCreditDays = 0;
  if (limit > 0 && debt > limit * 0.9) state.touchedHighCredit = true;
  if (!offline && debt > limit * ((CONFIG.credit || {}).warnRatio || 0.8)) {
    if (!state.creditWarned) {
      state.creditWarned = true;
      toast("Credit is nearly used up.");
    }
  } else if (debt < limit * 0.7) state.creditWarned = false;
  tickRivals(playerBefore);
  growMarkets();
  if (state.day % 60 === 0) driftTrends();
  driftBrand(before);
  history.push(Math.round(paidSubscribers()));
  if (history.length > MAX_HISTORY) history.shift();
  analytics.push({
    revenue: before.dailyRevenue,
    costs: before.dailyCosts,
    churn: before.churnRate,
    profit: before.netCash,
    value: before.companyValue,
    cash: state.cash,
    debt: Math.max(0, -state.cash),
    interest: before.interest || 0,
  });
  if (analytics.length > 90) analytics.shift();
  checkEndings();
  checkMilestones(paidSubscribers());
  checkAchievements();
  if (state.status === "playing") {
    maybeEvent();
    maybeWeekly();
  }
  const after = snapshot();
  if (shouldLog && !offline && state.speed === 1) logDay(before, after);
  if (state.status !== "playing") finishRun();
  else if (hasUi() && !offline) renderTick(before, after);
  simOffline = previousOffline;
  return after;
}

function offlineDayLimit() {
  const seconds = Number(CONFIG.secondsPerDay) || 5;
  return Math.max(1, Math.floor(300 / seconds));
}

function missedDays(savedAt) {
  const seconds = Number(CONFIG.secondsPerDay) || 5;
  const elapsed = Math.max(0, (Date.now() - (savedAt || Date.now())) / 1000);
  return Math.max(0, Math.min(offlineDayLimit(), Math.floor(elapsed / seconds)));
}

function catchUp(days) {
  const startCash = state.cash;
  const startSubs = paidSubscribers();
  const before = new Set(achievements);
  offlineNotes = [];
  const count = Math.max(0, Math.min(offlineDayLimit(), Math.floor(days)));
  for (let i = 0; i < count && state.status === "playing"; i += 1) tick({ log: false, offline: true });
  return {
    days: count,
    cash: state.cash - startCash,
    subs: paidSubscribers() - startSubs,
    notes: offlineNotes.slice(0, 8),
    achievements: [...achievements].filter((id) => !before.has(id)),
  };
}

function checkMilestones(total) {
  MILESTONES.forEach((milestone) => {
    if (milestone.win || total < milestone.at || milestonesSeen.has(milestone.id)) return;
    milestonesSeen.add(milestone.id);
    pushEvent(state.day, [{ text: `Reached ${milestone.name}.`, tone: "up" }], "events");
    if (hasUi() && !simOffline && state.status === "playing") enqueuePrompt({ type: "milestone", milestone });
  });
  if (state.status === "won") milestonesSeen.add("global");
}

function logIntro() {
  console.log(`${displayName()} is open on ${difficulty().name}. Cash ${formatCash(state.cash)}, subscribers ${formatSubscribers(paidSubscribers())}.`);
}

function logDay(before, after) {
  console.log(`${displayName()} Day ${after.day} Cash ${formatCash(after.cash)} (${formatSignedMoney(before.netCash)}) Subs ${formatSubscribers(after.subscribers)} (${formatSignedNumber(before.netPaid, 2)})`);
}

function dayLengthMs() {
  const seconds = Number(CONFIG.secondsPerDay) || 5;
  const speed = Math.max(1, state && state.speed ? state.speed : 1);
  return (seconds * 1000) / speed;
}

function clockHeld() {
  const hidden = typeof document !== "undefined" && document.hidden;
  return !state || state.status !== "playing" || state.paused || hidden || blocking || welcomeHold || menuDepth > 0 || guideOpen;
}

function start() {
  if (timerId !== null || clockHeld()) return;
  if (!hasUi()) return;
  lastClockNow = performance.now();
  timerId = requestAnimationFrame(onClockFrame);
}

function stop() {
  if (timerId === null) return;
  cancelAnimationFrame(timerId);
  timerId = null;
}

function onClockFrame(now) {
  timerId = null;
  if (clockHeld()) return;
  let delta = now - lastClockNow;
  lastClockNow = now;
  if (!Number.isFinite(delta) || delta < 0) delta = 0;
  const length = dayLengthMs();
  if (delta > length) delta = length;
  dayFraction += length ? delta / length : 0;
  if (dayFraction >= 1) {
    dayFraction -= 1;
    if (dayFraction > 1) dayFraction = 0;
    tick();
  }
  paintDayProgress();
  paintGlide();
  if (!clockHeld()) timerId = requestAnimationFrame(onClockFrame);
}

function paintDayProgress() {
  const fill = document.getElementById("day-fill");
  const bar = document.getElementById("day-progress");
  if (!fill || !bar) return;
  const progress = clamp(dayFraction, 0, 1);
  fill.style.width = `${progress * 100}%`;
  const held = !state || state.paused || (typeof document !== "undefined" && document.hidden) || blocking || welcomeHold || menuDepth > 0 || guideOpen;
  bar.classList.toggle("is-paused", !!held);
}

function paintGlide() {
  if (!glide || !hasUi()) return;
  const t = clamp(dayFraction, 0, 1);
  const cashEl = document.getElementById("cash-value");
  const subsEl = document.getElementById("subs-value");
  const hero = document.getElementById("hero-subs");
  if (cashEl) renderCash(cashEl, glide.cashFrom + (glide.cashTo - glide.cashFrom) * t);
  const subs = glide.subsFrom + (glide.subsTo - glide.subsFrom) * t;
  if (subsEl) renderSubscribers(subsEl, subs);
  if (hero) hero.textContent = formatSubscribers(subs);
}

function setSpeed(value) {
  if (!state) return;
  if (value === 0) {
    state.paused = true;
  } else {
    state.paused = false;
    state.speed = value;
  }
  stop();
  start();
  paintSpeed();
  syncPauseOverlay();
  saveGame();
}

function syncPauseOverlay() {
  if (typeof document === "undefined") return;
  const overlay = document.getElementById("pause-overlay");
  if (!overlay) return;
  const gate = document.getElementById("gate");
  const onGate = gate && !gate.hidden;
  const ended = state && (state.status === "won" || state.status === "lost" || state.status === "sold");
  const show = !!(state && state.status === "playing" && state.paused && !onGate && !ended && !guideOpen);
  overlay.hidden = !show;
  paintDayProgress();
}

function beginGame(difficultyId) {
  stop();
  dayFraction = 0;
  blocking = false;
  welcomeHold = false;
  menuDepth = 0;
  promptQueue = [];
  guideOpen = false;
  resetProgress(difficultyId || "normal");
  if (hasUi()) {
    hideStart();
    syncPauseOverlay();
    resetUi();
    if (!settings.tutorialDismissed) openTutorial(0);
  }
  logIntro();
  saveGame();
  start();
  startAutosave();
  return snapshot();
}

function returnToMenu() {
  stop();
  resetProgress("normal");
  state.status = "menu";
  state.paused = false;
  draft = { difficulty: "normal", sandbox: false, name: "" };
  guideOpen = false;
  clearSave();
  if (hasUi()) {
    resetUi();
    syncPauseOverlay();
    showTitle();
  }
  return snapshot();
}

function reset() {
  return returnToMenu();
}

function setMonthlyPrice(price, options) {
  const next = Number(price);
  if (!Number.isFinite(next)) return state.monthlyPrice;
  const previous = state.monthlyPrice;
  state.monthlyPrice = clamp(roundCents(next), MIN_MONTHLY_PRICE, MAX_MONTHLY_PRICE);
  const quiet = options && options.quiet;
  if (!quiet) {
    const anchor = state.priceAnchor == null ? previous : state.priceAnchor;
    if (state.monthlyPrice - anchor > (econ().hikeThreshold || 2)) {
      state.priceHikeDays = econ().hikeDays || 14;
      pushEvent(state.day, [{ text: "A sharp price rise shook the base. Churn spikes for 14 days.", tone: "warn" }], "money");
    }
    state.priceAnchor = state.monthlyPrice;
  }
  if (previous <= 15 && state.monthlyPrice > 15) changeBrand(-1, "Price above $15");
  syncView();
  if (!options || !options.quiet) {
    const view = snapshot();
    console.log(`${SERVICE_NAME} price ${formatPrice(state.monthlyPrice)}. Growth: ${view.growthLabel} / Churn: ${view.churnLabel}.`);
  }
  return state.monthlyPrice;
}

function setContentQuality(quality) {
  const next = Number(quality);
  if (!Number.isFinite(next)) return currentQuality();
  qualityOverride = Math.max(0, next);
  syncView();
  return qualityOverride;
}

function setMarketingMultiplier(multiplier) {
  const next = Number(multiplier);
  if (!Number.isFinite(next)) return currentMarketing();
  marketingOverride = Math.max(0, next);
  syncView();
  return marketingOverride;
}

function setContentUpkeep(upkeep) {
  const next = Number(upkeep);
  if (!Number.isFinite(next)) return currentUpkeep();
  upkeepOverride = Math.max(0, roundCents(next));
  syncView();
  return upkeepOverride;
}

function openingEvent() {
  const diffName = state ? difficulty().name : "Normal";
  const cash = state ? state.cash : DIFFICULTIES.normal.cash;
  const name = state ? displayName() : SERVICE_NAME;
  return {
    day: 0,
    category: "events",
    parts: [{ text: `${name} is open on ${diffName}. ${formatSubscribers(STARTING_SUBSCRIBERS)} subscribers, ${formatCash(cash)} cash.`, tone: "neutral" }],
  };
}

function pushEvent(day, parts, category) {
  uiEvents.unshift({ day, category: category || "events", parts });
  if (uiEvents.length > MAX_LOG_ENTRIES) uiEvents.length = MAX_LOG_ENTRIES;
  renderLog();
}

function serialize() {
  return {
    version: 4,
    state,
    owned,
    titles,
    rivals,
    effects,
    analytics,
    history,
    milestones: [...milestonesSeen],
    achievements: [...achievements],
    events: uiEvents,
    titleSerial,
    savedAt: Date.now(),
  };
}

function saveGame() {
  if (typeof localStorage === "undefined" || !state || state.status === "setup" || state.status === "menu") return;
  state.savedAt = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize()));
  } catch (err) {
    // Ignore a full store.
  }
}

function clearSave() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY_V1);
  } catch (err) {
    // Ignore.
  }
}

function ensureLegacyDeals() {
  const addLegacy = (id) => {
    const def = LICENSES[id];
    if (!def || titles.some((title) => title.licenseId === id)) return;
    titles.push({
      id: `t${titleSerial}`,
      name: def.title || def.name,
      genre: def.genre,
      kind: "licensed",
      tier: "license",
      status: "released",
      quality: def.quality,
      upkeep: def.upkeep,
      cost: def.cost,
      outcome: "licensed",
      releaseDay: state.day || 0,
      contractDays: def.days,
      contractLength: def.days,
      licenseId: id,
    });
    titleSerial += 1;
    state.licenseGeneration[id] = Math.max(1, state.licenseGeneration[id] || 0);
  };
  if (owned.movies) addLegacy("movies");
  if (owned.sports) {
    addLegacy("sports");
    state.sportsSigned = true;
  }
}

function applyLoaded(data) {
  state = data.state;
  state.regions = state.regions || createRegions();
  state.genreTrends = { ...defaultTrends(), ...(state.genreTrends || {}) };
  state.licenseGeneration = { movies: 0, sports: 0, ...(state.licenseGeneration || {}) };
  state.recentEvents = state.recentEvents || [];
  state.eventDays = state.eventDays || [];
  state.freeUsers = Number.isFinite(state.freeUsers) ? state.freeUsers : 0;
  state.serviceName = typeof state.serviceName === "string" && state.serviceName.trim() ? state.serviceName.trim().slice(0, 24) : SERVICE_NAME;
  state.sandbox = !!state.sandbox || state.difficulty === "sandbox";
  if (!Number.isFinite(state.speed) || state.speed < 1) state.speed = 1;
  state.profitHistory = Array.isArray(state.profitHistory) ? state.profitHistory : [];
  state.profitableStreak = state.profitableStreak || 0;
  state.sweetStreak = state.sweetStreak || 0;
  state.empireHold = state.empireHold || 0;
  state.localHits = state.localHits || {};
  state.creditBonus = state.creditBonus || 0;
  state.debtRepaid = state.debtRepaid || 0;
  state.priceAnchor = Number.isFinite(state.priceAnchor) ? state.priceAnchor : state.monthlyPrice;
  state.adTier = !!state.adTier;
  state.aListCast = state.aListCast || 0;
  if (!data.version || data.version < 4) state.migratedFrom = data.version || 1;
  owned = { ...emptyOwned(), ...(data.owned || {}) };
  titles = Array.isArray(data.titles) ? data.titles : [];
  rivals = Array.isArray(data.rivals) ? data.rivals : createRivals(difficulty());
  effects = Array.isArray(data.effects) ? data.effects : [];
  analytics = Array.isArray(data.analytics) ? data.analytics : [];
  history = Array.isArray(data.history) && data.history.length ? data.history.slice(-MAX_HISTORY) : [Math.round(paidSubscribers())];
  milestonesSeen = new Set(data.milestones || []);
  achievements = new Set(data.achievements || []);
  titleSerial = data.titleSerial || titles.length + 1;
  if (!data.version || data.version < 4) ensureLegacyDeals();
  uiEvents = Array.isArray(data.events) && data.events.length ? data.events.slice(0, MAX_LOG_ENTRIES) : [openingEvent()];
  MILESTONES.forEach((milestone) => {
    if (paidSubscribers() >= milestone.at) milestonesSeen.add(milestone.id);
  });
}

function migrateV1(data) {
  const fresh = createInitialState("normal");
  const previous = data.state || {};
  fresh.day = previous.day || 0;
  fresh.cash = previous.cash;
  fresh.monthlyPrice = previous.monthlyPrice || STARTING_MONTHLY_PRICE;
  fresh.freeUsers = previous.freeUsers || 0;
  fresh.daysBelowLoseLine = previous.daysBelowLoseLine || 0;
  fresh.status = previous.status || "playing";
  fresh.regions.uk.subscribers = previous.subscribers || STARTING_SUBSCRIBERS;
  fresh.subscribers = fresh.regions.uk.subscribers;
  const oldOwned = data.owned || {};
  const converted = {
    state: fresh,
    owned: {
      social: oldOwned.social || 0,
      tv: oldOwned.tv || 0,
      app: oldOwned.app || 0,
      recommendations: oldOwned.recommendations || 0,
      "free-tier": oldOwned["free-tier"] || 0,
      servers: oldOwned.servers || 0,
    },
    titles: [],
    rivals: createRivals(DIFFICULTIES.normal),
    effects: [],
    analytics: [],
    history: data.history || [Math.round(fresh.subscribers)],
    milestones: data.milestones || [],
    achievements: [],
    events: data.events || [],
    titleSerial: 1,
  };
  state = fresh;
  titles = [];
  titleSerial = 1;
  const addCopies = (count, genre, tier) => {
    for (let i = 0; i < count; i += 1) {
      const budget = BUDGETS[tier];
      const title = {
        id: `t${titleSerial}`,
        name: nextTitleName(genre),
        genre,
        kind: "original",
        tier,
        status: "released",
        daysLeft: 0,
        totalDays: budget.days,
        quality: budget.quality,
        upkeep: budget.upkeep,
        cost: budget.cost,
        outcome: "average",
        releaseDay: fresh.day,
        contractDays: 0,
        licenseId: null,
      };
      titles.push(title);
      converted.titles.push(title);
      titleSerial += 1;
      fresh.releaseCount += 1;
    }
  };
  addCopies(oldOwned.sitcom || 0, "Comedy", "low");
  addCopies(oldOwned.drama || 0, "Drama", "premium");
  if (oldOwned.movies) {
    converted.titles.push({
      id: `t${titleSerial}`,
      name: LICENSES.movies.title,
      genre: "Documentary",
      kind: "licensed",
      tier: "license",
      status: "released",
      quality: LICENSES.movies.quality,
      upkeep: LICENSES.movies.upkeep,
      cost: LICENSES.movies.cost,
      outcome: "licensed",
      releaseDay: fresh.day,
      contractDays: LICENSES.movies.days,
      licenseId: "movies",
    });
    titleSerial += 1;
    fresh.licenseGeneration.movies = 1;
  }
  if (oldOwned.sports) {
    fresh.sportsSigned = true;
    converted.titles.push({
      id: `t${titleSerial}`,
      name: LICENSES.sports.title,
      genre: "Sport",
      kind: "licensed",
      tier: "license",
      status: "released",
      quality: LICENSES.sports.quality,
      upkeep: LICENSES.sports.upkeep,
      cost: LICENSES.sports.cost,
      outcome: "licensed",
      releaseDay: fresh.day,
      contractDays: LICENSES.sports.days,
      licenseId: "sports",
    });
    titleSerial += 1;
    fresh.licenseGeneration.sports = 1;
  }
  converted.titleSerial = titleSerial;
  converted.state = fresh;
  return converted;
}

function loadGame() {
  if (typeof localStorage === "undefined") return false;
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_V1);
  } catch (err) {
    return false;
  }
  if (!raw) return false;
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return false;
  }
  if (!data || !data.state || !Number.isFinite(data.state.cash) || !Number.isFinite(data.state.subscribers)) return false;
  if (data.version === 1 || data.state && !data.state.regions) data = migrateV1(data);
  if (!data.state.regions) return false;
  applyLoaded(data);
  return true;
}

function startAutosave() {
  if (saveTimer !== null || typeof localStorage === "undefined" || !hasUi()) return;
  saveTimer = setInterval(saveGame, SAVE_EVERY_MS);
}

function debugFire(id) {
  const event = EVENTS.find((item) => item.id === id);
  if (!event || state.status !== "playing") return false;
  state.lastEventDay = state.day;
  state.eventDays.push(state.day);
  presentEvent(event);
  return true;
}

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

function holdClock() {
  menuDepth += 1;
  stop();
  syncPauseOverlay();
}

function releaseClock() {
  menuDepth = Math.max(0, menuDepth - 1);
  start();
  syncPauseOverlay();
}

function enqueuePrompt(prompt) {
  promptQueue.push(prompt);
  pumpPrompts();
}

function pumpPrompts() {
  if (!hasUi() || blocking || !promptQueue.length) {
    if (!blocking && !welcomeHold && menuDepth === 0) start();
    syncPauseOverlay();
    return;
  }
  blocking = true;
  stop();
  const prompt = promptQueue.shift();
  if (prompt.type === "event") openEvent(prompt.event);
  else if (prompt.type === "renew") openRenewals([prompt.titleId]);
  else if (prompt.type === "renewals") openRenewals(prompt.ids);
  else if (prompt.type === "weekly") openWeekly(prompt.report);
  else if (prompt.type === "milestone") openMilestone(prompt.milestone);
  else if (prompt.type === "review") openReview(prompt);
}

function dismissBlock() {
  blocking = false;
  ["event-modal", "renew-modal", "weekly-modal", "milestone-modal"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  pumpPrompts();
}

function topOverlay() {
  if (!hasUi()) return null;
  const nodes = Array.from(document.querySelectorAll(".overlay")).filter((el) => !el.hidden);
  return nodes.length ? nodes[nodes.length - 1] : null;
}

function closeOverlay(overlay) {
  if (!overlay) return;
  const id = overlay.id;
  if (id === "commission-modal") closeCommission();
  else if (id === "detail-modal" || id === "rival-modal") {
    overlay.hidden = true;
    releaseClock();
  } else if (id === "settings-modal") closeSettings();
  else if (id === "welcome-modal") {
    overlay.hidden = true;
    welcomeHold = false;
    start();
    syncPauseOverlay();
  } else if (id === "changelog-modal") overlay.hidden = true;
  else if (id === "event-modal" || id === "renew-modal" || id === "weekly-modal" || id === "milestone-modal") dismissBlock();
}

function syncModalLock() {
  if (typeof document === "undefined" || !document.body) return;
  const open = Array.from(document.querySelectorAll(".overlay")).some((el) => !el.hidden);
  document.body.classList.toggle("modal-open", open);
}

const overlayObserver = typeof MutationObserver === "undefined" ? null : new MutationObserver(syncModalLock);

function openMilestone(milestone) {
  setText("milestone-title", milestone.name);
  setText("milestone-line", milestone.line);
  const modal = document.getElementById("milestone-modal");
  if (modal) modal.hidden = false;
}

function openEvent(event) {
  activeEvent = event;
  setText("event-emoji", event.emoji);
  setText("event-title", event.title);
  setText("event-copy", event.description);
  const root = document.getElementById("event-options");
  root.replaceChildren();
  event.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.dataset.option = option.id;
    const name = document.createElement("strong");
    name.textContent = option.label;
    const summary = document.createElement("span");
    summary.textContent = option.summary;
    const cost = (option.effects || []).reduce((sum, effect) => sum + (effect.type === "cash" && effect.value < 0 ? -effect.value : 0), 0);
    if (cost && payKind(cost) === "over") {
      button.disabled = true;
      summary.textContent = "Over credit limit";
    } else if (cost && payKind(cost) === "credit") summary.textContent = `${option.summary} Balance after: ${formatCash(state.cash - cost)}.`;
    button.append(name, summary);
    root.append(button);
  });
  document.getElementById("event-modal").hidden = false;
}

function openRenewals(ids) {
  const root = document.getElementById("renew-list");
  const modal = document.getElementById("renew-modal");
  if (!root || !modal) return;
  setText("renew-title", ids.length > 1 ? "Renewals due" : "Renewal due");
  root.replaceChildren();
  ids.forEach((id) => {
    const title = titles.find((item) => item.id === id);
    if (!title || title.status !== "released") return;
    const row = document.createElement("div");
    row.className = "renew-row";
    const copy = document.createElement("p");
    const cost = renewalCost(title);
    const kind = payKind(cost);
    copy.textContent = `${title.name} · ${Math.max(0, title.contractDays)} days · ${formatCash(title.upkeep || 0)}/day · renew ${formatCash(cost)}`;
    const actions = document.createElement("div");
    actions.className = "modal-actions";
    const keep = document.createElement("button");
    keep.type = "button";
    keep.className = kind === "credit" ? "buy-button buy-credit" : "buy-button";
    keep.disabled = kind === "over";
    keep.textContent = kind === "over" ? "Over credit limit" : kind === "credit" ? "Renew on credit" : "Renew";
    keep.addEventListener("click", () => {
      if (!renewTitle(id)) return;
      row.remove();
      if (!root.children.length) dismissBlock();
    });
    const drop = document.createElement("button");
    drop.type = "button";
    drop.className = "reset-button";
    drop.textContent = "Let go";
    drop.addEventListener("click", () => {
      dropLicense(id);
      row.remove();
      if (!root.children.length) dismissBlock();
    });
    actions.append(keep, drop);
    row.append(copy, actions);
    root.append(row);
  });
  if (!root.children.length) {
    dismissBlock();
    return;
  }
  modal.hidden = false;
}

function openWeekly(report) {
  const root = document.getElementById("weekly-body");
  root.replaceChildren();
  [
    ["Profit, 30 days", formatCash(report.profit)],
    ["Interest paid", formatCash(report.interest || 0)],
    ["Subscribers", formatSignedNumber(report.subChange, 0)],
    ["Company value", formatCash(report.valueChange || 0)],
    ["Best title", report.best],
    ["Biggest problem", report.problem],
    ["Tip", report.tip],
  ].forEach(([label, value]) => {
    const row = document.createElement("p");
    row.className = "modal-line";
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(value));
    root.append(row);
  });
  document.getElementById("weekly-modal").hidden = false;
}

function showWelcome(summary) {
  if (!hasUi()) return;
  welcomeHold = true;
  stop();
  const root = document.getElementById("welcome-body");
  root.replaceChildren();
  const lines = [
    `${summary.days} in-game days passed at reduced efficiency.`,
    `Subscribers ${formatSignedNumber(summary.subs, 0)}. Cash ${formatSignedMoney(summary.cash)}.`,
  ];
  if (summary.achievements.length) lines.push(`Trophies: ${summary.achievements.map((id) => ACHIEVEMENTS.find((item) => item.id === id).name).join(", ")}.`);
  summary.notes.forEach((note) => lines.push(note));
  lines.forEach((line) => {
    const p = document.createElement("p");
    p.className = "modal-line";
    p.textContent = line;
    root.append(p);
  });
  document.getElementById("welcome-modal").hidden = false;
}

function hasSave() {
  if (typeof localStorage === "undefined") return false;
  try {
    return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY_V1));
  } catch (err) {
    return false;
  }
}

function formatRoundMillions(amount) {
  const n = Math.abs(Math.round(amount));
  if (n >= 1000000 && n % 1000000 === 0) return `${n / 1000000}M`;
  return formatSubscribers(n);
}

function empireTarget(id) {
  const table = CONFIG.empire || {};
  return table[id] || table.normal || { companyValue: 150000000, subscribers: 5000000 };
}

function guideDifficultyId() {
  if ((guideMode === "pause" || guideMode === "browse") && state && state.status === "playing" && state.difficulty) return state.difficulty;
  return draft.difficulty || "normal";
}

function guidePages() {
  const id = guideDifficultyId();
  const diff = DIFFICULTIES[id] || DIFFICULTIES.normal;
  const target = empireTarget(id);
  const hold = CONFIG.holdDays || 30;
  const value = `$${formatRoundMillions(target.companyValue)}`;
  const subs = formatRoundMillions(target.subscribers);
  const showing = guideMode === "browse" ? `Showing ${diff.name} targets. ` : "";
  return [
    {
      emoji: "🎯",
      title: "The goal",
      body: `${showing}Build a streaming empire on ${diff.name}. Hold all three for ${hold} days: Company Value ${value}, ${subs} subscribers, and a healthy business. Don't go bankrupt.`,
    },
    {
      emoji: "📊",
      title: "The top bar",
      body: "Cash is the money you have. Subscribers pay the monthly price. Day is the clock. Price is what you charge. Credit is how far you can go into debt. Brand is your reputation.",
    },
    {
      emoji: "💰",
      title: "Price",
      body: "A cheap price grows fast, but every subscriber costs money to serve, so profit gets thin. An expensive price grows slowly and raises churn. Raise the price gradually and find the sweet spot.",
    },
    {
      emoji: "🎬",
      title: "Content and cast",
      body: "Acquire a famous title, or create an original with real stars. Great titles and big names bring subscribers, and they cost more. Check the critic score and the audience score.",
    },
    {
      emoji: "💳",
      title: "Debt",
      body: "You can buy things on credit and grow faster. Interest is charged every day you are in debt. If you go past your credit limit, a bankruptcy countdown starts.",
    },
    {
      emoji: "🎲",
      title: "Events and rivals",
      body: "Random events and rival streamers will shake the business. Read the choices. A quick win can cost you later. Pick carefully.",
    },
    {
      emoji: "💡",
      title: "Tips",
      body: "Release something new regularly. Mix your genres so the catalogue stays broad. Use debt only when it earns more than it costs.",
    },
  ];
}

function showPanel(id) {
  const gate = document.getElementById("gate");
  if (!gate) return;
  gate.hidden = false;
  ["title-screen", "setup-screen", "guide-screen"].forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel) panel.hidden = panelId !== id;
  });
}

function fillStartScores() {
  const list = document.getElementById("start-scores");
  if (!list) return;
  const scores = readScores();
  list.replaceChildren();
  Object.keys(DIFFICULTIES).forEach((id) => {
    const best = (scores[id] || [])[0];
    if (!best) return;
    const item = document.createElement("li");
    item.textContent = `${DIFFICULTIES[id].name} best ${Math.round(best.score).toLocaleString("en-US")}`;
    list.append(item);
  });
}

function showTitle() {
  stop();
  guideOpen = false;
  const win = document.getElementById("win-screen");
  const lose = document.getElementById("lose-screen");
  if (win) win.hidden = true;
  if (lose) lose.hidden = true;
  if (CONFIG.tagline) setText("title-tagline", CONFIG.tagline);
  const cont = document.getElementById("continue-button");
  if (cont) cont.hidden = !hasSave();
  fillStartScores();
  showPanel("title-screen");
  syncPauseOverlay();
  ensureCatalogue();
}

function showStart() {
  showTitle();
}

function hideStart() {
  const gate = document.getElementById("gate");
  if (gate) gate.hidden = true;
  guideOpen = false;
}

function showSetup() {
  guideOpen = false;
  showPanel("setup-screen");
}

function rememberGuidePreference() {
  const box = document.getElementById("guide-dismiss");
  if (!box) return;
  settings.skipGuide = !!box.checked;
  saveSettings();
}

function ensureCatalogue() {
  if (!cataloguePromise) cataloguePromise = startCatalogue();
  return cataloguePromise;
}

function renderGuide() {
  const pages = guidePages();
  const page = pages[Math.min(guidePage, pages.length - 1)];
  setText("guide-emoji", page.emoji);
  setText("guide-title", page.title);
  setText("guide-body", page.body);
  const dots = document.getElementById("guide-dots");
  if (dots) {
    dots.replaceChildren();
    pages.forEach((item, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = index === guidePage ? "is-on" : "";
      dot.setAttribute("aria-label", item.title);
      dot.addEventListener("click", () => {
        guidePage = index;
        renderGuide();
      });
      dots.append(dot);
    });
  }
  const last = guidePage >= pages.length - 1;
  const back = document.getElementById("guide-back");
  const next = document.getElementById("guide-next");
  const skip = document.getElementById("guide-skip");
  const go = document.getElementById("guide-go");
  if (back) back.hidden = guidePage === 0 && guideMode !== "new";
  if (next) next.hidden = last;
  if (skip) {
    skip.hidden = false;
    skip.textContent = guideMode === "new" ? "Skip" : "Close";
  }
  if (go) {
    go.hidden = !last;
    if (guideMode === "new") {
      go.disabled = !catalogueReady;
      go.textContent = catalogueReady ? "Let's go!" : "Loading catalogue...";
    } else {
      go.disabled = false;
      go.textContent = "Close";
    }
  }
}

function openGuide(mode) {
  guideMode = mode;
  guidePage = 0;
  guideOpen = true;
  if (mode === "pause" && state && state.status === "playing") {
    wasPausedBeforeGuide = !!state.paused;
    if (!state.paused) setSpeed(0);
  }
  if (mode === "new") ensureCatalogue();
  const dismiss = document.getElementById("guide-dismiss");
  if (dismiss) dismiss.checked = !!settings.skipGuide;
  showPanel("guide-screen");
  renderGuide();
  syncPauseOverlay();
}

function closeGuide() {
  const mode = guideMode;
  rememberGuidePreference();
  guideOpen = false;
  if (mode === "pause") {
    hideStart();
    if (state && state.status === "playing" && !wasPausedBeforeGuide) setSpeed(state.speed || 1);
    else syncPauseOverlay();
    return;
  }
  if (mode === "browse") {
    showTitle();
    return;
  }
  showSetup();
}

function launchGame() {
  const name = (draft.name || "").trim().slice(0, 24);
  stop();
  dayFraction = 0;
  blocking = false;
  welcomeHold = false;
  menuDepth = 0;
  promptQueue = [];
  guideOpen = false;
  resetProgress(draft.difficulty || "normal");
  state.sandbox = !!draft.sandbox;
  state.serviceName = name || SERVICE_NAME;
  if (state.sandbox) state.nextEventDay = Infinity;
  state.status = "playing";
  state.paused = false;
  if (hasUi()) {
    hideStart();
    syncPauseOverlay();
    resetUi();
    if (!settings.tutorialDismissed) openTutorial(0);
  }
  logIntro();
  seedTrends();
  saveGame();
  start();
  startAutosave();
  if (state.migratedFrom) {
    toast("Your save was updated for the new studio.");
    state.migratedFrom = null;
  }
}

function requestLaunch() {
  rememberGuidePreference();
  if (!catalogueReady) {
    const go = document.getElementById("guide-go");
    const skip = document.getElementById("guide-skip");
    if (go) {
      go.disabled = true;
      go.textContent = "Loading catalogue...";
    }
    if (skip && guideMode === "new") skip.disabled = true;
    ensureCatalogue().then(() => {
      catalogueReady = true;
      if (skip) skip.disabled = false;
      if (guideOpen && guideMode === "new") launchGame();
    });
    return;
  }
  launchGame();
}

function continueGame() {
  if (!loadGame()) {
    showTitle();
    return;
  }
  guideOpen = false;
  hideStart();
  syncPauseOverlay();
  if (state.status === "playing") {
    const missed = missedDays(state.savedAt);
    state.paused = true;
    dayFraction = 0;
    resetUi();
    startAutosave();
    syncPauseOverlay();
    if (state.migratedFrom) {
      toast("Your save was updated for the new studio.");
      state.migratedFrom = null;
    }
    if (missed >= 1) {
      const summary = catchUp(missed);
      showWelcome(summary);
    }
    return;
  }
  resetUi();
  showEndScreen();
}

function stepGuide(delta) {
  const pages = guidePages();
  if (delta < 0 && guidePage === 0 && guideMode === "new") {
    rememberGuidePreference();
    showSetup();
    return;
  }
  guidePage = clamp(guidePage + delta, 0, pages.length - 1);
  renderGuide();
}

function showEndScreen() {
  hideStart();
  const overlay = typeof document !== "undefined" ? document.getElementById("pause-overlay") : null;
  if (overlay) overlay.hidden = true;
  const win = document.getElementById("win-screen");
  const lose = document.getElementById("lose-screen");
  if (!win || !lose) return;
  if (state.status === "won" || state.status === "sold") {
    lose.hidden = true;
    setText("win-heading", state.status === "sold" ? "Bought Out" : "Streaming Empire");
    setText("win-line", state.status === "sold" ? "A rival wrote the cheque. The catalogue is theirs now." : "Company value, subscribers, and a healthy business, held together.");
    fillEndStats("win-stats");
    setText("win-score", `Score ${computeScore().toLocaleString("en-US")}`);
    fillBoard("win-board");
    win.hidden = false;
    return;
  }
  if (state.status === "lost") {
    win.hidden = true;
    fillEndStats("lose-stats");
    setText("lose-score", `Score ${computeScore().toLocaleString("en-US")}`);
    fillBoard("lose-board");
    lose.hidden = false;
    return;
  }
  win.hidden = true;
  lose.hidden = true;
}

function fillBoard(id) {
  const root = document.getElementById(id);
  if (!root) return;
  root.replaceChildren();
  const list = readScores()[scoreBucket()] || [];
  list.forEach((entry, index) => {
    const item = document.createElement("li");
    item.textContent = `${index + 1}. ${Math.round(entry.score).toLocaleString("en-US")} · day ${entry.day} · ${formatSubscribers(entry.subs)}`;
    root.append(item);
  });
}

function fillEndStats(id) {
  const root = document.getElementById(id);
  if (!root) return;
  const view = snapshot();
  const rows = [
    ["Day", view.day.toLocaleString("en-US"), false],
    ["Subscribers", formatSubscribers(view.subscribers), false],
    ["Cash", formatCash(view.cash), view.cash < 0],
    ["Brand", String(Math.round(view.brand)), false],
    ["Company value", formatCash(view.companyValue || 0), false],
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

function paintSpeed() {
  [["speed-pause", state.paused], ["speed-1", !state.paused && state.speed === 1], ["speed-2", !state.paused && state.speed === 2], ["speed-4", !state.paused && state.speed === 4]].forEach(([id, on]) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
    if (id === "speed-pause") button.textContent = state.paused ? "Resume" : "Pause";
  });
}

function paint(view) {
  const name = displayName();
  document.querySelectorAll(".js-service-name").forEach((el) => {
    el.textContent = name;
  });
  applyVersionChrome();
  glide = {
    cashFrom: view.cash,
    cashTo: view.cash,
    subsFrom: view.subscribers,
    subsTo: view.subscribers,
  };
  const cashEl = setText("cash-value", formatCash(view.cash));
  if (cashEl) cashEl.classList.toggle("is-negative", view.cash < 0);
  setText("subs-value", formatSubscribers(view.subscribers));
  setText("day-value", view.day.toLocaleString("en-US"));
  setText("price-value", formatPrice(view.monthlyPrice));
  setText("price-outlook", `Growth: ${view.growthLabel} / Churn: ${view.churnLabel}`);
  paintSlider(view.monthlyPrice);
  setText("tier-name", tierName(view.subscribers));
  setText("mode-label", difficulty().name);
  setText("variety-note", view.variety);
  setText("quality-value", formatQuality(view.contentQuality));
  setText("revenue-value", `$${Math.abs(view.dailyRevenue).toFixed(2)}`);
  setText("costs-value", `$${Math.abs(view.dailyCosts).toFixed(2)}`);
  const churnBits = `${(view.churnRate * 100).toFixed(2)}%`;
  const churnEl = document.getElementById("churn-value");
  if (churnEl) {
    churnEl.replaceChildren();
    const rate = document.createElement("span");
    rate.className = "churn-rate";
    rate.textContent = churnBits;
    const note = document.createElement("span");
    note.className = "churn-note";
    note.textContent = view.bufferingChurn >= 0.001 ? `${view.churnLabel} · buffering` : view.churnLabel;
    churnEl.append(rate, note);
  }
  const split = document.getElementById("audience-split");
  if (split) {
    const showSplit = view.freeUsers > 0 || ownedCount("free-tier") > 0;
    split.hidden = !showSplit;
    split.textContent = showSplit ? `Paid ${formatSubscribers(view.subscribers)} · Free ${formatSubscribers(view.freeUsers)}` : "";
  }
  const fill = document.getElementById("brand-fill");
  if (fill) {
    fill.style.width = `${clamp(view.brand, 0, 100)}%`;
    fill.classList.toggle("is-low", view.brand < 35);
    fill.classList.toggle("is-high", view.brand >= 70);
  }
  setText("brand-value", String(Math.round(view.brand)));
  renderCredit(view);
  renderHero(view);
  renderEmpire(view);
  renderChips(view);
  renderTrend();
  updateUpgradeCards(view);
  renderLibrary();
  renderRegions();
  renderLeaderboard();
  renderTrophies();
  if (currentTab === "analytics") renderAnalytics();
  paintSpeed();
  showEndScreen();
}

function renderChips(view) {
  const root = document.getElementById("effect-chips");
  if (!root) return;
  root.replaceChildren();
  view.effects.forEach((effect) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `${effect.label} · ${Math.max(0, effect.days)}d`;
    root.append(chip);
  });
}

function renderTrend() {
  const chip = document.getElementById("trend-chip");
  if (!chip) return;
  const trending = trendingGenre();
  chip.hidden = !trending;
  if (trending) chip.textContent = `Trending: ${trending.genre} ${trending.value.toFixed(2)}×`;
}

function paintSlider(price) {
  const slider = document.getElementById("price-slider");
  if (!slider) return;
  if (document.activeElement !== slider) slider.value = String(price);
  const current = Number(slider.value);
  const pct = ((current - MIN_MONTHLY_PRICE) / (MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE)) * 100;
  slider.style.setProperty("--fill", `${pct}%`);
}

function updateUpgradeCards(view) {
  UPGRADES.forEach((upgrade) => {
    const card = document.querySelector(`[data-upgrade="${upgrade.id}"]`);
    if (!card) return;
    const count = upgrade.action === "library" ? ownedMoviePacks() : ownedCount(upgrade.id);
    let cost = upgrade.action === "commission" ? 0 : upgradeCost(upgrade);
    const live = upgrade.action === "license" && activeLicense(upgrade.id);
    const soldOut = upgrade.action === "library" && !nextMoviePack();
    const needsSlot = (upgrade.action === "license" || upgrade.action === "library") && !live && !soldOut && libraryFull();
    const kind = upgrade.action === "commission" || live || soldOut || needsSlot ? "cash" : payKind(cost);
    const blocked = view.status !== "playing" || live || soldOut || needsSlot || kind === "over";
    card.classList.toggle("is-unaffordable", blocked && upgrade.action !== "commission");
    const costEl = card.querySelector(".upgrade-cost");
    if (costEl) {
      const next = upgrade.action === "library" ? nextMoviePack() : null;
      if (upgrade.action === "commission") costEl.textContent = "Acquire or create";
      else if (needsSlot) costEl.textContent = `${slotsUsed()} / ${librarySlots()} slots`;
      else if (live || soldOut) costEl.textContent = "Owned";
      else if (next) costEl.textContent = `${next.name} · ${formatCash(cost)} · after ${formatCash(state.cash - cost)}`;
      else costEl.textContent = `${formatCash(cost)} · after ${formatCash(state.cash - cost)}`;
    }
    const badge = card.querySelector(".owned-badge");
    if (badge) {
      badge.hidden = count <= 0 && !live;
      badge.textContent = live || soldOut ? "Owned" : `x${count}`;
    }
    const button = card.querySelector(".buy-button");
    if (button) {
      button.disabled = blocked && upgrade.action !== "commission";
      button.classList.toggle("buy-credit", kind === "credit" && !live && !soldOut);
      if (upgrade.action === "commission") button.textContent = "Open";
      else if (live || soldOut) button.textContent = "Owned";
      else if (needsSlot) button.textContent = "Library full";
      else if (kind === "over") button.textContent = "Over credit limit";
      else if (kind === "credit") button.textContent = "Buy on credit";
      else button.textContent = "Buy";
    }
  });
}

function titleBucket(title) {
  if (title.genre === "Sport") return "sports";
  if (title.kind === "original") return "originals";
  if (title.series || title.mediaType === "tv") return "series";
  return "movies";
}

function titleScore(title) {
  if (title.critic || title.audience) return (title.critic || 0) + (title.audience || 0);
  return Math.round((title.tmdbVote || 0) * 10);
}

function renderLibrary() {
  const root = document.getElementById("posters");
  const empty = document.getElementById("library-empty");
  const meta = document.getElementById("library-meta");
  if (!root) return;
  const active = titles.filter((title) => title.status === "producing" || title.status === "released");
  const expiring = active.filter((title) => title.kind === "licensed" && title.contractDays > 0 && title.contractDays <= 10);
  const upkeep = active.reduce((sum, title) => sum + (title.status === "released" ? title.upkeep || 0 : 0), 0);
  if (meta) meta.textContent = `${slotsUsed()} / ${librarySlots()} slots · upkeep ${formatCash(upkeep)}/day · ${expiring.length} expiring soon`;
  let visible = active.filter((title) => libraryFilter === "all" || titleBucket(title) === libraryFilter);
  visible.sort((a, b) => {
    if (librarySort === "expiring") return (a.kind === "licensed" ? a.contractDays : 9999) - (b.kind === "licensed" ? b.contractDays : 9999);
    if (librarySort === "scores") return titleScore(b) - titleScore(a);
    if (librarySort === "upkeep") return (b.upkeep || 0) - (a.upkeep || 0);
    return (b.releaseDay || state.day) - (a.releaseDay || state.day);
  });
  if (empty) {
    empty.hidden = visible.length > 0;
    empty.textContent = active.length ? "Nothing in this filter." : "No titles yet.";
  }
  root.replaceChildren();
  visible.forEach((title) => {
    const tile = document.createElement("article");
    tile.className = "poster";
    tile.dataset.title = title.id;
    tile.style.background = GENRE_GRADIENTS[title.genre] || GENRE_GRADIENTS.Drama;
    if (title.poster_path) {
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = posterUrl(title.poster_path);
      img.addEventListener("error", () => img.remove());
      tile.append(img);
    }
    if (title.status === "producing") tile.classList.add("is-producing");
    const soon = title.kind === "licensed" && title.contractDays > 0 && title.contractDays <= 10;
    if (soon) {
      const badge = document.createElement("span");
      badge.className = "poster-badge expiring";
      badge.textContent = `${title.contractDays}d`;
      tile.append(badge);
    }
    const tag = title.outcome === "hit" ? "HIT!" : title.outcome === "flop" ? "FLOP" : title.outcome === "darling" ? "DARLING" : title.outcome === "guilty" ? "GUILTY" : "";
    if (tag && !soon) {
      const badge = document.createElement("span");
      badge.className = `poster-badge ${title.outcome === "flop" ? "flop" : "hit"}`;
      badge.textContent = tag;
      tile.append(badge);
    }
    const name = document.createElement("p");
    name.className = "poster-title";
    name.textContent = title.name;
    const line = document.createElement("p");
    line.className = "poster-genre";
    if (title.status === "producing") line.textContent = `${Math.max(0, title.daysLeft)}d left`;
    else if (title.kind === "licensed") line.textContent = `${Math.max(0, title.contractDays)}d left`;
    else line.textContent = title.genre;
    tile.append(name, line);
    root.append(tile);
  });
}

function renderRegions() {
  const root = document.getElementById("region-list");
  if (!root || currentTab !== "regions") return;
  root.replaceChildren();
  REGIONS.forEach((def) => {
    const region = state.regions[def.id];
    const card = document.createElement("article");
    card.className = "info-card";
    const title = document.createElement("h3");
    title.textContent = def.name;
    const rival = rivals.find((item) => item.id === def.rival);
    const rivalName = rival ? rival.name : def.localName || "Local apps";
    const body = document.createElement("p");
    const share = region.tam > 0 ? Math.round((region.subscribers / region.tam) * 1000) / 10 : 0;
    body.textContent = region.unlocked
      ? `${formatSubscribers(region.subscribers)} subs · ${share}% of the local market · favourite ${def.favourite} · rival ${rivalName}${rival ? ` (${formatSubscribers(rival.subscribers)})` : ""}`
      : `Locked · favourite ${def.favourite} · unlock ${formatCash(def.unlock)}`;
    card.append(title, body);
    if (region.unlocked && !region.localised && def.localise > 0) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "buy-button";
      button.dataset.localise = def.id;
      const localKind = payKind(def.localise);
      button.classList.toggle("buy-credit", localKind === "credit");
      button.textContent = localKind === "over" ? "Over credit limit" : localKind === "credit" ? `Localise on credit ${formatCash(def.localise)}` : `Localise ${formatCash(def.localise)}`;
      button.disabled = localKind === "over" || state.status !== "playing";
      card.append(button);
    } else if (!region.unlocked) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "buy-button";
      button.dataset.unlock = def.id;
      const unlockKind = payKind(def.unlock);
      button.classList.toggle("buy-credit", unlockKind === "credit");
      button.textContent = unlockKind === "over" ? "Over credit limit" : unlockKind === "credit" ? `Unlock on credit ${formatCash(def.unlock)}` : `Unlock ${formatCash(def.unlock)}`;
      button.disabled = unlockKind === "over" || state.status !== "playing";
      card.append(button);
    } else {
      const note = document.createElement("p");
      note.textContent = region.localised ? "Localised. Full growth." : "Home region.";
      card.append(note);
    }
    root.append(card);
  });
}

function leaderboardRows() {
    const rows = [{ id: "player", name: displayName(), color: "#E50914", subs: paidSubscribers(), player: true, history }];
  rivals.forEach((rival) => rows.push({ id: rival.id, name: rival.name, color: rival.color, subs: rival.subscribers, player: false, history: rival.history }));
  rows.sort((a, b) => b.subs - a.subs);
  const total = rows.reduce((sum, row) => sum + row.subs, 0) || 1;
  return rows.map((row, index) => {
    const then = row.history.length > 30 ? row.history[row.history.length - 31] : row.history[0] || row.subs;
    return { ...row, rank: index + 1, change: row.subs - then, share: row.subs / total };
  });
}

function renderLeaderboard() {
  const root = document.getElementById("leaderboard");
  if (!root || currentTab !== "rivals") return;
  root.replaceChildren();
  leaderboardRows().forEach((row) => {
    const card = document.createElement("article");
    card.className = row.player ? "info-card is-player" : "info-card";
    if (!row.player) card.dataset.rival = row.id;
    const title = document.createElement("h3");
    const dot = document.createElement("span");
    dot.className = "badge-dot";
    dot.style.background = row.color;
    title.append(dot, document.createTextNode(`${row.rank}. ${row.name}`));
    const change = row.change > 1 ? `▲ ${formatSubscribers(row.change)}` : row.change < -1 ? `▼ ${formatSubscribers(Math.abs(row.change))}` : "– flat";
    const body = document.createElement("p");
    body.textContent = `${formatSubscribers(row.subs)} · 30 days ${change}`;
    const bar = document.createElement("div");
    bar.className = "share-bar";
    const span = document.createElement("span");
    span.style.width = `${Math.max(2, row.share * 100)}%`;
    span.style.background = row.color;
    bar.append(span);
    card.append(title, body, bar);
    root.append(card);
  });
}

function renderTrophies() {
  const root = document.getElementById("trophy-list");
  if (!root || currentTab !== "trophies") return;
  root.replaceChildren();
  ACHIEVEMENTS.forEach((achievement) => {
    const unlocked = achievements.has(achievement.id);
    const card = document.createElement("article");
    card.className = unlocked ? "trophy" : "trophy is-locked";
    const mark = document.createElement("div");
    mark.className = "trophy-mark";
    mark.textContent = "🏆";
    const title = document.createElement("h3");
    title.textContent = achievement.name;
    const hint = document.createElement("p");
    hint.textContent = unlocked ? `${achievement.hint} Reward: +1% growth.` : `${achievement.hint} Reward: +1% growth.`;
    card.append(mark, title, hint);
    root.append(card);
  });
}

function contentRows() {
  const view = snapshot();
  const total = view.titles.reduce((sum, title) => sum + title.contribution, 0) + 1;
  return view.titles.map((title) => ({
    title: title.name,
    poster: title.poster_path || "",
    genre: title.genre,
    scores: title.critic ? `${title.critic}/${title.audience}` : "–",
    status: title.status === "producing" ? "In production" : title.outcome === "hit" ? "HIT" : title.outcome === "flop" ? "Flop" : title.outcome === "darling" ? "Darling" : title.outcome === "guilty" ? "Guilty pleasure" : title.outcome === "licensed" ? "Licensed" : title.status === "expired" ? "Expired" : title.status === "pulled" ? "Pulled" : "Average",
    cost: title.cost || 0,
    revenue: total > 0 ? view.dailyRevenue * title.contribution / total : 0,
  }));
}

function renderAnalytics() {
  drawLines(document.getElementById("chart-revenue"), [
    { color: "#2ECC71", values: analytics.map((row) => row.revenue) },
    { color: "#FF4D4F", values: analytics.map((row) => row.costs) },
  ]);
  drawLines(document.getElementById("chart-value"), [
    { color: "#C46BFF", values: analytics.map((row) => row.value || 0) },
  ]);
  drawCashChart(document.getElementById("chart-cash"));
  drawLines(document.getElementById("chart-churn"), [
    { color: "#E50914", values: analytics.map((row) => row.churn) },
  ]);
  drawRegionBar(document.getElementById("chart-regions"));
  drawSweetSpot(document.getElementById("chart-sweet"));
  const body = document.getElementById("content-body");
  if (!body) return;
  const rows = contentRows().sort((a, b) => {
    const dir = tableSort.dir;
    if (tableSort.key === "cost" || tableSort.key === "revenue") return (a[tableSort.key] - b[tableSort.key]) * dir;
    return String(a[tableSort.key] || "").localeCompare(String(b[tableSort.key] || "")) * dir;
  });
  body.replaceChildren();
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const thumb = document.createElement("td");
    if (row.poster) {
      const img = document.createElement("img");
      img.className = "table-poster";
      img.alt = "";
      img.loading = "lazy";
      img.src = posterUrl(row.poster);
      img.addEventListener("error", () => img.remove());
      thumb.append(img);
    }
    tr.append(thumb);
    [row.title, row.genre, row.scores, formatCash(row.cost), formatSignedMoney(row.revenue).replace("+", "")].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      tr.append(cell);
    });
    body.append(tr);
  });
}

function drawRegionBar(canvas) {
  if (!canvas) return;
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;
  const { width, height } = ctx._size;
  ctx.clearRect(0, 0, width, height);
  const segments = REGIONS.map((def) => ({ color: def.color, value: state.regions[def.id].subscribers || 0 })).filter((segment) => segment.value > 0);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let x = 8;
  const usable = width - 16;
  segments.forEach((segment) => {
    const w = usable * (segment.value / total);
    ctx.fillStyle = segment.color;
    ctx.fillRect(x, height / 2 - 10, Math.max(2, w), 20);
    x += w;
  });
}

function drawSweetSpot(canvas) {
  if (!canvas) return;
  const prices = [];
  for (let price = 2; price <= 20; price += 1) prices.push(price);
  const values = prices.map((price) => estimateProfit(price));
  drawLines(canvas, [{ color: "#F5A623", values }]);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width;
  const index = clamp(Math.round(state.monthlyPrice) - 2, 0, prices.length - 1);
  const x = 10 + (index / (prices.length - 1)) * (width - 20);
  ctx.strokeStyle = "#E50914";
  ctx.beginPath();
  ctx.moveTo(x, 8);
  ctx.lineTo(x, (rect.height || 88) - 8);
  ctx.stroke();
}

function estimateProfit(price) {
  const projected = forecast(price);
  const horizon = econ().subscriberHorizonValue || 36;
  const growth = projected.netPaid * horizon;
  if (projected.netCash < 0) return projected.netCash * 30 + Math.min(0, growth);
  return projected.netCash + growth;
}

function prepareCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width || canvas.width || 100);
  const height = Math.max(1, rect.height || canvas.height || 80);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx._size = { width, height };
  return ctx;
}

function drawLines(canvas, seriesList) {
  if (!canvas || !hasUi()) return;
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;
  const { width, height } = ctx._size;
  ctx.clearRect(0, 0, width, height);
  const values = seriesList.flatMap((series) => series.values);
  if (!values.length) return;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = Math.max(0.0001, max - min);
  seriesList.forEach((series) => {
    if (!series.values.length) return;
    ctx.beginPath();
    series.values.forEach((value, index) => {
      const x = series.values.length === 1 ? width / 2 : 8 + (index / (series.values.length - 1)) * (width - 16);
      const y = height - 8 - ((value - min) / span) * (height - 16);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = series.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawChart() {
  const canvas = document.getElementById("subscriber-chart");
  if (!canvas) return;
  const ctx = prepareCanvas(canvas);
  if (!ctx) return;
  const { width, height } = ctx._size;
  const series = history.length ? history : [STARTING_SUBSCRIBERS];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const points = series.map((value, index) => {
    const x = series.length === 1 ? width / 2 : 10 + (index / (series.length - 1)) * (width - 20);
    const y = min === max ? height / 2 : height - 10 - ((value - min) / span) * (height - 20);
    return [x, y];
  });
  if (points.length > 1) {
    ctx.beginPath();
    points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(points[points.length - 1][0], height - 1);
    ctx.lineTo(points[0][0], height - 1);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(229, 9, 20, 0.38)");
    gradient.addColorStop(1, "rgba(229, 9, 20, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = "#E50914";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = "#E50914";
    ctx.beginPath();
    ctx.arc(points[0][0], points[0][1], 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderLog() {
  if (typeof document === "undefined") return;
  const list = document.getElementById("event-log");
  if (!list) return;
  list.replaceChildren();
  uiEvents.filter((event) => logFilter === "all" || event.category === logFilter).forEach((event) => {
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
}

function toast(text) {
  if (simOffline) {
    offlineNotes.push(text);
    return;
  }
  if (!hasUi()) return;
  const root = document.getElementById("toasts");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = text;
  root.append(item);
  window.setTimeout(() => item.remove(), 3200);
  return item;
}

function fillPosterBox(box, path, genre) {
  if (!box) return;
  box.replaceChildren();
  box.style.background = GENRE_GRADIENTS[genre] || GENRE_GRADIENTS.Drama;
  if (!path) return;
  const img = document.createElement("img");
  img.alt = "";
  img.src = posterUrl(path);
  img.addEventListener("error", () => img.remove());
  box.append(img);
}

function openDetail(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return;
  holdClock();
  setText("detail-title", title.name);
  fillPosterBox(document.getElementById("detail-poster"), title.poster_path, title.genre);
  const root = document.getElementById("detail-body");
  root.replaceChildren();
  const list = document.createElement("dl");
  list.className = "detail-list";
  const rows = [
    ["Genre", title.genre],
    ["Status", title.status === "producing" ? "In production" : title.outcome === "hit" ? "HIT" : title.outcome === "flop" ? "Flop" : title.outcome === "licensed" ? "Licensed" : title.status],
    ["Release day", title.releaseDay == null ? "Not yet" : `Day ${title.releaseDay}`],
    ["Freshness", `${Math.round(freshnessOf(title) * 100)}%`],
    ["Daily upkeep", formatCash(title.status === "released" ? title.upkeep : title.plannedUpkeep || 0)],
  ];
  if (title.critic) rows.push(["Scores", `Critics ${title.critic} · Audience ${title.audience}`]);
  if (title.cast && title.cast.length) rows.push(["Cast", title.cast.map((actor) => actor.name).join(", ")]);
  if (title.overview) rows.push(["Overview", title.overview]);
  if (title.kind === "licensed") rows.push(["Contract", `${Math.max(0, title.contractDays)} days left`]);
  if (title.status === "producing") rows.push(["Days left", String(Math.max(0, title.daysLeft))]);
  rows.forEach(([label, value]) => {
    const wrap = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    wrap.append(term, detail);
    list.append(wrap);
  });
  root.append(list);
  const foot = document.getElementById("detail-foot");
  if (foot) {
    foot.replaceChildren();
    if (title.kind === "original" && title.series && title.status === "released" && title.outcome !== "flop") {
      const cost = seasonCost(title);
      const button = document.createElement("button");
      button.type = "button";
      button.className = payKind(cost) === "credit" ? "buy-button buy-credit" : "buy-button";
      button.disabled = payKind(cost) === "over" || libraryFull();
      button.textContent = libraryFull() ? "Library full" : payKind(cost) === "over" ? "Over credit limit" : `New season ${formatCash(cost)}`;
      button.addEventListener("click", () => {
        if (renewSeason(title.id)) {
          document.getElementById("detail-modal").hidden = true;
          releaseClock();
        }
      });
      foot.append(button);
    }
    const close = document.createElement("button");
    close.type = "button";
    close.className = "reset-button";
    close.textContent = "Close";
    close.addEventListener("click", () => {
      document.getElementById("detail-modal").hidden = true;
      releaseClock();
    });
    foot.append(close);
  }
  document.getElementById("detail-modal").hidden = false;
}

function openRival(id) {
  const rival = rivals.find((item) => item.id === id);
  if (!rival) return;
  holdClock();
  setText("rival-title", rival.name);
  setText("rival-blurb", rival.blurb);
  const root = document.getElementById("rival-body");
  root.replaceChildren();
  const p = document.createElement("p");
  p.className = "modal-line";
  p.textContent = `${formatSubscribers(rival.subscribers)} subscribers · ${formatPrice(rival.price)} · quality ${formatQuality(rival.quality)}`;
  root.append(p);
  document.getElementById("rival-modal").hidden = false;
  drawLines(document.getElementById("rival-spark"), [{ color: rival.color, values: rival.history }]);
}

function openCommission() {
  openStudio();
  return;
  if (!hasUi() || state.status !== "playing") return;
  holdClock();
  const genres = document.getElementById("genre-picks");
  const budgets = document.getElementById("budget-picks");
  genres.replaceChildren();
  budgets.replaceChildren();
  let pickedGenre = "";
  let pickedTier = "";
  const confirm = document.getElementById("commission-confirm");
  const refresh = () => {
    confirm.disabled = !pickedGenre || !pickedTier || state.cash < (BUDGETS[pickedTier] ? BUDGETS[pickedTier].cost : Infinity);
  };
  GENRES.forEach((genre) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick";
    const trend = state.genreTrends[genre] || 1;
    const strong = document.createElement("strong");
    strong.textContent = genre;
    const span = document.createElement("span");
    span.textContent = `${trend.toFixed(2)}× trend`;
    button.append(strong, span);
    button.addEventListener("click", () => {
      pickedGenre = genre;
      genres.querySelectorAll(".pick").forEach((el) => el.classList.remove("is-on"));
      button.classList.add("is-on");
      refresh();
    });
    genres.append(button);
  });
  Object.values(BUDGETS).forEach((budget) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick";
    const brandBonus = clamp((state.brand - 50) / 50, -1, 1) * 0.05;
    const strong = document.createElement("strong");
    strong.textContent = `${budget.name} · ${formatCash(budget.cost)}`;
    const span = document.createElement("span");
    span.textContent = `${budget.days} days · hit ${Math.round((budget.hit + brandBonus) * 100)}% · flop ${Math.round(budget.flop * 100)}% · quality ${budget.quality}`;
    button.append(strong, span);
    button.addEventListener("click", () => {
      pickedTier = budget.id;
      budgets.querySelectorAll(".pick").forEach((el) => el.classList.remove("is-on"));
      button.classList.add("is-on");
      refresh();
    });
    budgets.append(button);
  });
  confirm.onclick = () => {
    if (commission(pickedGenre, pickedTier)) closeCommission();
  };
  document.getElementById("commission-modal").hidden = false;
  refresh();
}

function closeCommission() {
  document.getElementById("commission-modal").hidden = true;
  releaseClock();
}

function openSettings() {
  holdClock();
  document.getElementById("settings-animations").checked = settings.animations !== false;
  document.getElementById("settings-modal").hidden = false;
}

function closeSettings() {
  document.getElementById("settings-modal").hidden = true;
  releaseClock();
}

function loadSettings() {
  const fresh = { animations: true, tutorialDismissed: false, skipGuide: false };
  if (typeof localStorage === "undefined") return fresh;
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      animations: data.animations !== false,
      tutorialDismissed: !!data.tutorialDismissed,
      skipGuide: !!data.skipGuide,
    };
  } catch (err) {
    return fresh;
  }
}

function saveSettings() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    // Ignore.
  }
  document.body.classList.toggle("reduce-motion", settings.animations === false);
}

function openTutorial(index) {
  tutorialIndex = index;
  const step = TUTORIAL[index];
  const card = document.getElementById("tutorial");
  document.querySelectorAll(".is-tutorial").forEach((el) => el.classList.remove("is-tutorial"));
  if (!step) {
    card.hidden = true;
    settings.tutorialDismissed = true;
    saveSettings();
    return;
  }
  const target = document.querySelector(step.selector);
  if (target) target.classList.add("is-tutorial");
  setText("tutorial-text", step.text);
  setText("tutorial-next", index === TUTORIAL.length - 1 ? "Done" : "Next");
  card.hidden = false;
  if (target) {
    const rect = target.getBoundingClientRect();
    let top = rect.bottom + 8;
    if (top + 150 > window.innerHeight) top = Math.max(8, rect.top - 150);
    card.style.top = `${top}px`;
    card.style.left = `${clamp(rect.left, 8, window.innerWidth - 320)}px`;
  }
}

function prefersReducedMotion() {
  if (settings.animations === false) return true;
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  const startTime = performance.now();
  function frame(now) {
    if (generation !== animationGeneration) return;
    const t = Math.min(1, (now - startTime) / 180);
    const eased = 1 - Math.pow(1 - t, 3);
    render(el, from + (to - from) * eased);
    if (t < 1) animators.set(id, requestAnimationFrame(frame));
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
  if (!el || direction === 0 || prefersReducedMotion()) return;
  el.classList.remove("flash-up", "flash-down");
  void el.offsetWidth;
  el.classList.add(direction > 0 ? "flash-up" : "flash-down");
  window.setTimeout(() => el.classList.remove("flash-up", "flash-down"), 700);
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
  }, 900));
}

function renderTick(before, after) {
  paint(after);
  glide = {
    cashFrom: before.cash,
    cashTo: after.cash,
    subsFrom: before.subscribers,
    subsTo: after.subscribers,
  };
  paintGlide();
  paintDayProgress();
  flashStat("cash-value", after.cash - before.cash);
  flashStat("subs-value", after.subscribers - before.subscribers);
  if (before.netCash !== 0) showDelta("cash-delta", formatSignedMoney(before.netCash), before.netCash > 0 ? "up" : "down");
  if (before.netPaid !== 0) showDelta("subs-delta", formatSignedNumber(before.netPaid, 2), before.netPaid > 0 ? "up" : "down");
  drawChart();
}

function syncView() {
  if (!hasUi()) return;
  paint(snapshot());
  drawChart();
}

function resetUi() {
  animationGeneration += 1;
  animators.forEach((frame) => cancelAnimationFrame(frame));
  animators.clear();
  if (!hasUi()) return;
  paint(snapshot());
  renderLog();
  drawChart();
}

function renderUpgradeList() {
  const root = document.getElementById("upgrade-list");
  if (!root) return;
  root.replaceChildren();
  let list = null;
  let group = "";
  UPGRADES.forEach((upgrade) => {
    if (upgrade.group !== group) {
      group = upgrade.group;
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      heading.className = "upgrade-group";
      heading.textContent = group;
      list = document.createElement("div");
      list.className = "upgrade-list";
      section.append(heading, list);
      root.append(section);
    }
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
    button.textContent = upgrade.action === "commission" ? "New" : "Buy";
    button.addEventListener("click", () => {
      if (upgrade.action === "commission") openCommission();
      else buyUpgrade(upgrade.id);
    });
    meta.append(cost, button);
    card.append(icon, copy, badge, meta);
    list.append(card);
  });
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

function showTab(name) {
  currentTab = name;
  document.querySelectorAll(".tab").forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.classList.toggle("is-on", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
  });
  ["home", "analytics", "regions", "rivals", "trophies"].forEach((id) => {
    const panel = document.getElementById(`panel-${id}`);
    if (panel) panel.hidden = id !== name;
  });
  syncView();
}

function exportSave() {
  saveGame();
  const blob = new Blob([localStorage.getItem(SAVE_KEY) || "{}"], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "streamco-save.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importSaveText(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return false;
  }
  if (!data || !data.state) return false;
  if (data.version === 1 || !data.state.regions) data = migrateV1(data);
  data.savedAt = Date.now();
  data.version = 4;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    return false;
  }
  if (!loadGame()) return false;
  resetUi();
  if (state.status === "playing") start();
  else showEndScreen();
  return true;
}

function bindUi() {
  if (uiBound || !hasUi()) return;
  uiBound = true;
  document.getElementById("reset-button").addEventListener("click", () => {
    if (window.confirm(`Reset ${SERVICE_NAME}? The current run will be lost.`)) returnToMenu();
  });
  document.getElementById("speed-pause").addEventListener("click", () => setSpeed(state.paused ? state.speed || 1 : 0));
  document.getElementById("speed-1").addEventListener("click", () => setSpeed(1));
  document.getElementById("speed-2").addEventListener("click", () => setSpeed(2));
  document.getElementById("speed-4").addEventListener("click", () => setSpeed(4));
  document.getElementById("settings-button").addEventListener("click", openSettings);
  document.getElementById("settings-close").addEventListener("click", closeSettings);
  document.getElementById("settings-animations").addEventListener("change", (event) => {
    settings.animations = event.target.checked;
    saveSettings();
  });
  document.getElementById("settings-tutorial").addEventListener("click", () => {
    settings.tutorialDismissed = false;
    saveSettings();
    closeSettings();
    openTutorial(0);
  });
  document.getElementById("settings-export").addEventListener("click", exportSave);
  document.getElementById("settings-import").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importSaveText(String(reader.result || ""));
    reader.readAsText(file);
  });
  document.getElementById("price-slider").addEventListener("input", (event) => setMonthlyPrice(event.target.value, { quiet: true }));
  document.getElementById("price-slider").addEventListener("change", (event) => {
    setMonthlyPrice(event.target.value);
    saveGame();
  });
  document.querySelector(".tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (tab) showTab(tab.dataset.tab);
  });
  const logFilters = document.querySelector('[aria-label="Log filter"]');
  if (logFilters) {
    logFilters.addEventListener("click", (event) => {
      const button = event.target.closest(".filter");
      if (!button) return;
      logFilter = button.dataset.filter;
      logFilters.querySelectorAll(".filter").forEach((el) => el.classList.toggle("is-on", el === button));
      renderLog();
    });
  }
  const libraryFilters = document.getElementById("library-filters");
  if (libraryFilters) {
    libraryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-library]");
      if (!button) return;
      libraryFilter = button.dataset.library;
      libraryFilters.querySelectorAll("[data-library]").forEach((el) => el.classList.toggle("is-on", el === button));
      renderLibrary();
    });
  }
  const librarySorts = document.getElementById("library-sorts");
  if (librarySorts) {
    librarySorts.addEventListener("click", (event) => {
      const button = event.target.closest("[data-libsort]");
      if (!button) return;
      librarySort = button.dataset.libsort;
      librarySorts.querySelectorAll("[data-libsort]").forEach((el) => el.classList.toggle("is-on", el === button));
      renderLibrary();
    });
  }
  document.getElementById("posters").addEventListener("click", (event) => {
    const tile = event.target.closest("[data-title]");
    if (tile) openDetail(tile.dataset.title);
  });
  document.getElementById("detail-close").addEventListener("click", () => {
    document.getElementById("detail-modal").hidden = true;
    releaseClock();
  });
  document.getElementById("region-list").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.unlock) unlockRegion(button.dataset.unlock);
    if (button.dataset.localise) localiseRegion(button.dataset.localise);
  });
  document.getElementById("leaderboard").addEventListener("click", (event) => {
    const card = event.target.closest("[data-rival]");
    if (card) openRival(card.dataset.rival);
  });
  document.getElementById("rival-close").addEventListener("click", () => {
    document.getElementById("rival-modal").hidden = true;
    releaseClock();
  });
  document.getElementById("content-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    if (tableSort.key === button.dataset.sort) tableSort.dir *= -1;
    else tableSort = { key: button.dataset.sort, dir: 1 };
    renderAnalytics();
  });
  document.getElementById("event-options").addEventListener("click", (event) => {
    const button = event.target.closest("[data-option]");
    if (!button || !activeEvent) return;
    const option = activeEvent.options.find((item) => item.id === button.dataset.option);
    const current = activeEvent;
    document.getElementById("event-modal").hidden = true;
    if (option) applyOption(current, option);
    dismissBlock();
  });
  document.getElementById("renew-close").addEventListener("click", dismissBlock);
  document.getElementById("event-close").addEventListener("click", dismissBlock);
  document.getElementById("milestone-close").addEventListener("click", dismissBlock);
  document.getElementById("weekly-close").addEventListener("click", dismissBlock);
  const weeklyX = document.getElementById("weekly-x");
  if (weeklyX) weeklyX.addEventListener("click", dismissBlock);
  document.getElementById("milestone-continue").addEventListener("click", dismissBlock);
  const rivalX = document.getElementById("rival-x");
  if (rivalX) rivalX.addEventListener("click", () => {
    document.getElementById("rival-modal").hidden = true;
    releaseClock();
  });
  const settingsX = document.getElementById("settings-x");
  if (settingsX) settingsX.addEventListener("click", closeSettings);
  const welcomeX = document.getElementById("welcome-x");
  if (welcomeX) welcomeX.addEventListener("click", () => {
    document.getElementById("welcome-modal").hidden = true;
    welcomeHold = false;
    start();
    syncPauseOverlay();
  });
  document.getElementById("welcome-close").addEventListener("click", () => {
    document.getElementById("welcome-modal").hidden = true;
    welcomeHold = false;
    start();
    syncPauseOverlay();
  });
  const whatsNew = document.getElementById("whats-new-button");
  if (whatsNew) whatsNew.addEventListener("click", openChangelog);
  const titleWhatsNew = document.getElementById("title-whats-new");
  if (titleWhatsNew) titleWhatsNew.addEventListener("click", openChangelog);
  const changelogClose = document.getElementById("changelog-close");
  if (changelogClose) changelogClose.addEventListener("click", () => { document.getElementById("changelog-modal").hidden = true; });
  const changelogDone = document.getElementById("changelog-done");
  if (changelogDone) changelogDone.addEventListener("click", () => { document.getElementById("changelog-modal").hidden = true; });
  document.getElementById("commission-cancel").addEventListener("click", closeCommission);
  document.getElementById("win-again").addEventListener("click", returnToMenu);
  document.getElementById("lose-again").addEventListener("click", returnToMenu);
  document.getElementById("difficulty-grid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-difficulty]");
    if (!card) return;
    draft.difficulty = card.dataset.difficulty;
    document.querySelectorAll("#difficulty-grid .diff-card").forEach((el) => {
      el.classList.toggle("is-on", el === card);
    });
  });
  document.getElementById("start-game").addEventListener("click", showSetup);
  document.getElementById("continue-button").addEventListener("click", continueGame);
  document.getElementById("title-help").addEventListener("click", () => openGuide("browse"));
  document.getElementById("setup-back").addEventListener("click", showTitle);
  document.getElementById("setup-next").addEventListener("click", () => {
    const selected = document.querySelector("#difficulty-grid .diff-card.is-on");
    draft.difficulty = selected ? selected.dataset.difficulty : draft.difficulty;
    draft.sandbox = !!document.getElementById("sandbox-toggle").checked;
    draft.name = document.getElementById("service-name").value || "";
    if (settings.skipGuide && catalogueReady) launchGame();
    else if (settings.skipGuide) {
      openGuide("new");
      guidePage = guidePages().length - 1;
      renderGuide();
      requestLaunch();
    } else openGuide("new");
  });
  document.getElementById("guide-back").addEventListener("click", () => stepGuide(-1));
  document.getElementById("guide-next").addEventListener("click", () => stepGuide(1));
  document.getElementById("guide-skip").addEventListener("click", () => {
    if (guideMode === "new") requestLaunch();
    else closeGuide();
  });
  document.getElementById("guide-go").addEventListener("click", () => {
    if (guideMode === "new") requestLaunch();
    else closeGuide();
  });
  document.getElementById("guide-dismiss").addEventListener("change", rememberGuidePreference);
  document.getElementById("help-button").addEventListener("click", () => {
    if (state && state.status === "playing") openGuide("pause");
    else openGuide("browse");
  });
  document.getElementById("resume-button").addEventListener("click", () => setSpeed(state.speed || 1));
  document.getElementById("tutorial-next").addEventListener("click", () => openTutorial(tutorialIndex + 1));
  document.getElementById("tutorial-skip").addEventListener("click", () => openTutorial(TUTORIAL.length));
  document.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlay(overlay);
    });
    if (overlayObserver) overlayObserver.observe(overlay, { attributes: true, attributeFilter: ["hidden"] });
  });
  syncModalLock();
  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.closest ? event.target.closest("input, textarea, button") : null;
    if (event.key === "Escape") {
      const overlay = topOverlay();
      if (overlay) closeOverlay(overlay);
      else if (guideOpen) closeGuide();
      return;
    }
    if (guideOpen) return;
    const gate = document.getElementById("gate");
    if (gate && !gate.hidden) return;
    if (tag) return;
    if (event.key === " " || event.code === "Space") {
      event.preventDefault();
      if (!blocking && menuDepth === 0 && state.status === "playing") setSpeed(state.paused ? state.speed || 1 : 0);
    } else if (event.key === "1") setSpeed(1);
    else if (event.key === "2") setSpeed(2);
    else if (event.key === "3" || event.key === "4") setSpeed(4);
  });
  const chart = document.getElementById("subscriber-chart");
  if (chart && typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(chart);
  }
  window.addEventListener("pagehide", saveGame);
  document.addEventListener("visibilitychange", () => {
    if (!state || state.status !== "playing") return;
    if (document.hidden) {
      saveGame();
      stop();
      paintDayProgress();
      return;
    }
    start();
    paintDayProgress();
    syncPauseOverlay();
  });
  hookStudioUi();
}

function gameVersion() {
  return (CONFIG && CONFIG.gameVersion) || "3.4";
}

function releaseDateLabel() {
  const raw = (CONFIG && CONFIG.releaseDate) || "2026-10-01";
  const parts = String(raw).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[(Number(parts[1]) || 1) - 1] || "Oct";
  return `${Number(parts[2]) || 1} ${month} ${parts[0] || "2026"}`;
}

function applyVersionChrome() {
  if (typeof document === "undefined") return;
  const version = gameVersion();
  document.title = `StreamCo v${version}`;
  document.querySelectorAll(".js-version").forEach((el) => {
    el.textContent = `v${version}`;
  });
  document.querySelectorAll(".js-version-date").forEach((el) => {
    el.textContent = `v${version} - ${releaseDateLabel()}`;
  });
  const about = document.getElementById("about-version");
  if (about) about.textContent = `StreamCo v${version} · ${releaseDateLabel()}`;
}

function announceVersion() {
  const version = gameVersion();
  let seen = "";
  try {
    seen = localStorage.getItem("streamco_last_version") || "";
  } catch (err) {
    seen = version;
  }
  if (seen === version) return;
  try {
    localStorage.setItem("streamco_last_version", version);
  } catch (err) {
    // Ignore private mode.
  }
  const item = toast(`Updated to v${version} - What's new`);
  if (item) item.addEventListener("click", openChangelog);
}

function openChangelog() {
  const root = document.getElementById("changelog-list");
  const modal = document.getElementById("changelog-modal");
  if (!root || !modal) return;
  const notes = (typeof window !== "undefined" && window.STREAMCO_CHANGELOG) || [];
  root.replaceChildren();
  notes.forEach((entry, index) => {
    const block = document.createElement("details");
    block.open = index === 0;
    const summary = document.createElement("summary");
    summary.textContent = `v${entry.version} · ${entry.date}`;
    block.append(summary);
    ["added", "changed", "fixed"].forEach((key) => {
      const items = entry[key] || [];
      if (!items.length) return;
      const heading = document.createElement("h3");
      heading.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      const list = document.createElement("ul");
      items.forEach((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        list.append(item);
      });
      block.append(heading, list);
    });
    root.append(block);
  });
  modal.hidden = false;
}

function mountUi() {
  if (!hasUi()) return;
  bindUi();
  renderUpgradeList();
  saveSettings();
  applyVersionChrome();
  announceVersion();
  resetUi();
}

let catalogue = {
  ready: false,
  offline: false,
  images: { secure_base_url: "https://image.tmdb.org/t/p/" },
  titles: [],
  actors: [],
  shelves: {},
  hot: {},
  errors: [],
  map: {},
};
let studio = null;

function posterUrl(path) {
  if (!path) return "";
  if (String(path).indexOf("http") === 0) return path;
  const base = (catalogue.images && catalogue.images.secure_base_url) || "https://image.tmdb.org/t/p/";
  return `${base}${((CONFIG.tmdb || {}).posterSize) || "w342"}${path}`;
}

function profileUrl(path) {
  if (!path) return "";
  if (String(path).indexOf("http") === 0) return path;
  const base = (catalogue.images && catalogue.images.secure_base_url) || "https://image.tmdb.org/t/p/";
  return `${base}${((CONFIG.tmdb || {}).profileSize) || "w185"}${path}`;
}

function genreFromIds(ids, shelf) {
  const list = ids || [];
  if (list.indexOf(10764) >= 0) return "Reality";
  if (list.indexOf(99) >= 0) return "Documentary";
  if (list.indexOf(10762) >= 0 || list.indexOf(16) >= 0 || list.indexOf(10751) >= 0) return "Kids";
  if (list.indexOf(35) >= 0) return "Comedy";
  if (list.indexOf(18) >= 0) return "Drama";
  if (shelf === "sport") return "Sport";
  return "Drama";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbGet(path, params) {
  const settings = CONFIG.tmdb || {};
  let wait = 500;
  let last = "request failed";
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const url = new URL(settings.base + path);
    url.searchParams.set("language", "en-US");
    Object.keys(params || {}).forEach((key) => {
      if (params[key] != null && params[key] !== "") url.searchParams.set(key, String(params[key]));
    });
    const response = await fetch(url, { headers: { Authorization: `Bearer ${settings.token}`, accept: "application/json" } });
    if (response.status === 429 || response.status >= 500) {
      last = `${response.status} ${path}`;
      catalogue.errors.push(last);
      await sleep(wait);
      wait *= 2;
      continue;
    }
    if (!response.ok) {
      last = `${response.status} ${path}`;
      catalogue.errors.push(last);
      throw new Error(last);
    }
    return response.json();
  }
  throw new Error(last);
}

function trimTitle(item, mediaType, shelf) {
  const type = item.media_type && item.media_type !== "person" ? item.media_type : mediaType;
  const row = {
    id: item.id,
    mediaType: type === "tv" || type === "movie" ? type : "movie",
    title: item.title || item.name || "Untitled",
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    overview: String(item.overview || "").slice(0, 240),
    genre_ids: item.genre_ids || [],
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    popularity: item.popularity || 0,
    release_date: item.release_date || item.first_air_date || "",
    origin_country: item.origin_country || [],
  };
  row.genre = genreFromIds(row.genre_ids, shelf);
  row.key = `${row.mediaType}-${row.id}`;
  return row;
}

function trimActor(item) {
  return {
    id: item.id,
    name: item.name,
    profile_path: item.profile_path || null,
    popularity: item.popularity || 0,
    birthday: item.birthday || "",
    credits: (item.known_for || item.credits || []).slice(0, 8).map((credit) => ({
      id: credit.id,
      title: credit.title || credit.name || "",
      genre_ids: credit.genre_ids || [],
      vote_average: credit.vote_average || 0,
      vote_count: credit.vote_count || 0,
    })),
  };
}

function starScale(values, value) {
  const sorted = values.slice().sort((a, b) => a - b);
  if (!sorted.length) return 3;
  let rank = 0;
  sorted.forEach((item) => { if (item <= value) rank += 1; });
  const pct = rank / sorted.length;
  return clamp(Math.round(pct * 4) + 1, 1, 5);
}

function scoreActors(actors) {
  const pops = actors.map((actor) => actor.popularity || 0);
  const fans = actors.map((actor) => (actor.popularity || 0) + Math.log10(1 + (actor.credits || []).reduce((sum, credit) => sum + (credit.vote_count || 0), 0)) * 10);
  actors.forEach((actor, index) => {
    const credits = actor.credits || [];
    const avg = credits.length ? credits.reduce((sum, credit) => sum + (credit.vote_average || 0), 0) / credits.length : 6.2;
    actor.star = starScale(pops, actor.popularity || 0);
    actor.fan = starScale(fans, fans[index]);
    actor.critic = clamp(Math.round((avg - 5) * 1.4), 1, 5);
    const reality = credits.filter((credit) => (credit.genre_ids || []).indexOf(10764) >= 0).length;
    actor.realityHeavy = credits.length > 0 && reality / credits.length >= 0.4;
    actor.fee = ((CONFIG.cast || {}).feeBase || 900) + (actor.star - 1) * ((CONFIG.cast || {}).feeStep || 1400);
    actor.archetype = actorArchetype(actor);
  });
}

function actorArchetype(actor) {
  const age = actorAge(actor);
  if (actor.star >= 5 && actor.fan >= 4) return "A-list Superstar";
  if (actor.critic >= 4 && age >= 48) return "Respected Veteran";
  if (actor.star <= 3 && actor.critic >= 4) return "Rising Star";
  if (actor.realityHeavy && actor.fan >= 4 && actor.critic <= 2) return "Reality TV Favourite";
  if (actor.star <= 2) return "Unknown Local";
  return "Working Actor";
}

function actorAge(actor) {
  if (!actor.birthday) return 36;
  const born = new Date(actor.birthday);
  if (Number.isNaN(born.getTime())) return 36;
  return (Date.now() - born.getTime()) / 31557600000;
}

function genreFit(actor, genre) {
  const credits = actor.credits || [];
  if (!credits.length || genre === "Sport") return "OK";
  const hits = credits.filter((credit) => {
    const ids = credit.genre_ids || [];
    if (genre === "Comedy") return ids.indexOf(35) >= 0;
    if (genre === "Drama") return ids.indexOf(18) >= 0;
    if (genre === "Documentary") return ids.indexOf(99) >= 0;
    if (genre === "Kids") return ids.indexOf(16) >= 0 || ids.indexOf(10751) >= 0 || ids.indexOf(10762) >= 0;
    if (genre === "Reality") return ids.indexOf(10764) >= 0;
    return false;
  }).length;
  const ratio = hits / credits.length;
  if (ratio >= 0.34) return "Great";
  if (ratio >= 0.12) return "OK";
  return "Poor";
}

function ingestCatalogue(payload, offline) {
  catalogue.offline = !!offline;
  catalogue.images = (payload && payload.images) || catalogue.images;
  catalogue.errors = catalogue.errors || [];
  catalogue.map = {};
  catalogue.shelves = {};
  const rows = [];
  (payload.titles || []).forEach((item) => {
    const row = item.key ? item : trimTitle(item, item.mediaType || "movie");
    if (!row.key) row.key = `${row.mediaType}-${row.id}`;
    if (!row.genre) row.genre = genreFromIds(row.genre_ids);
    if (!catalogue.map[row.key]) {
      catalogue.map[row.key] = row;
      rows.push(row);
    }
  });
  const pops = rows.map((row) => row.popularity || 0).sort((a, b) => a - b);
  rows.forEach((row) => {
    let rank = 0;
    pops.forEach((value) => { if (value <= (row.popularity || 0)) rank += 1; });
    row.percentile = pops.length ? rank / pops.length : 0.5;
  });
  catalogue.titles = rows;
  Object.keys(payload.shelves || {}).forEach((shelf) => {
    catalogue.shelves[shelf] = payload.shelves[shelf];
  });
  catalogue.actors = (payload.actors || []).map((actor) => trimActor(actor));
  scoreActors(catalogue.actors);
  catalogue.hot = {};
  (payload.hotActors || []).forEach((id) => { catalogue.hot[id] = true; });
  catalogue.ready = true;
}

function readTmdbCache() {
  if (typeof localStorage === "undefined") return null;
  try {
    const saved = JSON.parse(localStorage.getItem((CONFIG.tmdb || {}).cacheKey || "streamco_tmdb_cache_v1") || "null");
    if (!saved || !saved.savedAt || !saved.payload) return null;
    const maxAge = ((CONFIG.tmdb || {}).cacheDays || 7) * 86400000;
    if (Date.now() - saved.savedAt > maxAge) return null;
    return saved.payload;
  } catch (err) {
    return null;
  }
}

function writeTmdbCache(payload) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem((CONFIG.tmdb || {}).cacheKey || "streamco_tmdb_cache_v1", JSON.stringify({ savedAt: Date.now(), payload }));
  } catch (err) {
    catalogue.errors.push("cache full");
  }
}

async function loadFallback() {
  if (typeof window === "undefined") return require("./data/fallback.json");
  const response = await fetch("./data/fallback.json");
  if (!response.ok) throw new Error("fallback json");
  return response.json();
}

async function runPool(jobs, worker) {
  const limit = (CONFIG.tmdb || {}).batch || 6;
  const results = [];
  for (let index = 0; index < jobs.length; index += limit) {
    const slice = jobs.slice(index, index + limit);
    const pages = await Promise.all(slice.map((job) => worker(job).catch((err) => {
      catalogue.errors.push(String(err.message || err));
      return null;
    })));
    results.push(...pages);
  }
  return results;
}

async function fetchLiveCatalogue() {
  const settings = CONFIG.tmdb;
  const config = await tmdbGet("/configuration");
  const images = {
    secure_base_url: config.images.secure_base_url,
    poster_sizes: config.images.poster_sizes,
    profile_sizes: config.images.profile_sizes,
  };
  const shelves = {};
  const map = {};
  function add(list, shelf, media) {
    (list || []).forEach((item) => {
      if (!item || item.adult) return;
      const row = trimTitle(item, media || item.media_type || "movie", shelf.indexOf("sport") === 0 ? "sport" : shelf);
      if (!map[row.key]) map[row.key] = row;
      if (!shelves[shelf]) shelves[shelf] = [];
      if (shelves[shelf].indexOf(row.key) < 0) shelves[shelf].push(row.key);
    });
  }
  const pages = settings.pages || 2;
  const jobs = [];
  for (let page = 1; page <= pages; page += 1) {
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 500, with_genres: 35, page, include_adult: false }, "comedy", "tv"]);
    jobs.push(["/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 500, with_genres: 35, page, include_adult: false }, "comedy", "movie"]);
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 500, with_genres: 18, page, include_adult: false }, "drama", "tv"]);
    jobs.push(["/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 500, with_genres: 18, page, include_adult: false }, "drama", "movie"]);
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 100, with_genres: 99, page, include_adult: false }, "documentary", "tv"]);
    jobs.push(["/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 100, with_genres: 99, page, include_adult: false }, "documentary", "movie"]);
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 100, with_genres: 10762, page, include_adult: false }, "kids", "tv"]);
    jobs.push(["/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 100, with_genres: "16|10751", page, include_adult: false }, "kids", "movie"]);
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 100, with_genres: 10764, page, include_adult: false }, "reality", "tv"]);
  }
  jobs.push(["/trending/tv/week", { include_adult: false }, "trending", "tv"]);
  jobs.push(["/trending/movie/week", { include_adult: false }, "trending", "movie"]);
  jobs.push(["/tv/top_rated", { include_adult: false }, "critics", "tv"]);
  jobs.push(["/movie/top_rated", { include_adult: false }, "critics", "movie"]);
  jobs.push(["/tv/popular", { include_adult: false }, "crowd", "tv"]);
  jobs.push(["/movie/popular", { include_adult: false }, "crowd", "movie"]);
  const keyword = await tmdbGet("/search/keyword", { query: "sport" });
  const sport = ((keyword && keyword.results) || []).filter((row) => /sport/i.test(row.name))[0] || ((keyword && keyword.results) || [])[0];
  if (sport) {
    jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 100, with_keywords: sport.id, page: 1, include_adult: false }, "sport", "tv"]);
    jobs.push(["/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 100, with_keywords: sport.id, page: 1, include_adult: false }, "sport", "movie"]);
  }
  Object.keys(settings.regions || {}).forEach((regionId) => {
    (settings.regions[regionId] || []).forEach((code) => {
      jobs.push(["/discover/tv", { sort_by: "popularity.desc", "vote_count.gte": 200, with_origin_country: code, page: 1, include_adult: false }, `local-${code}`, "tv"]);
    });
  });
  await runPool(jobs, async (job) => {
    const page = await tmdbGet(job[0], job[1]);
    add(page.results, job[2], job[3]);
    return page;
  });
  const actors = [];
  const seen = {};
  for (let page = 1; page <= (settings.peoplePages || 3); page += 1) {
    const people = await tmdbGet("/person/popular", { page });
    (people.results || []).forEach((person) => {
      if (person.known_for_department !== "Acting" || seen[person.id]) return;
      seen[person.id] = true;
      actors.push(trimActor(person));
    });
  }
  let hotActors = [];
  try {
    const hot = await tmdbGet("/trending/person/week", {});
    hotActors = (hot.results || []).filter((person) => person.known_for_department === "Acting").map((person) => person.id);
  } catch (err) {
    catalogue.errors.push("trending people");
  }
  return { images, shelves, titles: Object.keys(map).map((key) => map[key]), actors: actors.slice(0, 100), hotActors };
}

async function startCatalogue() {
  catalogueReady = false;
  catalogue.errors = [];
  const cached = readTmdbCache();
  if (cached && cached.titles && cached.titles.length) ingestCatalogue(cached, false);
  else {
    try {
      const live = await fetchLiveCatalogue();
      if (!live.titles || live.titles.length < 8) throw new Error("thin catalogue");
      ingestCatalogue(live, false);
      writeTmdbCache({
        images: live.images,
        shelves: live.shelves,
        titles: live.titles,
        actors: live.actors,
        hotActors: live.hotActors,
      });
    } catch (err) {
      catalogue.errors.push(String(err.message || err));
      try {
        ingestCatalogue(await loadFallback(), true);
      } catch (fallbackError) {
        catalogue.errors.push("Offline catalogue failed");
      }
    }
  }
  catalogueReady = true;
  catalogue.ready = true;
  if (state && state.status === "playing") seedTrends();
  if (hasUi()) {
    renderCatalogueDebug();
    const note = document.getElementById("offline-note");
    if (note) note.hidden = !catalogue.offline;
    if (guideOpen && guideMode === "new") renderGuide();
  }
}

function seedTrends() {
  if (!state || state.trendsSeeded || !catalogue.ready) return;
  const counts = {};
  GENRES.forEach((genre) => { counts[genre] = 0; });
  (catalogue.shelves.trending || []).forEach((key) => {
    const row = catalogue.map[key];
    if (row) counts[row.genre] = (counts[row.genre] || 0) + 1;
  });
  const max = Math.max(1, ...GENRES.map((genre) => counts[genre] || 0));
  GENRES.forEach((genre) => {
    state.genreTrends[genre] = clamp(0.85 + ((counts[genre] || 0) / max) * 0.5, 0.8, 1.35);
  });
  state.trendsSeeded = true;
}

function titleAsk(row) {
  const rules = CONFIG.tmdb || {};
  const votes = row.vote_count || 0;
  const avg = row.vote_average || rules.voteFloor || 6.5;
  const floor = rules.voteFloor || 6.5;
  const pull = votes < (rules.votePullCount || 200) ? avg * (votes / (rules.votePullCount || 200)) + floor * (1 - votes / (rules.votePullCount || 200)) : avg;
  const quality = pull * (rules.qualityScale || 0.55);
  const format = row.mediaType === "movie" ? (rules.filmCost || 1.3) : (rules.seriesCost || 1);
  const cost = Math.round(((rules.costBase || 1200) + (row.percentile || 0.5) * (rules.costPop || 18000)) * (0.75 + avg * (rules.costVote || 0.08)) * format);
  const upkeep = Math.max(12, Math.round(cost * (rules.upkeepRate || 0.0045)));
  return { quality, cost, upkeep, pulled: pull };
}

function ownedTmdb(row) {
  return titles.some((title) => title.tmdbId === row.id && title.mediaType === row.mediaType && title.status !== "expired" && title.status !== "pulled");
}

function shelfKeys(name) {
  const keys = (catalogue.shelves && catalogue.shelves[name]) || [];
  const epoch = Math.floor((state ? state.day : 0) / (CONFIG.offerDays || 30));
  const shift = keys.length ? epoch % keys.length : 0;
  return keys.slice(shift).concat(keys.slice(0, shift));
}

async function enrichTitle(row) {
  if (!row || row.detailed || catalogue.offline) return row;
  try {
    const extra = row.mediaType === "tv" ? "aggregate_credits" : "credits";
    const path = row.mediaType === "tv" ? `/tv/${row.id}` : `/movie/${row.id}`;
    const data = await tmdbGet(path, { append_to_response: extra });
    row.tagline = data.tagline || "";
    row.overview = String(data.overview || row.overview || "").slice(0, 280);
    row.runtime = data.runtime || (data.episode_run_time && data.episode_run_time[0]) || 0;
    row.seasons = data.number_of_seasons || 0;
    row.episodes = data.number_of_episodes || 0;
    const rawCast = (data.credits && data.credits.cast) || (data.aggregate_credits && data.aggregate_credits.cast) || [];
    row.billed = rawCast.slice(0, 5).map((person) => ({ id: person.id, name: person.name || person.original_name, profile_path: person.profile_path || null }));
    row.detailed = true;
  } catch (err) {
    catalogue.errors.push(`details ${row.id}`);
  }
  return row;
}

function acquireTitle(row) {
  if (!row || ownedTmdb(row) || state.status !== "playing") return false;
  if (libraryFull()) {
    toast("The library is full. Expand it to add more.");
    return false;
  }
  const ask = titleAsk(row);
  if (!trySpend(ask.cost)) return false;
  clearOverrides();
  const jitter = (CONFIG.tmdb || {}).criticJitter || 4;
  const critic = clamp(Math.round(row.vote_average * 10 + (random() - 0.5) * jitter * 2), 5, 99);
  const audience = clamp(Math.round(((row.percentile || 0.5) * 45 + row.vote_average * 5) + (random() - 0.5) * ((CONFIG.tmdb || {}).audienceJitter || 5) * 2), 5, 99);
  const billed = row.billed || [];
  const castBonus = billed.length ? Math.min(1.2, billed.length * ((CONFIG.tmdb || {}).acquiredCast || 0.35) * 0.15) : 0;
  const days = row.mediaType === "movie" ? (CONFIG.contractDays || {}).movie || 180 : (CONFIG.contractDays || {}).tv || 90;
  const title = makeTitle({
    name: row.title,
    genre: row.genre || "Drama",
    kind: "licensed",
    tier: "license",
    status: "released",
    quality: ask.quality + castBonus,
    upkeep: ask.upkeep,
    cost: ask.cost,
    outcome: "licensed",
    releaseDay: state.day,
    contractDays: days,
    contractLength: days,
    tmdbId: row.id,
    mediaType: row.mediaType,
    poster_path: row.poster_path,
    overview: row.overview,
    critic,
    audience,
    tmdbVote: row.vote_average,
    cast: billed.map((person) => ({ id: person.id, name: person.name, profile_path: person.profile_path })),
    series: row.mediaType === "tv",
  });
  const line = reviewHeadline(title);
  pushEvent(state.day, [{ text: `${row.title} is now streaming. ${line}`, tone: "up" }], "money");
  if (hasUi() && !simOffline) enqueuePrompt({ type: "review", line });
  checkAchievements();
  saveGame();
  syncView();
  return title;
}

function reviewHeadline(title) {
  const outlets = ["The Daily Screen", "Reel Talk", "Couch Times", "Midnight Listings"];
  const quotes = {
    hit: "A triumph!",
    flop: "A very long evening.",
    darling: "The critics are already arguing.",
    guilty: "You will press play anyway.",
    licensed: "Now streaming.",
    average: "Perfectly watchable.",
  };
  const quote = quotes[title.outcome] || quotes.average;
  const critic = title.critic != null ? title.critic : "–";
  const audience = title.audience != null ? title.audience : "–";
  return `${outlets[rollInt(outlets.length)]}: "${quote}" Critics ${critic}% | Audience ${audience}%`;
}

function scoreRelease(title, budget) {
  const cast = title.cast || [];
  const lead = cast[0] || { critic: 3, fan: 3, star: 3 };
  const support = cast[1] || { critic: 3, fan: 3, star: 2 };
  const director = (CONFIG.directors || {})[title.director] || { variance: 1, critic: 0 };
  const format = (CONFIG.formats || {})[title.format] || { quality: 1 };
  const trend = (state.genreTrends && state.genreTrends[title.genre]) || 1;
  const spread = director.variance || 1;
  const critic = clamp(Math.round(58 + ((lead.critic || 3) + (support.critic || 3) - 6) * ((CONFIG.cast || {}).reviewCritic || 8) + (director.critic || 0) + budget.quality * 3 + (random() - 0.5) * 18 * spread), 8, 99);
  const audience = clamp(Math.round(54 + ((lead.fan || 3) + (support.fan || 3) - 6) * ((CONFIG.cast || {}).reviewFan || 7) + (trend - 1) * 28 + (title.marketingSpend ? 8 : 0) + (random() - 0.5) * 16 * spread), 8, 99);
  let tag = "average";
  if (critic >= 75 && audience >= 75) tag = "hit";
  else if (critic <= 46 && audience <= 46) tag = "flop";
  else if (critic >= 75 && audience < 62) tag = "darling";
  else if (audience >= 75 && critic < 62) tag = "guilty";
  const quality = Math.max(0.35, budget.quality * (format.quality || 1) * (0.55 + critic / 140 + audience / 180));
  const star = ((lead.star || 3) + (lead.fan || 3) + (support.star || 2)) / 10;
  const spikeBase = Math.max(12, paidSubscribers() * 0.01 * star * (audience / 70));
  const spike = spikeBase * (tag === "flop" ? 0.15 : tag === "hit" || tag === "guilty" ? 1.7 : tag === "darling" ? 0.7 : 1);
  return { tag, critic, audience, quality, spike };
}

function openReview(prompt) {
  setText("milestone-title", "Review day");
  setText("milestone-line", prompt.line);
  const modal = document.getElementById("milestone-modal");
  if (modal) modal.hidden = false;
}

function seasonCost(title) {
  const fees = (title.cast || []).reduce((sum, actor) => sum + Math.round((actor.fee || 1200) * 1.15), 0);
  return Math.round((title.cost || 4000) * 0.55 * (CONFIG.renewRise || 1.2) + fees);
}

function renewSeason(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return false;
  const cost = seasonCost(title);
  if (!trySpend(cost)) return false;
  title.season = (title.season || 1) + 1;
  title.releaseDay = state.day;
  title.quality = (title.quality || 1) * 1.08;
  title.upkeep = Math.round((title.upkeep || 20) * 1.12);
  (title.cast || []).forEach((actor) => { actor.fee = Math.round((actor.fee || 1200) * 1.15); });
  pushEvent(state.day, [{ text: `${title.name} returns for season ${title.season}.`, tone: "up" }], "money");
  saveGame();
  syncView();
  return true;
}

function productionPlan() {
  const budget = BUDGETS[studio.budget] || BUDGETS.standard;
  const format = (CONFIG.formats || {})[studio.format] || { cost: 1, days: 1, upkeep: 1, quality: 1, series: true };
  const director = (CONFIG.directors || {})[studio.director] || { time: 1 };
  const marketing = (CONFIG.marketingSpend || {})[studio.marketing] || 0;
  const fees = [studio.lead, studio.support].reduce((sum, actor) => sum + (actor ? actor.fee || 0 : 0), 0);
  const cost = Math.round(budget.cost * format.cost + fees + marketing);
  const days = Math.max(3, Math.round(budget.days * format.days * (director.time || 1)));
  return { budget, format, cost, days, marketing, fees };
}

function startOriginal() {
  const plan = productionPlan();
  if (libraryFull()) {
    toast("The library is full. Expand it to add more.");
    return false;
  }
  if (!trySpend(plan.cost)) return false;
  clearOverrides();
  const cast = [studio.lead, studio.support].filter(Boolean).map((actor) => ({
    id: actor.id,
    name: actor.name,
    profile_path: actor.profile_path,
    star: actor.star,
    fan: actor.fan,
    critic: actor.critic,
    fee: actor.fee,
    archetype: actor.archetype,
  }));
  cast.forEach((actor) => {
    if (actor.archetype === "A-list Superstar") state.aListCast = (state.aListCast || 0) + 1;
  });
  const title = makeTitle({
    name: (studio.name || "Untitled").trim().slice(0, 42) || "Untitled",
    genre: studio.genre,
    kind: "original",
    tier: plan.budget.id,
    status: "producing",
    daysLeft: plan.days,
    totalDays: plan.days,
    plannedQuality: plan.budget.quality * (plan.format.quality || 1),
    plannedUpkeep: Math.round(plan.budget.upkeep * (plan.format.upkeep || 1)),
    cost: plan.cost,
    cast,
    director: studio.director,
    format: studio.format,
    series: plan.format.series !== false,
    marketingSpend: plan.marketing,
    localRegion: studio.localRegion && studio.localRegion !== "uk" ? studio.localRegion : "",
  });
  pushEvent(state.day, [{ text: `${title.name} enters production (${plan.days} days).`, tone: "neutral" }], "money");
  saveGame();
  syncView();
  closeCommission();
  return true;
}

function surpriseTitle() {
  const bits = ["Midnight", "Second", "Paper", "Golden", "Quiet", "Last", "Open", "Little", "North", "Velvet"];
  const ends = ["Carriage", "Checkout", "Screen", "Table", "Season", "Signal", "Room", "Replay", "Harbour", "Cut"];
  return `${bits[rollInt(bits.length)]} ${ends[rollInt(ends.length)]}`;
}

function openStudio() {
  if (!hasUi()) return;
  if (state.status !== "playing") return;
  holdClock();
  studio = {
    step: "path",
    shelf: "trending",
    query: "",
    role: "lead",
    format: "sitcom",
    genre: "Comedy",
    name: "",
    director: "safe",
    budget: "standard",
    marketing: "off",
    lead: null,
    support: null,
    localRegion: "uk",
    refresh: 0,
    selected: null,
  };
  const modal = document.getElementById("commission-modal");
  if (modal) modal.hidden = false;
  renderStudio();
}

function studioRoot() {
  const card = document.querySelector("#commission-modal .modal-card");
  if (!card) return null;
  let root = document.getElementById("studio-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "studio-root";
    card.prepend(root);
  }
  Array.from(card.children).forEach((child) => { child.hidden = child !== root; });
  root.hidden = false;
  return root;
}

function renderStudio() {
  const root = studioRoot();
  if (!root || !studio) return;
  root.replaceChildren();
  const head = document.createElement("div");
  head.className = "modal-head";
  const heading = document.createElement("h2");
  heading.id = "studio-heading";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "modal-x";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";
  close.addEventListener("click", closeCommission);
  head.append(heading, close);
  const body = document.createElement("div");
  body.className = "modal-scroll";
  const foot = document.createElement("div");
  foot.className = "modal-foot";
  root.append(head, body, foot);
  if (studio.step === "path") renderStudioPath(heading, body);
  else if (studio.step === "acquire") renderStudioAcquire(heading, body);
  else if (studio.step === "detail") renderStudioDetail(heading, body);
  else if (studio.step === "format") renderStudioFormat(heading, body);
  else if (studio.step === "cast") renderStudioCast(heading, body);
  else renderStudioBudget(heading, body);
  Array.from(body.children).forEach((child) => {
    if (child.classList.contains("modal-actions") || child.classList.contains("buy-button")) foot.append(child);
  });
}

function studioNav(back) {
  const row = document.createElement("div");
  row.className = "modal-actions";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "reset-button";
  close.textContent = "Close";
  close.addEventListener("click", closeCommission);
  row.append(close);
  if (back) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reset-button";
    button.textContent = "Back";
    button.addEventListener("click", () => { studio.step = back; renderStudio(); });
    row.append(button);
  }
  return row;
}

function renderStudioPath(heading, body) {
  heading.textContent = "Content";
  const copy = document.createElement("p");
  copy.className = "modal-line";
  copy.textContent = "License a famous title, or build an original with a real cast.";
  const row = document.createElement("div");
  row.className = "modal-actions";
  const acquire = document.createElement("button");
  acquire.type = "button";
  acquire.className = "buy-button";
  acquire.textContent = "Acquire a famous title";
  acquire.addEventListener("click", () => { studio.step = "acquire"; renderStudio(); });
  const create = document.createElement("button");
  create.type = "button";
  create.className = "buy-button";
  create.textContent = "Create an original";
  create.addEventListener("click", () => { studio.step = "format"; renderStudio(); });
  row.append(acquire, create);
  body.append(copy, row, studioNav());
}

function renderStudioAcquire(heading, body) {
  heading.textContent = "Acquire";
  const tabs = document.createElement("div");
  tabs.className = "shelf-tabs";
  const names = [["trending", "Trending now"], ["critics", "Critics' picks"], ["crowd", "Crowd pleasers"], ["comedy", "Comedy"], ["drama", "Drama"], ["sport", "Sport"], ["kids", "Kids"], ["documentary", "Documentary"], ["reality", "Reality"]];
  REGIONS.forEach((region) => {
    if (!state.regions[region.id].unlocked) return;
    ((CONFIG.tmdb || {}).regions[region.id] || []).forEach((code) => names.push([`local-${code}`, `${region.name} originals`]));
  });
  names.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.shelf === id ? "filter is-on" : "filter";
    button.textContent = label;
    button.addEventListener("click", () => { studio.shelf = id; renderStudio(); });
    tabs.append(button);
  });
  const search = document.createElement("input");
  search.className = "name-field";
  search.placeholder = "Search titles";
  search.value = studio.query || "";
  search.addEventListener("input", () => { studio.query = search.value; renderShelf(grid, search.value); });
  const grid = document.createElement("div");
  grid.className = "shelf-grid";
  body.append(tabs, search, grid, studioNav("path"));
  renderShelf(grid, studio.query);
  if ((studio.query || "").trim().length > 1 && !catalogue.offline) searchRemote(studio.query.trim(), grid);
}

function renderShelf(grid, query) {
  grid.replaceChildren();
  let rows = [];
  const text = (query || "").trim().toLowerCase();
  if (text) rows = catalogue.titles.filter((row) => row.title.toLowerCase().indexOf(text) >= 0).slice(0, 12);
  else rows = shelfKeys(studio.shelf).map((key) => catalogue.map[key]).filter(Boolean).filter((row) => !ownedTmdb(row)).slice(0, 12);
  if (!rows.length) {
    grid.append(document.createTextNode(catalogue.ready ? "Nothing on this shelf yet." : "Loading catalogue..."));
    return;
  }
  rows.forEach((row) => grid.append(titleCard(row)));
}

function titleCard(row) {
  const ask = titleAsk(row);
  const card = document.createElement("button");
  card.type = "button";
  card.className = "title-card";
  if (row.poster_path) {
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.src = posterUrl(row.poster_path);
    img.addEventListener("error", () => img.remove());
    card.append(img);
  }
  const name = document.createElement("strong");
  name.textContent = row.title;
  const meta = document.createElement("span");
  const year = (row.release_date || "").slice(0, 4);
  meta.textContent = `${year || "—"} · ${row.genre} · ${formatCash(ask.cost)} · upkeep ${formatCash(ask.upkeep)}/day`;
  card.append(name, meta);
  card.addEventListener("click", () => {
    studio.selected = row;
    studio.step = "detail";
    renderStudio();
    enrichTitle(row).then(() => { if (studio && studio.step === "detail" && studio.selected === row) renderStudio(); });
  });
  return card;
}

let searchTimer = null;
function searchRemote(query, grid) {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    Promise.all([
      tmdbGet("/search/tv", { query, include_adult: false }).catch(() => ({ results: [] })),
      tmdbGet("/search/movie", { query, include_adult: false }).catch(() => ({ results: [] })),
    ]).then((pages) => {
      if (!studio || studio.query !== query) return;
      pages.forEach((page, index) => {
        (page.results || []).slice(0, 6).forEach((item) => {
          const row = trimTitle(item, index === 0 ? "tv" : "movie");
          if (!catalogue.map[row.key]) {
            catalogue.map[row.key] = row;
            catalogue.titles.push(row);
          }
        });
      });
      renderShelf(grid, query);
    });
  }, 280);
}

function renderStudioDetail(heading, body) {
  const row = studio.selected;
  heading.textContent = row ? row.title : "Title";
  if (!row) return;
  const ask = titleAsk(row);
  const year = (row.release_date || "").slice(0, 4);
  const layout = document.createElement("div");
  layout.className = "deal-layout";
  const poster = document.createElement("div");
  poster.className = "deal-poster";
  fillPosterBox(poster, row.poster_path, row.genre);
  const copy = document.createElement("div");
  copy.className = "deal-copy";
  const chips = document.createElement("p");
  chips.className = "chip-row";
  [year || "—", row.genre, row.mediaType === "tv" ? "Series" : "Film"].forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "genre-chip";
    chip.textContent = label;
    chips.append(chip);
  });
  const scores = document.createElement("p");
  scores.className = "modal-line";
  const contract = row.mediaType === "movie" ? ((CONFIG.contractDays || {}).movie || 180) : ((CONFIG.contractDays || {}).tv || 90);
  scores.textContent = `Critics ${Math.round((row.vote_average || 0) * 10)} · Audience ${Math.round((row.percentile || 0.5) * 100)} · Contract ${contract} days`;
  if (row.tagline) {
    const tag = document.createElement("p");
    tag.className = "modal-line";
    tag.textContent = row.tagline;
    copy.append(chips, scores, tag);
  } else copy.append(chips, scores);
  const overview = document.createElement("p");
  overview.className = "modal-line";
  overview.textContent = row.overview || "No overview yet.";
  copy.append(overview);
  const cast = document.createElement("p");
  cast.className = "modal-line";
  const names = (row.billed || []).slice(0, 5).map((person) => person.name).filter(Boolean);
  cast.textContent = names.length ? `Cast: ${names.join(", ")}` : "Cast: loading the top billed names.";
  const money = document.createElement("p");
  money.className = "modal-line";
  money.textContent = `Cost ${formatCash(ask.cost)} · upkeep ${formatCash(ask.upkeep)}/day · balance after ${formatCash(state.cash - ask.cost)}`;
  copy.append(cast, money);
  layout.append(poster, copy);
  body.append(layout);
  const kind = payKind(ask.cost);
  const full = libraryFull();
  const buy = document.createElement("button");
  buy.type = "button";
  buy.className = kind === "credit" ? "buy-button buy-credit" : "buy-button";
  buy.disabled = kind === "over" || ownedTmdb(row) || full;
  buy.textContent = ownedTmdb(row) ? "Owned" : full ? "Library full" : kind === "over" ? "Over credit limit" : kind === "credit" ? "Buy on credit" : "Buy";
  buy.addEventListener("click", () => { if (acquireTitle(row)) closeCommission(); });
  const nav = studioNav("acquire");
  nav.prepend(buy);
  body.append(nav);
}

function renderStudioFormat(heading, body) {
  heading.textContent = "Format and genre";
  const formats = document.createElement("div");
  formats.className = "pick-grid";
  Object.keys(CONFIG.formats || {}).forEach((id) => {
    const format = CONFIG.formats[id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.format === id ? "pick is-on" : "pick";
    button.textContent = format.name;
    button.addEventListener("click", () => {
      studio.format = id;
      if (format.genre) studio.genre = format.genre;
      renderStudio();
    });
    formats.append(button);
  });
  const genres = document.createElement("div");
  genres.className = "pick-grid";
  GENRES.forEach((genre) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.genre === genre ? "pick is-on" : "pick";
    button.textContent = genre;
    button.addEventListener("click", () => { studio.genre = genre; renderStudio(); });
    genres.append(button);
  });
  const name = document.createElement("input");
  name.value = studio.name;
  name.maxLength = 42;
  name.placeholder = "Title";
  name.addEventListener("input", () => { studio.name = name.value; });
  const surprise = document.createElement("button");
  surprise.type = "button";
  surprise.className = "reset-button";
  surprise.textContent = "Surprise me";
  surprise.addEventListener("click", () => { studio.name = surpriseTitle(); renderStudio(); });
  const regions = document.createElement("div");
  regions.className = "pick-grid";
  REGIONS.filter((region) => state.regions[region.id].unlocked).forEach((region) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.localRegion === region.id ? "pick is-on" : "pick";
    button.textContent = region.id === "uk" ? "Home" : region.name;
    button.addEventListener("click", () => { studio.localRegion = region.id; renderStudio(); });
    regions.append(button);
  });
  const next = document.createElement("button");
  next.type = "button";
  next.className = "buy-button";
  next.textContent = "Cast";
  next.addEventListener("click", () => {
    if (!studio.name.trim()) studio.name = surpriseTitle();
    studio.step = "cast";
    renderStudio();
  });
  body.append(formats, genres, name, surprise, regions, next, studioNav("path"));
}

function castPool(role) {
  const list = catalogue.actors.slice();
  const seed = (studio.refresh || 0) + (role === "support" ? 17 : 3) + studio.genre.length;
  list.sort((a, b) => ((a.id * seed) % 97) - ((b.id * seed) % 97));
  return list.slice(0, 5);
}

function renderStudioCast(heading, body) {
  heading.textContent = studio.role === "support" ? "Supporting actor" : "Lead";
  const search = document.createElement("input");
  search.placeholder = "Search actors";
  search.addEventListener("change", () => searchPeople(search.value, list));
  const list = document.createElement("div");
  list.className = "cast-grid";
  const people = (studio.actorQuery ? catalogue.actors.filter((actor) => actor.name.toLowerCase().indexOf(studio.actorQuery) >= 0).slice(0, 5) : castPool(studio.role));
  people.forEach((actor) => list.append(actorCard(actor)));
  const shuffle = document.createElement("button");
  shuffle.type = "button";
  shuffle.className = "reset-button";
  shuffle.textContent = "Show other names";
  shuffle.addEventListener("click", () => { studio.refresh += 1; studio.actorQuery = ""; renderStudio(); });
  body.append(search, list, shuffle, studioNav("format"));
}

function actorCard(actor) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "actor-card";
  if (actor.profile_path) {
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.src = profileUrl(actor.profile_path);
    img.addEventListener("error", () => { img.replaceWith(document.createTextNode("🎭")); });
    card.append(img);
  } else card.append(document.createTextNode("🎭"));
  const name = document.createElement("strong");
  name.textContent = actor.name;
  const meta = document.createElement("span");
  const fit = genreFit(actor, studio.genre);
  meta.textContent = `${formatCash(actor.fee || 0)} · Star ${actor.star || "?"} · Critics ${actor.critic || "?"} · Fans ${actor.fan || "?"} · ${actor.archetype || "Working Actor"} · ${fit}`;
  card.append(name, meta);
  if (catalogue.hot[actor.id]) {
    const hot = document.createElement("em");
    hot.textContent = "Hot this week";
    card.append(hot);
  }
  card.addEventListener("click", () => chooseActor(actor));
  if (!actor.detailed && !catalogue.offline) {
    enrichActor(actor).then(() => { if (studio && studio.step === "cast") renderStudio(); });
  }
  return card;
}

function chooseActor(actor) {
  if (studio.role === "lead") {
    studio.lead = actor;
    studio.role = "support";
    renderStudio();
    return;
  }
  studio.support = actor;
  studio.step = "budget";
  renderStudio();
}

async function enrichActor(actor) {
  if (!actor || actor.detailed || catalogue.offline) return actor;
  actor.detailed = true;
  try {
    const data = await tmdbGet(`/person/${actor.id}`, { append_to_response: "combined_credits" });
    actor.birthday = data.birthday || actor.birthday;
    actor.profile_path = data.profile_path || actor.profile_path;
    actor.popularity = data.popularity || actor.popularity;
    const credits = ((data.combined_credits && data.combined_credits.cast) || []).slice().sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 8);
    actor.credits = credits.map((credit) => ({
      genre_ids: credit.genre_ids || [],
      vote_average: credit.vote_average || 0,
      vote_count: credit.vote_count || 0,
    }));
    scoreActors(catalogue.actors);
  } catch (err) {
    catalogue.errors.push(`actor ${actor.id}`);
  }
  return actor;
}

function searchPeople(query, list) {
  const text = query.trim().toLowerCase();
  studio.actorQuery = text;
  if (!text || catalogue.offline) {
    renderStudio();
    return;
  }
  tmdbGet("/search/person", { query }).then((page) => {
    (page.results || []).filter((person) => person.known_for_department === "Acting").slice(0, 5).forEach((person) => {
      if (!catalogue.actors.some((actor) => actor.id === person.id)) catalogue.actors.push(trimActor(person));
    });
    scoreActors(catalogue.actors);
    renderStudio();
  }).catch(() => renderStudio());
}

function renderStudioBudget(heading, body) {
  heading.textContent = "Budget";
  const budgets = document.createElement("div");
  budgets.className = "pick-grid";
  Object.keys(BUDGETS).forEach((id) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.budget === id ? "pick is-on" : "pick";
    button.textContent = BUDGETS[id].name;
    button.addEventListener("click", () => { studio.budget = id; renderStudio(); });
    budgets.append(button);
  });
  const directors = document.createElement("div");
  directors.className = "pick-grid";
  Object.keys(CONFIG.directors || {}).forEach((id) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.director === id ? "pick is-on" : "pick";
    button.textContent = CONFIG.directors[id].name;
    button.addEventListener("click", () => { studio.director = id; renderStudio(); });
    directors.append(button);
  });
  const marketing = document.createElement("div");
  marketing.className = "pick-grid";
  Object.keys(CONFIG.marketingSpend || { off: 0 }).forEach((id) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = studio.marketing === id ? "pick is-on" : "pick";
    button.textContent = `${id} · ${formatCash(CONFIG.marketingSpend[id] || 0)}`;
    button.addEventListener("click", () => { studio.marketing = id; renderStudio(); });
    marketing.append(button);
  });
  const plan = productionPlan();
  const predict = document.createElement("p");
  predict.className = "modal-line";
  predict.textContent = `About ${plan.days} days. Total ${formatCash(plan.cost)}. Balance after ${formatCash(state.cash - plan.cost)}. Predicted opening is a range, not a promise: critics roughly 50–90, audience roughly 45–90, depending on the cast, the budget, and luck.`;
  const kind = payKind(plan.cost);
  const go = document.createElement("button");
  go.type = "button";
  go.className = kind === "credit" ? "buy-button buy-credit" : "buy-button";
  go.disabled = kind === "over";
  go.textContent = kind === "over" ? "Over credit limit" : kind === "credit" ? "Start on credit" : "Start production";
  go.addEventListener("click", startOriginal);
  body.append(budgets, directors, marketing, predict, go, studioNav("cast"));
}

function renderCredit(view) {
  const note = document.getElementById("credit-note");
  const limit = view.creditLimit || 0;
  const debt = view.debt || 0;
  if (note) note.textContent = `Limit ${formatCash(limit)} · free ${formatCash(Math.max(0, limit - debt))}`;
  const fill = document.getElementById("credit-fill");
  if (fill) {
    const pct = limit ? clamp(debt / limit, 0, 1) : 0;
    fill.style.width = `${pct * 100}%`;
    fill.classList.toggle("is-amber", pct >= 0.5 && pct < 0.8);
    fill.classList.toggle("is-red", pct >= 0.8);
  }
  const chip = document.getElementById("debt-chip");
  if (chip) chip.hidden = view.cash >= 0;
  const banner = document.getElementById("bust-banner");
  if (banner) {
    const left = ((CONFIG.credit || {}).bankruptcyDays || 30) - (view.daysBelowLoseLine || 0);
    const show = view.status === "playing" && view.daysBelowLoseLine > 0;
    banner.hidden = !show;
    if (show) banner.textContent = `Bankruptcy countdown: ${left} days to get back inside the credit limit`;
  }
  const ad = document.getElementById("ad-tier");
  if (ad && document.activeElement !== ad) ad.checked = !!state.adTier;
}

function renderHero(view) {
  const count = document.getElementById("hero-subs");
  if (count) count.textContent = formatSubscribers(view.subscribers);
  const chip = document.getElementById("hero-delta");
  if (chip) {
    const delta = Math.round(view.netPaid || 0);
    chip.textContent = `${delta > 0 ? "+" : ""}${delta} today`;
    chip.className = `sub-chip ${delta < 0 ? "down" : "up"}`;
  }
  const tiers = [1000, 10000, 100000, 1000000, 5000000, empireGoals().subscribers].filter((value, index, list) => list.indexOf(value) === index).sort((a, b) => a - b);
  const next = tiers.filter((tier) => tier > view.subscribers)[0] || tiers[tiers.length - 1];
  const prev = tiers.filter((tier) => tier <= view.subscribers).pop() || 0;
  const bar = document.getElementById("mile-fill");
  if (bar) bar.style.width = `${clamp((view.subscribers - prev) / Math.max(1, next - prev), 0, 1) * 100}%`;
  setText("mile-copy", next > view.subscribers ? `${formatSubscribers(next - view.subscribers)} to ${formatSubscribers(next)}` : "Top milestone reached");
  renderCrowd(view);
  renderShare(view);
  const note = document.getElementById("offline-note");
  if (note) note.hidden = !(catalogue && catalogue.offline);
}

function renderCrowd(view) {
  const root = document.getElementById("crowd");
  const label = document.getElementById("crowd-scale");
  if (!root) return;
  let scale = 100;
  while (view.subscribers / scale > 72 && scale < 10000000) scale *= 10;
  const count = Math.max(1, Math.min(72, Math.round(view.subscribers / scale) || 1));
  if (label) label.textContent = `${formatSubscribers(scale)} per icon`;
  if (root.childElementCount === count) return;
  root.replaceChildren();
  for (let index = 0; index < count; index += 1) {
    const icon = document.createElement("span");
    icon.className = "crowd-icon";
    icon.textContent = "📺";
    root.append(icon);
  }
}

function renderShare(view) {
  const root = document.getElementById("market-share");
  if (!root) return;
  root.replaceChildren();
  leaderboardRows().forEach((row) => {
    const bar = document.createElement("span");
    bar.style.width = `${Math.max(2, row.share * 100)}%`;
    bar.style.background = row.color;
    bar.title = row.name;
    root.append(bar);
  });
}

function renderEmpire(view) {
  const root = document.getElementById("empire-panel");
  if (!root) return;
  const goals = empireGoals();
  const debt = Math.max(0, -state.cash);
  const limit = Math.max(1, view.creditLimit || 1);
  const profitPct = clamp((state.profitableStreak || 0) / (CONFIG.profitableDays || 60), 0, 1);
  const debtOk = debt < limit * (CONFIG.healthyDebtRatio || 0.25);
  const healthyPct = debtOk ? profitPct : Math.min(profitPct, clamp(1 - debt / limit, 0, 1));
  const rows = [
    ["Company value", view.companyValue || 0, goals.companyValue, formatCash(view.companyValue || 0)],
    ["Subscribers", view.subscribers, goals.subscribers, formatSubscribers(view.subscribers)],
    ["Healthy business", healthyPct, 1, debtOk ? `${state.profitableStreak || 0}/${CONFIG.profitableDays || 60} profitable days` : "Debt is above the healthy line"],
  ];
  root.replaceChildren();
  const title = document.createElement("h3");
  title.className = "slot-title";
  title.textContent = "Road to Empire";
  root.append(title);
  rows.forEach(([label, current, goal, text]) => {
    const wrap = document.createElement("div");
    wrap.className = "empire-row";
    const head = document.createElement("p");
    head.textContent = `${label} · ${text}`;
    const bar = document.createElement("div");
    bar.className = "progress";
    const span = document.createElement("span");
    span.style.width = `${clamp(current / Math.max(1, goal), 0, 1) * 100}%`;
    bar.append(span);
    wrap.append(head, bar);
    root.append(wrap);
  });
  if ((view.companyValue || 0) >= goals.companyValue && view.subscribers >= goals.subscribers && businessHealthy()) {
    const hold = document.createElement("p");
    hold.className = "modal-line";
    hold.textContent = `30-day hold: ${state.empireHold || 0}/${CONFIG.holdDays || 30}`;
    root.append(hold);
  }
}

function drawCashChart(canvas) {
  if (!canvas || !analytics.length) return;
  const limit = creditLimit();
  drawLines(canvas, [
    { color: "#4C6FFF", values: analytics.map((row) => row.cash || 0) },
    { color: "#F5A623", values: analytics.map(() => -limit) },
    { color: "#A0A0B0", values: analytics.map(() => 0) },
  ]);
}

function renderCatalogueDebug() {
  const root = document.getElementById("catalogue-debug");
  if (!root) return;
  root.replaceChildren();
  const status = document.createElement("p");
  status.textContent = catalogue.offline ? "Offline catalogue" : catalogue.ready ? "Live catalogue" : "Loading catalogue...";
  root.append(status);
  catalogue.titles.slice(0, 4).forEach((row) => {
    const line = document.createElement("p");
    line.textContent = `${row.title} · ${row.genre} · ${row.vote_average}`;
    root.append(line);
  });
  catalogue.actors.slice(0, 4).forEach((actor) => {
    const line = document.createElement("p");
    line.textContent = `${actor.name} · star ${actor.star || "?"} · ${actor.archetype || ""}`;
    root.append(line);
  });
  catalogue.errors.slice(-6).forEach((error) => {
    const line = document.createElement("p");
    line.textContent = error;
    root.append(line);
  });
}

function debugCatalogue() {
  return {
    offline: catalogue.offline,
    ready: catalogue.ready,
    titles: catalogue.titles.slice(0, 8).map((row) => row.title),
    actors: catalogue.actors.slice(0, 8).map((actor) => actor.name),
    errors: catalogue.errors.slice(),
  };
}

function hookStudioUi() {
  const ad = document.getElementById("ad-tier");
  if (ad) ad.addEventListener("change", () => { state.adTier = ad.checked; syncView(); saveGame(); });
  const help = document.getElementById("settings-guide");
  if (help) help.addEventListener("click", () => { closeSettings(); openGuide(state.status === "playing" ? "pause" : "browse"); });
  const refresh = document.getElementById("settings-refresh");
  if (refresh) refresh.addEventListener("click", () => {
    try { localStorage.removeItem((CONFIG.tmdb || {}).cacheKey || "streamco_tmdb_cache_v1"); } catch (err) { /* ignore */ }
    cataloguePromise = null;
    catalogueReady = false;
    ensureCatalogue();
  });
}

function spendAllDeals() {
  if (libraryFull()) buyUpgrade("expand");
  moviePackList().forEach((pack) => {
    if (!activeLicense(pack.id)) signLicense(pack.id);
  });
  Object.keys(LICENSES).forEach((id) => {
    const def = LICENSES[id];
    if (def && def.genre === "Sport" && !activeLicense(id)) signLicense(id);
  });
  if (!libraryFull() && state.day > 0 && state.day % 12 === 0) commission(GENRES[state.day % GENRES.length], "standard");
}

function debugDeals() {
  if (!state || state.status !== "playing") beginGame("normal");
  const samples = [
    ["Night Bus", "Drama", "movie", 11],
    ["Glass House", "Comedy", "movie", 8],
    ["Paper Boats", "Kids", "tv", 90],
    ["Field Notes", "Documentary", "tv", 40],
    ["Late Checkout", "Reality", "tv", 11],
    ["Football Package", "Sport", "sports", 11],
    ["Cricket Package", "Sport", "sports", 6],
    ["Action Pack", "Drama", "movie", 180],
    ["Rom-Com Pack", "Comedy", "movie", 30],
    ["Signal Lost", "Drama", "movie", 3],
  ];
  samples.forEach((sample, index) => {
    if (libraryFull()) return;
    makeTitle({
      name: sample[0],
      genre: sample[1],
      kind: "licensed",
      tier: "license",
      status: "released",
      quality: 1.4,
      upkeep: 40 + index * 8,
      cost: 5000,
      outcome: "licensed",
      releaseDay: state.day,
      contractDays: sample[3],
      contractLength: sample[2] === "tv" ? 90 : sample[2] === "sports" ? 90 : 180,
      mediaType: sample[2] === "tv" ? "tv" : "movie",
      series: sample[2] === "tv",
      licenseId: sample[2] === "sports" ? sample[0].toLowerCase().split(" ")[0] : `debug-${index}`,
      critic: 60 + index,
      audience: 55 + index,
    });
  });
  const due = titles.filter((title) => title.kind === "licensed" && title.contractDays <= 10 && title.contractDays > 0);
  due.forEach((title) => pendingRenew.add(title.id));
  if (hasUi() && due.length) enqueuePrompt({ type: "renewals", ids: due.map((title) => title.id) });
  syncView();
  return slotsUsed();
}

function autoPlayContent() {
  const live = titles.filter((title) => title.status === "released" || title.status === "producing").length;
  if (live < 8 && state.day > 0 && state.day % 30 === 0) {
    commission(GENRES[state.day % GENRES.length], state.day > 280 ? "standard" : "low");
  }
  if (state.day === 16) buyUpgrade("social");
  if (state.day === 28) buyUpgrade("recommendations");
  if (state.day === 90) buyUpgrade("tv");
  if (state.day === 120) buyUpgrade("servers");
  if (state.day >= 220 && state.day % 40 === 0 && paidSubscribers() > 8000) signLicense("football");
  if (state.day % 40 === 0) {
    const next = REGIONS.find((region) => !state.regions[region.id].unlocked);
    if (next && paidSubscribers() > next.unlock) unlockRegion(next.id);
    REGIONS.forEach((region) => {
      const row = state.regions[region.id];
      if (row.unlocked && !row.localised && region.localise) localiseRegion(region.id);
    });
  }
}

function balanceTest() {
  const savedRng = rng;
  const strategies = [2, 5, 10, 20, "adaptive", "spend"];
  const report = strategies.map((strategy) => {
    let seed = 24681357;
    rng = function seeded() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    beginGame("normal");
    state.nextEventDay = Infinity;
    const fixed = strategy === "adaptive" || strategy === "spend" ? 8 : Number(strategy);
    state.monthlyPrice = fixed;
    state.priceAnchor = fixed;
    const maxDays = 2600;
    for (let step = 0; step < maxDays && state.status === "playing"; step += 1) {
      if (strategy === "adaptive" && state.day % 14 === 0) {
        let bestPrice = state.monthlyPrice;
        let bestScore = -Infinity;
        for (let price = 2; price <= 20; price += 1) {
          const score = estimateProfit(price);
          if (score > bestScore) {
            bestScore = score;
            bestPrice = price;
          }
        }
        const moved = clamp(state.monthlyPrice + clamp(bestPrice - state.monthlyPrice, -2, 2), 2, 20);
        state.monthlyPrice = moved;
        state.priceAnchor = moved;
      }
      if (strategy !== "adaptive" && strategy !== "spend") {
        state.monthlyPrice = fixed;
        state.priceAnchor = fixed;
        state.priceHikeDays = 0;
      }
      if (strategy === "spend") spendAllDeals();
      else autoPlayContent();
      tick({ log: false });
    }
    return {
      strategy: String(strategy),
      status: state.status,
      day: state.day,
      subscribers: Math.round(paidSubscribers()),
      value: Math.round(companyValue()),
      cash: Math.round(state.cash),
      price: state.monthlyPrice,
    };
  });
  rng = savedRng;
  beginGame("normal");
  return report;
}

const api = {
  SERVICE_NAME,
  MIN_MONTHLY_PRICE,
  MAX_MONTHLY_PRICE,
  WIN_SUBSCRIBERS,
  LOSE_CASH,
  LOSE_STREAK_DAYS,
  UPGRADES,
  GENRES,
  EVENTS,
  ACHIEVEMENTS,
  getState: snapshot,
  setMonthlyPrice,
  setContentQuality,
  setMarketingMultiplier,
  setContentUpkeep,
  buyUpgrade,
  upgradeCost,
  commission,
  unlockRegion,
  localiseRegion,
  setSpeed,
  beginGame,
  tick,
  start,
  stop,
  reset,
  saveGame,
  loadGame,
  catchUp,
  debugFire,
  balanceTest,
  debugCatalogue,
  debugDeals,
  priceAttractiveness,
  churnRate,
  subscriberGrowth,
  dailyRevenue,
  dailyCosts,
  formatCash,
  formatSubscribers,
  _setRng(fn) { rng = fn || Math.random; },
};

globalThis.StreamCo = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;

settings = loadSettings();
state = createInitialState("normal");
owned = emptyOwned();
rivals = createRivals(difficulty());
uiEvents = [openingEvent()];

if (typeof document !== "undefined") {
  mountUi();
  stop();
  state.status = "menu";
  showTitle();
}
