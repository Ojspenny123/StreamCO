(function () {
  var config = {
    productName: "StreamCo",
    tagline: "Build a streaming empire.",
    liveUrl: "https://comfy-blancmange-b6c90e.netlify.app/",
    holdDays: 30,
    profitableDays: 60,
    healthyDebtRatio: 0.25,
    empire: {
      easy: { companyValue: 50000000, subscribers: 2000000 },
      normal: { companyValue: 150000000, subscribers: 5000000 },
      hard: { companyValue: 400000000, subscribers: 10000000 },
      sandbox: { companyValue: 50000000, subscribers: 2000000 },
    },
    credit: {
      easy: 75000,
      normal: 50000,
      hard: 30000,
      sandbox: 75000,
      dailyInterest: 0.001,
      hardDailyInterest: 0.0015,
      bankruptcyDays: 30,
    },
    difficulties: {
      easy: { id: "easy", name: "Easy", cash: 20000, rivals: 2, severity: 0.6, eventMin: 30, eventSpan: 21, rivalStrength: 0.72, events: true, canLose: true },
      normal: { id: "normal", name: "Normal", cash: 10000, rivals: 3, severity: 1, eventMin: 20, eventSpan: 21, rivalStrength: 1, events: true, canLose: true },
      hard: { id: "hard", name: "Hard", cash: 6000, rivals: 4, severity: 1.35, eventMin: 15, eventSpan: 14, rivalStrength: 1.22, events: true, canLose: true },
      sandbox: { id: "sandbox", name: "Sandbox", cash: 40000, rivals: 2, severity: 1, eventMin: 999, eventSpan: 1, rivalStrength: 0.45, events: false, canLose: false },
    },
  };
  if (typeof window !== "undefined") window.STREAMCO_CONFIG = config;
  if (typeof module !== "undefined" && module.exports) module.exports = config;
})();
