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
const TICK_MS = 1000;
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

const DIFFICULTIES = {
  easy: { id: "easy", name: "Easy", cash: 20000, rivals: 2, severity: 0.6, eventMin: 30, eventSpan: 21, rivalStrength: 0.72, events: true, canLose: true },
  normal: { id: "normal", name: "Normal", cash: 10000, rivals: 3, severity: 1, eventMin: 20, eventSpan: 21, rivalStrength: 1, events: true, canLose: true },
  hard: { id: "hard", name: "Hard", cash: 6000, rivals: 4, severity: 1.35, eventMin: 15, eventSpan: 14, rivalStrength: 1.22, events: true, canLose: true },
  sandbox: { id: "sandbox", name: "Sandbox", cash: 40000, rivals: 2, severity: 1, eventMin: 999, eventSpan: 1, rivalStrength: 0.45, events: false, canLose: false },
};

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
};

const REGIONS = [
  { id: "uk", name: "United Kingdom", tam: 80000, tolerance: 1, favourite: "Comedy", unlock: 0, localise: 0, rival: "flixora", color: "#E50914" },
  { id: "europe", name: "Europe", tam: 150000, tolerance: 0.95, favourite: "Drama", unlock: 8000, localise: 4000, rival: "primetime", color: "#4C6FFF" },
  { id: "na", name: "North America", tam: 260000, tolerance: 1.15, favourite: "Reality", unlock: 16000, localise: 7000, rival: "streamly", color: "#F5A623" },
  { id: "apac", name: "Asia-Pacific", tam: 220000, tolerance: 0.8, favourite: "Kids", unlock: 18000, localise: 7000, rival: "cinebox", color: "#2ECC71" },
  { id: "latam", name: "Latin America", tam: 130000, tolerance: 0.75, favourite: "Sport", unlock: 10000, localise: 4500, rival: null, localName: "Onda Max", color: "#C46BFF" },
];

const RIVAL_ROSTER = [
  { id: "flixora", name: "Flixora", color: "#FF6B4A", personality: "aggressive", blurb: "Undercuts on price and spends heavily on ads.", price: 4, quality: 2.4, marketing: 1.45, brand: 46, subscribers: 180 },
  { id: "primetime", name: "PrimeTime+", color: "#4C6FFF", personality: "steady", blurb: "Slow, expensive, and always commissioning.", price: 8, quality: 3.4, marketing: 1.15, brand: 58, subscribers: 220 },
  { id: "streamly", name: "Streamly", color: "#2ECC71", personality: "chaotic", blurb: "Brilliant one month and a mess the next.", price: 5, quality: 2.2, marketing: 1.25, brand: 50, subscribers: 150 },
  { id: "cinebox", name: "Cinebox", color: "#F5A623", personality: "premium", blurb: "Fewer subscribers, very proud of the catalogue.", price: 12, quality: 4.2, marketing: 1.05, brand: 62, subscribers: 130 },
];

