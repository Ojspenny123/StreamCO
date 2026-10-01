"use strict";

/**
 * Step 1: one-second game loop and the daily cash / subscriber model.
 * Change the service name here only.
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

const WIN_SUBSCRIBERS = 1000000;
const LOSE_CASH = -50000;
const LOSE_STREAK_DAYS = 30;

const BASE_RUNNING_COST = 8;
const PER_SUBSCRIBER_RUNNING_COST = 0.004;
const BASE_FLAT_SIGNUPS = 1.5;
const ORGANIC_SIGNUP_RATE = 0.008;

let timerId = null;
let state = createInitialState();

function createInitialState() {
  return {
    day: 0,
    cash: STARTING_CASH,
    subscribers: STARTING_SUBSCRIBERS,
    contentQuality: STARTING_CONTENT_QUALITY,
    monthlyPrice: STARTING_MONTHLY_PRICE,
    marketingMultiplier: STARTING_MARKETING_MULTIPLIER,
    contentUpkeep: STARTING_CONTENT_UPKEEP,
    daysBelowLoseLine: 0,
    status: "playing",
  };
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

/**
 * Price attractiveness falls as the monthly price rises.
 * $5 => 1. About 1.8 at $2, about 0.4 at $20.
 */
function priceAttractiveness(monthlyPrice) {
  return Math.pow(5 / monthlyPrice, 0.65);
}

/**
 * Daily fraction of subscribers who leave.
 * Rises with price and falls with content quality.
 */
function churnRate(monthlyPrice, contentQuality) {
  const span = MAX_MONTHLY_PRICE - MIN_MONTHLY_PRICE;
  const priceLift = Math.pow((monthlyPrice - MIN_MONTHLY_PRICE) / span, 1.35);
  const base = 0.0015 + priceLift * 0.02;
  const qualityRelief = 1 / (1 + Math.max(0, contentQuality - 1) * 0.22);
  return clamp(base * qualityRelief, 0.001, 0.08);
}

function baseGrowth(subscribers) {
  return BASE_FLAT_SIGNUPS + subscribers * ORGANIC_SIGNUP_RATE;
}

/** Gross new subscribers today, before churn. */
function subscriberGrowth(subscribers, contentQuality, marketingMultiplier, monthlyPrice) {
  return (
    baseGrowth(subscribers) *
    contentQuality *
    marketingMultiplier *
    priceAttractiveness(monthlyPrice)
  );
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

function formatSubscribers(value) {
  const n = Math.round(value);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 10000) return `${sign}${(abs / 1000).toFixed(1)}K`;
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
  const attractiveness = priceAttractiveness(state.monthlyPrice);
  const churn = churnRate(state.monthlyPrice, state.contentQuality);
  const growth = subscriberGrowth(
    state.subscribers,
    state.contentQuality,
    state.marketingMultiplier,
    state.monthlyPrice
  );
  const leaving = state.subscribers * churn;
  const revenue = dailyRevenue(state.subscribers, state.monthlyPrice);
  const costs = dailyCosts(state.subscribers, state.contentUpkeep);

  return {
    serviceName: SERVICE_NAME,
    day: state.day,
    cash: state.cash,
    subscribers: state.subscribers,
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
    baseGrowth: baseGrowth(state.subscribers),
    subscriberGrowth: growth,
    subscribersLost: leaving,
    netSubscribers: growth - leaving,
    dailyRevenue: revenue,
    runningCosts: runningCosts(state.subscribers),
    dailyCosts: costs,
    netCash: revenue - costs,
  };
}

function logIntro() {
  const view = snapshot();
  console.log(
    `%c${SERVICE_NAME}%c console simulation. 1 real second = 1 day. ` +
      `Cash ${formatCash(view.cash)}, subscribers ${formatSubscribers(view.subscribers)}, ` +
      `quality ${view.contentQuality}, price ${formatPrice(view.monthlyPrice)}. ` +
      `Growth: ${view.growthLabel} / Churn: ${view.churnLabel}. ` +
      `Commands: StreamCo.getState(), StreamCo.setMonthlyPrice(8), StreamCo.stop().`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0"
  );
}

