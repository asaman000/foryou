(function () {
  const STORAGE_KEY = "our-little-forever-content-v1";
  const CHANNEL_NAME = "our-little-forever-live";

  const defaults = {
    title: "Our little forever",
    from: "Sayin",
    to: "My Favorite Person",
    since: "2024-02-14T00:00",
    counterMode: "date",
    manualDays: "365",
    manualHours: "12",
    manualMins: "30",
    manualSecs: "0",
    songPreset: "moonlight",
    customSongUrl: "",
    musicVolume: "35",
    musicEnabled: "true",
    musicLoop: "true",
    songSource: "",
    uploadedSongName: "",
    eyebrow: "A tiny story, made with a whole heart",
    handNote: "psst… this is for you",
    greeting: "Hi,",
    welcomeLead: "I made a little corner of the universe where every star knows your name.",
    openButton: "Open our story",
    storyLabel: "chapter one · the lovely beginning",
    letterTape: "love, in little things",
    letterMessage: "Somehow, every ordinary day became my favorite story when you walked into it.",
    timelineOneTitle: "We met",
    timelineOneText: "The universe winked.",
    timelineTwoTitle: "We laughed",
    timelineTwoText: "A lot. At everything.",
    timelineThreeTitle: "We became us",
    timelineThreeText: "My favorite plot twist.",
    keepGoingButton: "Keep going",
    memoriesLabel: "chapter two · a pocketful of memories",
    memoriesTitle: "The way you make life feel",
    memoryOne: "warmer",
    memoryTwo: "softer",
    memoryThree: "magical",
    memoryMessage: "You are my calm, my chaos, my safest place — and the smile I never have to force.",
    oneMoreButton: "One more thing…",
    questionLabel: "the most important chapter",
    questionLineOne: "Will you be mine",
    questionLineTwo: "forever?",
    questionLead: "For all the ordinary Tuesdays, wild dreams, and tiny adventures still waiting for us.",
    yesButton: "YES!",
    noPrompt: "choose wisely, cutie ✨",
    noMessages: "Please no mat bolo 🥺\nEk baar aur soch lo!\nDil toot jayega 💔\nItna bhi mat tadpao\nSirf YES allowed hai ✨\nAb to yes kar do\nTum bahut cute ho\nMain wait kar raha hoon…\nNO button bhi tumse bach raha hai 😂\nNice try, lekin option sirf YES hai 😌\nMouse fast hai, par mera pyaar faster hai 💨\nItni mehnat YES dabane me laga do na 😜\nSystem error: NO accept nahi hota 🤖\nTeddy dekh raha hai… dil mat todo 🧸\nPlot twist: ye button nakli hai 😏\nAapka NO request reject kar diya gaya hai 🚫\nAb bas bhi karo, YES sharma raha hai 🙈\nLast warning: YES warna extra hugs! 🤗",
    ribbon: "forever starts now ✨",
    celebrationLabel: "and just like that, our forever began",
    celebrationTitle: "Thank you for saying",
    celebrationYes: "YES!",
    celebrationLead: "You just made me the happiest person in this tiny, spinning universe. Here is to us — today, tomorrow, and every beautiful mess in between.",
    shareButton: "Share the happy news",
    saveButton: "Save our love card",
    restartButton: "Replay our story",
    footer: "made with ♥ and a ridiculous amount of hope",
  };

  const fields = [
    ["title", "Website title"], ["from", "From name"], ["to", "To name"],
    ["eyebrow", "Welcome eyebrow"], ["handNote", "Teddy note"], ["greeting", "Greeting"],
    ["welcomeLead", "Welcome message"], ["openButton", "Open button"],
    ["storyLabel", "Story chapter label"], ["letterTape", "Letter heading"],
    ["letterMessage", "Love letter"], ["timelineOneTitle", "Timeline 1 title"],
    ["timelineOneText", "Timeline 1 text"], ["timelineTwoTitle", "Timeline 2 title"],
    ["timelineTwoText", "Timeline 2 text"], ["timelineThreeTitle", "Timeline 3 title"],
    ["timelineThreeText", "Timeline 3 text"], ["keepGoingButton", "Keep going button"],
    ["memoriesLabel", "Memories chapter label"], ["memoriesTitle", "Memories title"],
    ["memoryOne", "Memory card 1"], ["memoryTwo", "Memory card 2"], ["memoryThree", "Memory card 3"],
    ["memoryMessage", "Memories message"], ["oneMoreButton", "One more button"],
    ["questionLabel", "Question chapter label"], ["questionLineOne", "Question line 1"],
    ["questionLineTwo", "Question line 2"], ["questionLead", "Question message"],
    ["yesButton", "YES button"], ["noPrompt", "Default No message"], ["noMessages", "No-button jokes"],
    ["ribbon", "Celebration ribbon"], ["celebrationLabel", "Celebration label"],
    ["celebrationTitle", "Celebration title"], ["celebrationYes", "Celebration YES"],
    ["celebrationLead", "Celebration message"], ["shareButton", "Share button"],
    ["saveButton", "Save button"], ["restartButton", "Replay button"], ["footer", "Footer"],
  ];

  function get() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...defaults };
    }
  }

  function save(next) {
    const value = { ...get(), ...next };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(value);
      channel.close();
    }
    return value;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return save(defaults);
  }

  function subscribe(callback) {
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) callback(get());
    });
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.addEventListener("message", (event) => callback({ ...defaults, ...event.data }));
    }
  }

  window.LoveContentStore = { defaults, fields, get, save, reset, subscribe };
})();
