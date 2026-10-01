"use strict";

/**
 * StreamCo day loop, economy, and dashboard.
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
    `%c${SERVICE_NAME}%c dashboard running. 1 real second = 1 day. ` +
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
  renderTick(before, after);
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
  resetUi();
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
  syncView();
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
  syncView();
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
  syncView();
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
  syncView();
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

const MAX_LOG_ENTRIES = 40;
const animators = new Map();
const deltaTimers = new Map();
let uiEvents = [];
let uiBound = false;

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
  if (Number.isInteger(quality)) return String(quality);
  return quality.toFixed(1);
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
  setText("tier-name", tierName(view.subscribers));
  setText("quality-value", formatQuality(view.contentQuality));
  setText("revenue-value", formatMoneyPrecise(view.dailyRevenue));
  setText("costs-value", formatMoneyPrecise(view.dailyCosts));
  setText("churn-value", `${(view.churnRate * 100).toFixed(2)}% · ${view.churnLabel}`);

  const outcome = document.getElementById("outcome");
  if (!outcome) return;
  if (view.status === "won") {
    outcome.hidden = false;
    outcome.className = "outcome won";
    outcome.textContent = `You reached ${formatSubscribers(WIN_SUBSCRIBERS)} subscribers.`;
  } else if (view.status === "lost") {
    outcome.hidden = false;
    outcome.className = "outcome lost";
    outcome.textContent = `Cash stayed below ${formatCash(LOSE_CASH)} for ${LOSE_STREAK_DAYS} days.`;
  } else {
    outcome.hidden = true;
    outcome.className = "outcome";
    outcome.textContent = "";
  }
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

  const duration = 180;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    render(el, from + (to - from) * eased);
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
      span.className = `log-part ${part.tone}`;
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
}

function renderTick(before, after) {
  if (!hasUi()) return;
  paint(after);

  const cashEl = document.getElementById("cash-value");
  const subsEl = document.getElementById("subs-value");
  if (cashEl) renderCash(cashEl, before.cash);
  if (subsEl) renderSubscribers(subsEl, before.subscribers);

  animateValue("cash-value", before.cash, after.cash, renderCash);
  animateValue("subs-value", before.subscribers, after.subscribers, renderSubscribers);
  flashStat("cash-value", after.cash - before.cash);
  flashStat("subs-value", after.subscribers - before.subscribers);

  if (before.netCash !== 0) {
    showDelta("cash-delta", formatSignedMoney(before.netCash), before.netCash > 0 ? "up" : "down");
  }
  if (before.netSubscribers !== 0) {
    showDelta(
      "subs-delta",
      formatSignedNumber(before.netSubscribers, 2),
      before.netSubscribers > 0 ? "up" : "down"
    );
  }

  const parts = [
    {
      text: `${formatSignedNumber(before.netSubscribers, 2)} subscribers`,
      tone: before.netSubscribers < 0 ? "down" : "up",
    },
    { text: ", ", tone: "neutral" },
    {
      text: `${formatSignedMoney(before.netCash)} cash`,
      tone: before.netCash < 0 ? "down" : "up",
    },
  ];
  if (after.daysBelowLoseLine > 0) {
    parts.push({
      text: ` Debt streak ${after.daysBelowLoseLine}/${LOSE_STREAK_DAYS}.`,
      tone: "warn",
    });
  }
  if (after.status === "won") {
    parts.push({ text: " Global Giant.", tone: "up" });
  } else if (after.status === "lost") {
    parts.push({ text: " The service closes.", tone: "down" });
  }
  pushEvent(after.day, parts);
}

function resetUi() {
  animators.forEach((frame) => cancelAnimationFrame(frame));
  animators.clear();
  deltaTimers.forEach((timer) => clearTimeout(timer));
  deltaTimers.clear();
  uiEvents = [openingEvent()];
  if (!hasUi()) return;
  paint(snapshot());
  renderLog();
  const cashDelta = document.getElementById("cash-delta");
  const subsDelta = document.getElementById("subs-delta");
  if (cashDelta) cashDelta.textContent = "";
  if (subsDelta) subsDelta.textContent = "";
}

function mountUi() {
  if (!hasUi()) return;
  if (!uiBound) {
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        const confirmed = window.confirm(`Reset ${SERVICE_NAME}? The current run will be lost.`);
        if (confirmed) reset();
      });
    }
    uiBound = true;
  }
  resetUi();
}

if (typeof document !== "undefined") {
  document.title = SERVICE_NAME;
  mountUi();
  logIntro();
  start();
}