function logDay(before, after) {
  const cashColor = after.cash < 0 ? "color:#FF4D4F;font-weight:700" : "color:#FFFFFF;font-weight:700";
  const deltaSubColor = before.netSubscribers < 0 ? "color:#FF4D4F;font-weight:700" : "color:#2ECC71;font-weight:700";
  const deltaCashColor = before.netCash < 0 ? "color:#FF4D4F;font-weight:700" : "color:#2ECC71;font-weight:700";
  const debtNote = after.daysBelowLoseLine > 0
    ? `  Debt streak ${after.daysBelowLoseLine}/${LOSE_STREAK_DAYS}`
    : "";

  console.log(
    `%c${SERVICE_NAME}%c Day ${after.day}` +
      `  Cash %c${formatCash(after.cash)}%c (%c${formatSignedMoney(before.netCash)}%c)` +
      `  Subs %c${formatSubscribers(after.subscribers)}%c (%c${formatSignedNumber(before.netSubscribers, 2)}%c)` +
      `  Quality ${after.contentQuality}` +
      `  Price ${formatPrice(after.monthlyPrice)}` +
      `  Growth ${before.growthLabel}` +
      `  Churn ${before.churnLabel} ${(before.churnRate * 100).toFixed(2)}%` +
      `  Revenue $${before.dailyRevenue.toFixed(2)}` +
      `  Costs $${before.dailyCosts.toFixed(2)}` +
      debtNote,
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
      `%c${SERVICE_NAME}%c WIN — ${formatSubscribers(state.subscribers)} subscribers on day ${state.day}. Final cash ${formatCash(state.cash)}.`,
      "color:#E50914;font-weight:700",
      "color:#2ECC71;font-weight:700"
    );
    return;
  }

  if (state.status === "lost") {
    console.log(
      `%c${SERVICE_NAME}%c LOSE — cash stayed below ${formatCash(LOSE_CASH)} for ${LOSE_STREAK_DAYS} days. ` +
        `Day ${state.day}, cash ${formatCash(state.cash)}, subscribers ${formatSubscribers(state.subscribers)}.`,
      "color:#E50914;font-weight:700",
      "color:#FF4D4F;font-weight:700"
    );
  }
}

/**
 * Advance one in-game day. Pass { log: false } to skip the console line.
 */
function tick(options) {
  const shouldLog = !options || options.log !== false;
  if (state.status !== "playing") return snapshot();

  const before = snapshot();
  state.subscribers = roundSubscribers(Math.max(0, state.subscribers + before.netSubscribers));
  state.cash = roundCents(state.cash + before.netCash);
  state.day += 1;

  if (state.cash < LOSE_CASH) state.daysBelowLoseLine += 1;
  else state.daysBelowLoseLine = 0;

  if (state.subscribers >= WIN_SUBSCRIBERS) state.status = "won";
  else if (state.daysBelowLoseLine >= LOSE_STREAK_DAYS) state.status = "lost";

  const after = snapshot();
  if (shouldLog) logDay(before, after);
  if (state.status !== "playing") {
    stop();
    if (shouldLog) logOutcome();
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

function reset() {
  stop();
  state = createInitialState();
  logIntro();
  start();
  return snapshot();
}

function warnNumber(label) {
  console.warn(`${SERVICE_NAME}: ${label} must be a finite number.`);
}

function setMonthlyPrice(price) {
  const next = Number(price);
  if (!Number.isFinite(next)) {
    warnNumber("monthly price");
    return state.monthlyPrice;
  }
  state.monthlyPrice = clamp(roundCents(next), MIN_MONTHLY_PRICE, MAX_MONTHLY_PRICE);
  const view = snapshot();
  console.log(
    `%c${SERVICE_NAME}%c Monthly price set to ${formatPrice(state.monthlyPrice)}. Growth: ${view.growthLabel} / Churn: ${view.churnLabel}.`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0"
  );
  return state.monthlyPrice;
}

function setContentQuality(quality) {
  const next = Number(quality);
  if (!Number.isFinite(next)) {
    warnNumber("content quality");
    return state.contentQuality;
  }
  state.contentQuality = Math.max(0, next);
  console.log(`%c${SERVICE_NAME}%c Content quality set to ${state.contentQuality}.`, "color:#E50914;font-weight:700", "color:#A0A0B0");
  return state.contentQuality;
}

function setMarketingMultiplier(multiplier) {
  const next = Number(multiplier);
  if (!Number.isFinite(next)) {
    warnNumber("marketing multiplier");
    return state.marketingMultiplier;
  }
  state.marketingMultiplier = Math.max(0, next);
  console.log(
    `%c${SERVICE_NAME}%c Marketing multiplier set to ${state.marketingMultiplier}.`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0"
  );
  return state.marketingMultiplier;
}

function setContentUpkeep(upkeep) {
  const next = Number(upkeep);
  if (!Number.isFinite(next)) {
    warnNumber("content upkeep");
    return state.contentUpkeep;
  }
  state.contentUpkeep = Math.max(0, roundCents(next));
  console.log(
    `%c${SERVICE_NAME}%c Content upkeep set to $${state.contentUpkeep.toFixed(2)} per day.`,
    "color:#E50914;font-weight:700",
    "color:#A0A0B0"
  );
  return state.contentUpkeep;
}

const api = {
  SERVICE_NAME,
  MIN_MONTHLY_PRICE,
  MAX_MONTHLY_PRICE,
  WIN_SUBSCRIBERS,
  LOSE_CASH,
  LOSE_STREAK_DAYS,
  getState: snapshot,
  setMonthlyPrice,
  setContentQuality,
  setMarketingMultiplier,
  setContentUpkeep,
  tick,
  start,
  stop,
  reset,
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

if (typeof document !== "undefined") {
  document.title = SERVICE_NAME;
  const nameEl = document.getElementById("service-name");
  if (nameEl) nameEl.textContent = SERVICE_NAME;
  logIntro();
  start();
}
