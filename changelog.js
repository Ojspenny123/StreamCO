(function () {
  var changelog = [
    {
      version: "3.4",
      date: "2026-10-01",
      added: [
        "The version number shows in the browser tab, on the title screen, and in the footer.",
        "A What's new screen and a changelog you can open from the title screen or Settings.",
        "Pause still lets you buy content, change the price, and browse every dashboard.",
        "A day progress bar next to the day counter."
      ],
      changed: [
        "Each day lasts 5 seconds at 1×, 2.5 seconds at 2×, and 1.25 seconds at 4×.",
        "The economy is tuned so a Normal game is about 45 to 60 minutes at 1×.",
        "Pause is a slim banner instead of a screen that blocks the game.",
        "Decision popups pause the clock and only resume it if you had not paused yourself."
      ],
      fixed: [
        "The browser tab keeps the StreamCo version instead of switching to your service name.",
        "Leaving the browser tab no longer sticks the game on pause when you come back."
      ]
    },
    {
      version: "3.3",
      date: "2026-10-01",
      added: [
        "A StreamCo logo, favicons, and an Install StreamCo prompt on the title screen.",
        "Add to Home Screen support, including an iPhone tip."
      ],
      changed: [],
      fixed: [
        "Approximate: hidden controls inside a flex layout no longer peek out under a modal."
      ]
    },
    {
      version: "3.1",
      date: "2026-10-01",
      added: [
        "You can hold many films, shows, and sports packages at once, each with its own contract.",
        "Library slots, Expand library, filters, sorts, and one Renewals due list."
      ],
      changed: [
        "Extra deals in the same genre add less, and later sports packages cost more."
      ],
      fixed: [
        "The title poster no longer fills the screen and hides the Buy button."
      ]
    },
    {
      version: "3.0",
      date: "2026-10-01",
      added: [
        "Approximate: Streaming Empire win, credit, and a catalogue of real titles.",
        "Approximate: company value, debt, and Review Day for originals."
      ],
      changed: [],
      fixed: []
    },
    {
      version: "2.0",
      date: "2026-10-01",
      added: [
        "Approximate: genres, rivals, regions, trophies, and a title screen with setup and how to play."
      ],
      changed: [],
      fixed: []
    },
    {
      version: "1.0",
      date: "2026-10-01",
      added: [
        "Approximate: the day-by-day service, cash, subscribers, upgrades, and a win and loss screen."
      ],
      changed: [],
      fixed: []
    }
  ];
  if (typeof window !== "undefined") window.STREAMCO_CHANGELOG = changelog;
  if (typeof module !== "undefined" && module.exports) module.exports = changelog;
})();