const UPGRADES = [
  { id: "commission", group: "Content", name: "Commission an original", effect: "Pick a genre and a budget", action: "commission", icon: "sitcom" },
  { id: "movies", group: "Content", name: "License a movie library", effect: "180-day catalogue contract", action: "license", cost: 5000, icon: "movies" },
  { id: "sports", group: "Content", name: "Sign sports rights", effect: "90-day deal, heavy upkeep", action: "license", cost: 50000, icon: "sports" },
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
  { id: "global", at: 1000000, name: "Global Giant", line: "A million subscribers. The world is watching.", win: true },
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
  { selector: "#price-slider", text: "Monthly price changes growth and churn. Five dollars is the balanced point. Above fifteen, the brand starts to sour." },
  { selector: ".upgrades", text: "Commission originals by genre and budget. Bigger budgets take longer and hit more often. Licences expire." },
  { selector: "#posters", text: "The library shows work in production and titles on the service. Click a tile for freshness, upkeep, and the contract." },
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
let tutorialIndex = -1;
let settings = { animations: true, tutorialDismissed: false };
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
  return DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
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
  const age = Math.max(0, state.day - (title.releaseDay || 0));
  return clamp(1 - age / 120, 0.2, 1);
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

function currentQuality() {
  if (qualityOverride != null) return qualityOverride;
  let quality = 1;
  titles.forEach((title) => {
    quality += titleContribution(title);
  });
  const count = releasedGenres().size;
  if (count >= 5) quality *= 1.2;
  else if (count >= 3) quality *= 1.1;
  return quality;
}

function varietyLabel() {
  const count = releasedGenres().size;
  if (count >= 5) return "Variety +20%";
  if (count >= 3) return "Variety +10%";
  return "";
}

function activeSports() {
  return titles.some((title) => title.licenseId === "sports" && title.status === "released" && title.contractDays > 0 && !effects.some((effect) => effect.sportsPause));
}

function currentMarketing() {
  if (marketingOverride != null) return marketingOverride;
  let marketing = 1 - (state.marketingPenalty || 0);
  UPGRADES.forEach((upgrade) => {
    if (upgrade.marketing) marketing += upgrade.marketing * ownedCount(upgrade.id);
  });
  if (activeSports()) marketing += LICENSES.sports.marketing;
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

function priceAttractiveness(monthlyPrice) {
  return Math.pow(5 / monthlyPrice, 0.65);
}

function churnRate(monthlyPrice, contentQuality, recommendationLevel = 0, serverLevelValue = 0) {
  const span = MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE;
  const priceLift = Math.pow((monthlyPrice - MIN_MONTHLY_PRICE) / span, 1.35);
  const base = 0.0015 + priceLift * 0.02;
  const qualityRelief = 1 / (1 + Math.max(0, contentQuality - 1) * 0.22);
  const buffering = BUFFERING_CHURN * Math.pow(0.5, serverLevelValue);
  const rate = (base * qualityRelief + buffering) * Math.pow(0.9, recommendationLevel);
  return clamp(rate, 0.001, 0.08);
}

function baseGrowth(subscribers) {
  return BASE_FLAT_SIGNUPS + subscribers * ORGANIC_SIGNUP_RATE;
}

function subscriberGrowth(subscribers, contentQuality, marketingMultiplier, monthlyPrice) {
  return baseGrowth(subscribers) * contentQuality * marketingMultiplier * priceAttractiveness(monthlyPrice);
}

function freeNetChange(freeUsers, freeTier, monthlyPrice, contentQuality, recommendationLevel, serverLevelValue) {
  if (freeTier <= 0) return 0;
  const signups = (2 + freeUsers * 0.012) * freeTier * priceAttractiveness(monthlyPrice);
  const leaving = freeUsers * churnRate(monthlyPrice, contentQuality, recommendationLevel, serverLevelValue) * 0.7;
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

function snapshot() {
  const paid = paidSubscribers();
  const quality = currentQuality();
  const marketing = currentMarketing();
  const upkeep = currentUpkeep();
  const recommendations = ownedCount("recommendations");
  const servers = serverLevel();
  const freeUsers = state.freeUsers || 0;
  const attractiveness = priceAttractiveness(state.monthlyPrice);
  const tam = totalTam();
  let extraChurn = 0;
  if (tam > 0 && paid > tam) extraChurn = clamp((paid / tam - 1) * 0.08, 0, 0.12);
  const churn = clamp(churnRate(state.monthlyPrice, quality, recommendations, servers) + extraChurn, 0.001, 0.2);
  const brandMod = 1 + clamp((state.brand - 50) / 50, -1, 1) * 0.2;
  const effectMod = effects.reduce((product, effect) => product * (effect.growth || 1), 1);
  const achievementMod = 1 + achievements.size * 0.01;
  const organic = subscriberGrowth(paid, quality, marketing, state.monthlyPrice) * brandMod * effectMod * achievementMod;
  const playerAppeal = appealOf(quality, marketing, state.monthlyPrice, state.brand);
  const rivalAppeal = rivals.reduce((sum, rival) => sum + appealOf(rival.quality, rival.marketing, rival.price, rival.brand), 0);
  const share = playerAppeal / (playerAppeal + rivalAppeal || 1);
  const newcomers = (1.2 + tam * 0.00004) * share;
  const incoming = Math.max(0, organic + newcomers);
  const leaving = paid * churn;
  const effectRevenue = effects.reduce((sum, effect) => sum + (effect.revenuePerDay || 0), 0);
  const effectCost = effects.reduce((sum, effect) => sum + (effect.costPerDay || 0), 0);
  const adRevenue = freeUsers * FREE_USER_AD_REVENUE;
  const revenue = dailyRevenue(paid, state.monthlyPrice) + adRevenue + effectRevenue;
  const costs = dailyCosts(paid, upkeep) + effectCost + revenue * (state.revenueShare || 0);
  const netFree = freeNetChange(freeUsers, ownedCount("free-tier"), state.monthlyPrice, quality, recommendations, servers);
  state.subscribers = paid;

  return {
    serviceName: SERVICE_NAME,
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
    bufferingChurn: BUFFERING_CHURN * Math.pow(0.5, servers),
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
    const priceFit = Math.pow((def.tolerance * 5) / state.monthlyPrice, 0.65);
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
  if (state.cash < budget.cost) return false;
  clearOverrides();
  state.cash = roundCents(state.cash - budget.cost);
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
  });
  pushEvent(state.day, [{ text: `${title.name} enters production (${budget.name}, ${budget.days} days).`, tone: "neutral" }], "money");
  saveGame();
  syncView();
  return true;
}

function licenseCost(id) {
  const def = LICENSES[id];
  const generation = state.licenseGeneration[id] || 0;
  return Math.round(def.cost * Math.pow(1.2, generation));
}

function activeLicense(id) {
  return titles.some((title) => title.licenseId === id && title.status === "released" && title.contractDays > 0);
}

function signLicense(id, silent) {
  if (state.status !== "playing" && !silent) return false;
  const def = LICENSES[id];
  if (!def || activeLicense(id)) return false;
  const cost = licenseCost(id);
  if (state.cash < cost) return false;
  clearOverrides();
  state.cash = roundCents(state.cash - cost);
  state.licenseGeneration[id] = (state.licenseGeneration[id] || 0) + 1;
  if (id === "sports") state.sportsSigned = true;
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
  if (upgrade.action === "license") return !!signLicense(id);
  const count = ownedCount(id);
  const cost = upgradeCost(upgrade, count);
  if (state.cash < cost) return false;
  clearOverrides();
  state.cash = roundCents(state.cash - cost);
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
  if (state.cash < def.unlock) return false;
  state.cash = roundCents(state.cash - def.unlock);
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
  if (state.cash < def.localise) return false;
  state.cash = roundCents(state.cash - def.localise);
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
  const outcome = rollOutcome(budget);
  title.status = "released";
  title.outcome = outcome;
  title.releaseDay = state.day;
  title.upkeep = title.plannedUpkeep || budget.upkeep;
  state.releaseCount += 1;
  if (outcome === "hit") {
    title.quality = budget.quality * 1.5;
    state.hitCount += 1;
    changeBrand(4, "Hit");
    effects.push({ id: `hit-${title.id}`, sourceId: title.id, label: `${title.name} is a hit`, days: 30, growth: 1.5 });
    pushEvent(state.day, [{ text: `HIT! ${title.name} is everywhere. +50% growth for 30 days.`, tone: "up" }], "events");
  } else if (outcome === "flop") {
    title.quality = budget.quality * 0.5;
    state.flopCount += 1;
    changeBrand(-3, "Flop");
    pushEvent(state.day, [{ text: `${title.name} flopped. Half the quality, and the brand winced.`, tone: "down" }], "events");
  } else {
    title.quality = budget.quality;
    pushEvent(state.day, [{ text: `${title.name} is out. Solid, not legendary.`, tone: "neutral" }], "events");
  }
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
  const cost = licenseCost(title.licenseId);
  if (state.cash < cost) return false;
  state.cash = roundCents(state.cash - cost);
  state.licenseGeneration[title.licenseId] = (state.licenseGeneration[title.licenseId] || 0) + 1;
  title.contractDays = LICENSES[title.licenseId].days;
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

function offerRenewal(title) {
  if (pendingRenew.has(title.id)) return;
  pendingRenew.add(title.id);
  const cost = licenseCost(title.licenseId);
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
  titles.forEach((title) => {
    if (title.kind !== "licensed" || title.status !== "released") return;
    if (pendingRenew.has(title.id)) return;
    title.contractDays -= 1;
    if (title.contractDays === 10) offerRenewal(title);
    else if (title.contractDays <= 0) expireLicense(title);
  });
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
    const newcomers = (1.2 + tam * 0.00004) * (rivalAppealNow(rival) / (totalAppeal || 1));
    const churn = churnRate(rival.price, rival.quality, 0, 1);
    let net = (organic + newcomers - rival.subscribers * churn) * difficulty().rivalStrength;
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
  REGIONS.forEach((def) => {
    const region = state.regions[def.id];
    if (region.unlocked) region.tam *= 1.0012;
  });
}

function checkEndings() {
  if (state.status !== "playing") return;
  const paid = paidSubscribers();
  if (paid >= WIN_SUBSCRIBERS) {
    state.status = "won";
    pushEvent(state.day, [{ text: "Global Giant. A million subscribers.", tone: "up" }], "events");
    return;
  }
  if (!difficulty().canLose) {
    state.daysBelowLoseLine = 0;
    return;
  }
  if (state.cash < LOSE_CASH) {
    state.daysBelowLoseLine += 1;
    if (state.daysBelowLoseLine === 1 || state.daysBelowLoseLine === 10 || state.daysBelowLoseLine === 20) {
      pushEvent(state.day, [{ text: `Debt streak ${state.daysBelowLoseLine}/${LOSE_STREAK_DAYS}. Cash is ${formatCash(state.cash)}.`, tone: "warn" }], "money");
    }
    if (state.daysBelowLoseLine >= LOSE_STREAK_DAYS) {
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
    state.cash = roundCents(state.cash + value);
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
  { id: "scandal", emoji: "🎭", title: "The lead is trending", description: "Not for the performance. The group chat has picked a side, and it is not yours.", weight: 3, minDay: 16, condition: () => titles.some((title) => title.kind === "original" && title.status === "released"), autoOption: 0, options: [
    { id: "pull", label: "Pull the show", summary: "That title's quality leaves with it. Brand steadies.", effects: [{ type: "pull" }, { type: "brand", value: 1, reason: "Pulled the show" }] },
    { id: "ride", label: "Ride it out", summary: "Brand -6, but infamous shows travel. +25% growth for 10 days.", effects: [{ type: "brand", value: -6, reason: "Scandal", scale: true }, { type: "growth", value: 1.25, days: 10, label: "Infamous buzz" }] },
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
];

function eventWeight(event) {
  if (state.day < (event.minDay || 0)) return 0;
  if (event.condition && !event.condition()) return 0;
  return event.weight || 1;
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
  if (state.cash < 0) return { problem: "Cash is below zero.", tip: "Ease off commissions and let a gentler price rebuild the balance." };
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
  const profit = recent.reduce((sum, row) => sum + row.revenue - row.costs, 0);
  const then = history.length > 30 ? history[history.length - 31] : history[0];
  const report = {
    profit,
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

function recordScore() {
  if (state.scoreSaved || typeof localStorage === "undefined") return;
  const all = readScores();
  const list = Array.isArray(all[state.difficulty]) ? all[state.difficulty] : [];
  list.push({
    score: computeScore(),
    day: state.day,
    subs: Math.round(paidSubscribers()),
    cash: Math.round(state.cash),
    brand: Math.round(state.brand),
  });
  list.sort((a, b) => b.score - a.score);
  all[state.difficulty] = list.slice(0, 5);
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
  decayEffects();
  advanceProductions();
  advanceContracts();
  const before = snapshot();
  const playerBefore = before.subscribers;
  applyNumbers(before, offline);
  tickRivals(playerBefore);
  growMarkets();
  if (state.day % 60 === 0) driftTrends();
  driftBrand(before);
  history.push(Math.round(paidSubscribers()));
  if (history.length > MAX_HISTORY) history.shift();
  analytics.push({ revenue: before.dailyRevenue, costs: before.dailyCosts, churn: before.churnRate });
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

function catchUp(days) {
  const startCash = state.cash;
  const startSubs = paidSubscribers();
  const before = new Set(achievements);
  offlineNotes = [];
  const count = Math.max(0, Math.min(300, Math.floor(days)));
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
  console.log(`${SERVICE_NAME} is open on ${difficulty().name}. Cash ${formatCash(state.cash)}, subscribers ${formatSubscribers(paidSubscribers())}.`);
}

function logDay(before, after) {
  console.log(`${SERVICE_NAME} Day ${after.day} Cash ${formatCash(after.cash)} (${formatSignedMoney(before.netCash)}) Subs ${formatSubscribers(after.subscribers)} (${formatSignedNumber(before.netPaid, 2)})`);
}

function start() {
  if (timerId !== null || !state || state.status !== "playing" || state.paused || blocking || welcomeHold || menuDepth > 0) return;
  if (!hasUi()) return;
  const ms = Math.max(200, Math.round(TICK_MS / (state.speed || 1)));
  timerId = setInterval(() => tick(), ms);
}

function stop() {
  if (timerId === null) return;
  clearInterval(timerId);
  timerId = null;
}

function setSpeed(value) {
  if (value === 0) {
    state.paused = true;
  } else {
    state.paused = false;
    state.speed = value;
  }
  stop();
  start();
  paintSpeed();
  saveGame();
}

function beginGame(difficultyId) {
  stop();
  blocking = false;
  welcomeHold = false;
  menuDepth = 0;
  promptQueue = [];
  resetProgress(difficultyId || "normal");
  if (hasUi()) {
    hideStart();
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
  state.status = "setup";
  clearSave();
  if (hasUi()) {
    resetUi();
    showStart();
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
  return {
    day: 0,
    category: "events",
    parts: [{ text: `${SERVICE_NAME} is open on ${diffName}. ${formatSubscribers(STARTING_SUBSCRIBERS)} subscribers, ${formatCash(cash)} cash.`, tone: "neutral" }],
  };
}

function pushEvent(day, parts, category) {
  uiEvents.unshift({ day, category: category || "events", parts });
  if (uiEvents.length > MAX_LOG_ENTRIES) uiEvents.length = MAX_LOG_ENTRIES;
  renderLog();
}

function serialize() {
  return {
    version: 2,
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
  if (typeof localStorage === "undefined" || !state || state.status === "setup") return;
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

function applyLoaded(data) {
  state = data.state;
  state.regions = state.regions || createRegions();
  state.genreTrends = { ...defaultTrends(), ...(state.genreTrends || {}) };
  state.licenseGeneration = { movies: 0, sports: 0, ...(state.licenseGeneration || {}) };
  state.recentEvents = state.recentEvents || [];
  state.eventDays = state.eventDays || [];
  state.freeUsers = Number.isFinite(state.freeUsers) ? state.freeUsers : 0;
  owned = { ...emptyOwned(), ...(data.owned || {}) };
  titles = Array.isArray(data.titles) ? data.titles : [];
  rivals = Array.isArray(data.rivals) ? data.rivals : createRivals(difficulty());
  effects = Array.isArray(data.effects) ? data.effects : [];
  analytics = Array.isArray(data.analytics) ? data.analytics : [];
  history = Array.isArray(data.history) && data.history.length ? data.history.slice(-MAX_HISTORY) : [Math.round(paidSubscribers())];
  milestonesSeen = new Set(data.milestones || []);
  achievements = new Set(data.achievements || []);
  titleSerial = data.titleSerial || titles.length + 1;
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
  if (data.version !== 2 && !data.state.regions) return false;
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
}

function releaseClock() {
  menuDepth = Math.max(0, menuDepth - 1);
  start();
}

function enqueuePrompt(prompt) {
  promptQueue.push(prompt);
  pumpPrompts();
}

function pumpPrompts() {
  if (!hasUi() || blocking || !promptQueue.length) {
    if (!blocking && !welcomeHold && menuDepth === 0) start();
    return;
  }
  blocking = true;
  stop();
  const prompt = promptQueue.shift();
  if (prompt.type === "event") openEvent(prompt.event);
  else if (prompt.type === "renew") openRenew(prompt.titleId, prompt.cost);
  else if (prompt.type === "weekly") openWeekly(prompt.report);
  else if (prompt.type === "milestone") openMilestone(prompt.milestone);
}

function dismissBlock() {
  blocking = false;
  ["event-modal", "renew-modal", "weekly-modal", "milestone-modal"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  pumpPrompts();
}

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
    button.append(name, summary);
    root.append(button);
  });
  document.getElementById("event-modal").hidden = false;
}

function openRenew(titleId, cost) {
  const title = titles.find((item) => item.id === titleId);
  pendingRenewId = titleId;
  setText("renew-title", title ? title.name : "Licence");
  setText("renew-copy", `${title ? title.name : "This licence"} has 10 days left. Renewing costs ${formatCash(cost)}. Letting it go removes its quality.`);
  const yes = document.getElementById("renew-yes");
  yes.disabled = state.cash < cost;
  yes.textContent = state.cash < cost ? `Need ${formatCash(cost)}` : `Renew ${formatCash(cost)}`;
  document.getElementById("renew-modal").hidden = false;
}

function openWeekly(report) {
  const root = document.getElementById("weekly-body");
  root.replaceChildren();
  [
    ["Profit, 30 days", formatCash(report.profit)],
    ["Subscribers", formatSignedNumber(report.subChange, 0)],
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

function showStart() {
  const screen = document.getElementById("start-screen");
  if (!screen) return;
  const scores = readScores();
  const list = document.getElementById("start-scores");
  list.replaceChildren();
  Object.keys(DIFFICULTIES).forEach((id) => {
    const best = (scores[id] || [])[0];
    if (!best) return;
    const item = document.createElement("li");
    item.textContent = `${DIFFICULTIES[id].name} best ${Math.round(best.score).toLocaleString("en-US")}`;
    list.append(item);
  });
  screen.hidden = false;
}

function hideStart() {
  const screen = document.getElementById("start-screen");
  if (screen) screen.hidden = true;
}

function showEndScreen() {
  const win = document.getElementById("win-screen");
  const lose = document.getElementById("lose-screen");
  if (!win || !lose) return;
  if (state.status === "won" || state.status === "sold") {
    lose.hidden = true;
    setText("win-heading", state.status === "sold" ? "Bought Out" : "Global Giant");
    setText("win-line", state.status === "sold" ? "A rival wrote the cheque. The catalogue is theirs now." : "A million subscribers. The world is watching.");
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
  const list = readScores()[state.difficulty] || [];
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
  });
}

function paint(view) {
  document.querySelectorAll(".js-service-name").forEach((el) => {
    el.textContent = SERVICE_NAME;
  });
  document.title = SERVICE_NAME;
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
    const count = ownedCount(upgrade.id);
    let cost = upgradeCost(upgrade);
    let affordable = view.status === "playing" && view.cash >= cost;
    if (upgrade.action === "commission") {
      cost = BUDGETS.low.cost;
      affordable = view.status === "playing" && view.cash >= cost;
    }
    if (upgrade.action === "license") {
      const live = activeLicense(upgrade.id);
      affordable = view.status === "playing" && !live && view.cash >= cost;
      card.classList.toggle("is-unaffordable", !affordable);
    } else {
      card.classList.toggle("is-unaffordable", !affordable);
    }
    const costEl = card.querySelector(".upgrade-cost");
    if (costEl) costEl.textContent = upgrade.action === "commission" ? `From ${formatCash(BUDGETS.low.cost)}` : formatCash(cost);
    const badge = card.querySelector(".owned-badge");
    if (badge) {
      const liveLicense = upgrade.action === "license" && activeLicense(upgrade.id);
      badge.hidden = count <= 0 && !liveLicense;
      badge.textContent = liveLicense ? "Live" : `x${count}`;
    }
    const button = card.querySelector(".buy-button");
    if (button) {
      button.disabled = !affordable;
      button.textContent = upgrade.action === "commission" ? "New" : upgrade.action === "license" && activeLicense(upgrade.id) ? "Live" : "Buy";
    }
  });
}

function renderLibrary() {
  const root = document.getElementById("posters");
  const empty = document.getElementById("library-empty");
  if (!root) return;
  const visible = titles.filter((title) => title.status === "producing" || title.status === "released");
  if (empty) empty.hidden = visible.length > 0;
  root.replaceChildren();
  visible.forEach((title) => {
    const tile = document.createElement("article");
    tile.className = "poster";
    tile.dataset.title = title.id;
    tile.style.background = GENRE_GRADIENTS[title.genre] || GENRE_GRADIENTS.Drama;
    if (title.status === "producing") tile.classList.add("is-producing");
    if (title.outcome === "hit") {
      const badge = document.createElement("span");
      badge.className = "poster-badge hit";
      badge.textContent = "HIT!";
      tile.append(badge);
    } else if (title.outcome === "flop") {
      const badge = document.createElement("span");
      badge.className = "poster-badge flop";
      badge.textContent = "FLOP";
      tile.append(badge);
    }
    const name = document.createElement("p");
    name.className = "poster-title";
    name.textContent = title.name;
    const meta = document.createElement("p");
    meta.className = "poster-genre";
    if (title.status === "producing") meta.textContent = `${title.genre} · ${Math.max(0, title.daysLeft)}d`;
    else if (title.kind === "licensed") meta.textContent = `${title.genre} · ${Math.max(0, title.contractDays)}d`;
    else meta.textContent = title.genre;
    tile.append(name, meta);
    if (title.status === "producing" && title.totalDays) {
      const bar = document.createElement("div");
      bar.className = "progress";
      const span = document.createElement("span");
      span.style.width = `${clamp((1 - title.daysLeft / title.totalDays) * 100, 0, 100)}%`;
      bar.append(span);
      tile.append(bar);
    }
    root.append(tile);
  });
  for (let i = visible.length; i < 4; i += 1) {
    const slot = document.createElement("div");
    slot.className = "poster-empty";
    root.append(slot);
  }
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
      button.textContent = `Localise ${formatCash(def.localise)}`;
      button.disabled = state.cash < def.localise || state.status !== "playing";
      card.append(button);
    } else if (!region.unlocked) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "buy-button";
      button.dataset.unlock = def.id;
      button.textContent = `Unlock ${formatCash(def.unlock)}`;
      button.disabled = state.cash < def.unlock || state.status !== "playing";
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
  const rows = [{ id: "player", name: SERVICE_NAME, color: "#E50914", subs: paidSubscribers(), player: true, history }];
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
    hint.textContent = unlocked ? `${achievement.hint} Reward: +1% growth.` : achievement.hint;
    card.append(mark, title, hint);
    root.append(card);
  });
}

function contentRows() {
  const view = snapshot();
  const total = view.titles.reduce((sum, title) => sum + title.contribution, 0) + 1;
  return view.titles.map((title) => ({
    title: title.name,
    genre: title.genre,
    status: title.status === "producing" ? "In production" : title.outcome === "hit" ? "HIT" : title.outcome === "flop" ? "Flop" : title.outcome === "licensed" ? "Licensed" : title.status === "expired" ? "Expired" : title.status === "pulled" ? "Pulled" : "Average",
    cost: title.cost || 0,
    revenue: total > 0 ? view.dailyRevenue * title.contribution / total : 0,
  }));
}

function renderAnalytics() {
  drawLines(document.getElementById("chart-revenue"), [
    { color: "#2ECC71", values: analytics.map((row) => row.revenue) },
    { color: "#FF4D4F", values: analytics.map((row) => row.costs) },
  ]);
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
    return String(a[tableSort.key]).localeCompare(String(b[tableSort.key])) * dir;
  });
  body.replaceChildren();
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    [row.title, row.genre, row.status, formatCash(row.cost), formatSignedMoney(row.revenue).replace("+", "")].forEach((value) => {
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
  const paid = paidSubscribers();
  const quality = currentQuality();
  const marketing = currentMarketing();
  const attractiveness = priceAttractiveness(price);
  const churn = churnRate(price, quality, ownedCount("recommendations"), serverLevel());
  const organic = baseGrowth(paid) * quality * marketing * attractiveness;
  const expected = Math.max(0, paid + organic - paid * churn);
  const revenue = expected * (price / 30) + (state.freeUsers || 0) * FREE_USER_AD_REVENUE;
  const costs = dailyCosts(expected, currentUpkeep());
  return revenue - costs;
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
}

function openDetail(id) {
  const title = titles.find((item) => item.id === id);
  if (!title) return;
  holdClock();
  setText("detail-title", title.name);
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
  if (typeof localStorage === "undefined") return { animations: true, tutorialDismissed: false };
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { animations: data.animations !== false, tutorialDismissed: !!data.tutorialDismissed };
  } catch (err) {
    return { animations: true, tutorialDismissed: false };
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
  const cashEl = document.getElementById("cash-value");
  const subsEl = document.getElementById("subs-value");
  if (cashEl) renderCash(cashEl, before.cash);
  if (subsEl) renderSubscribers(subsEl, before.subscribers);
  animateValue("cash-value", before.cash, after.cash, renderCash);
  animateValue("subs-value", before.subscribers, after.subscribers, renderSubscribers);
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
  data.version = 2;
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
  document.getElementById("price-slider").addEventListener("change", saveGame);
  document.querySelector(".tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (tab) showTab(tab.dataset.tab);
  });
  document.querySelector(".filters").addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    logFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((el) => el.classList.toggle("is-on", el === button));
    renderLog();
  });
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
  document.getElementById("renew-yes").addEventListener("click", () => {
    if (renewTitle(pendingRenewId)) {
      document.getElementById("renew-modal").hidden = true;
      dismissBlock();
    }
  });
  document.getElementById("renew-no").addEventListener("click", () => {
    dropLicense(pendingRenewId);
    document.getElementById("renew-modal").hidden = true;
    dismissBlock();
  });
  document.getElementById("weekly-close").addEventListener("click", dismissBlock);
  document.getElementById("milestone-continue").addEventListener("click", dismissBlock);
  document.getElementById("welcome-close").addEventListener("click", () => {
    document.getElementById("welcome-modal").hidden = true;
    welcomeHold = false;
    start();
  });
  document.getElementById("commission-cancel").addEventListener("click", closeCommission);
  document.getElementById("win-again").addEventListener("click", returnToMenu);
  document.getElementById("lose-again").addEventListener("click", returnToMenu);
  document.getElementById("difficulty-grid").addEventListener("click", (event) => {
    const card = event.target.closest("[data-difficulty]");
    if (card) beginGame(card.dataset.difficulty);
  });
  document.getElementById("tutorial-next").addEventListener("click", () => openTutorial(tutorialIndex + 1));
  document.getElementById("tutorial-skip").addEventListener("click", () => openTutorial(TUTORIAL.length));
  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.closest ? event.target.closest("input, textarea, button") : null;
    if (event.key === "Escape") {
      if (!document.getElementById("commission-modal").hidden) closeCommission();
      else if (!document.getElementById("detail-modal").hidden) {
        document.getElementById("detail-modal").hidden = true;
        releaseClock();
      } else if (!document.getElementById("settings-modal").hidden) closeSettings();
      else if (!document.getElementById("rival-modal").hidden) {
        document.getElementById("rival-modal").hidden = true;
        releaseClock();
      } else if (!document.getElementById("milestone-modal").hidden) dismissBlock();
      return;
    }
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
}

function mountUi() {
  if (!hasUi()) return;
  bindUi();
  renderUpgradeList();
  saveSettings();
  resetUi();
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
  const loaded = loadGame();
  mountUi();
  if (!loaded) {
    state.status = "setup";
    showStart();
  } else if (state.status === "playing") {
    const missed = Math.max(0, Math.min(300, Math.floor((Date.now() - (state.savedAt || Date.now())) / 1000)));
    startAutosave();
    if (missed >= 1) {
      const summary = catchUp(missed);
      showWelcome(summary);
    } else {
      start();
    }
  } else {
    showEndScreen();
  }
}
