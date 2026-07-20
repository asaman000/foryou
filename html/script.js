const love = {
  from: "Sayin",
  to: "My Favorite Person",
  since: "2024-02-14T00:00:00",
  title: "Our little forever",
  messages: [
    "Somehow, every ordinary day became my favorite story when you walked into it.",
    "You are my calm, my chaos, my safest place — and the smile I never have to force.",
    "I do not need a perfect life. I just want a beautifully imperfect one, with you.",
  ],
};
const contentStore = window.LoveContentStore;
const audioStore = window.LoveAudioStore;
let editableContent = contentStore ? contentStore.get() : {};

let noMessages = [
  "Please no mat bolo 🥺",
  "Ek baar aur soch lo!",
  "Dil toot jayega 💔",
  "Itna bhi mat tadpao",
  "Sirf YES allowed hai ✨",
  "Ab to yes kar do",
  "Tum bahut cute ho",
  "Main wait kar raha hoon…",
  "NO button bhi tumse bach raha hai 😂",
  "Nice try, lekin option sirf YES hai 😌",
  "Mouse fast hai, par mera pyaar faster hai 💨",
  "Itni mehnat YES dabane me laga do na 😜",
  "System error: NO accept nahi hota 🤖",
  "Teddy dekh raha hai… dil mat todo 🧸",
  "Plot twist: ye button nakli hai 😏",
  "Aapka NO request reject kar diya gaya hai 🚫",
  "Ab bas bhi karo, YES sharma raha hai 🙈",
  "Last warning: YES warna extra hugs! 🤗",
];

let step = 0;
let dark = true;
let musicPlaying = false;
let noCount = 0;
let audioContext = null;
let musicTimer = null;
let audioUnlockArmed = false;
let activeSongSignature = "";
let activeSongObjectUrl = "";

const melodyPresets = {
  moonlight: { notes: [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23], duration: .58 },
  heartbeat: { notes: [220, 277.18, 329.63, 277.18, 246.94, 293.66, 349.23, 293.66], duration: .44 },
  starlight: { notes: [392, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 523.25], duration: .38 },
  lullaby: { notes: [293.66, 349.23, 440, 392, 349.23, 329.63, 293.66, 261.63], duration: .72 },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function applyLoveContent() {
  if (contentStore) editableContent = contentStore.get();
  if ($("#volume")) $("#volume").value = Math.min(100, Math.max(0, Number(editableContent.musicVolume ?? 35))) / 100;
  Object.assign(love, {
    from: editableContent.from || love.from,
    to: editableContent.to || love.to,
    since: editableContent.since || love.since,
    title: editableContent.title || love.title,
    messages: [
      editableContent.letterMessage || love.messages[0],
      editableContent.memoryMessage || love.messages[1],
      love.messages[2],
    ],
  });
  if (editableContent.noMessages) {
    noMessages = editableContent.noMessages.split("\n").map((item) => item.trim()).filter(Boolean);
  }
  $$("[data-love]").forEach((node) => {
    const field = node.dataset.love;
    if (field in love) node.textContent = love[field];
  });
  $$("[data-message]").forEach((node) => {
    node.textContent = love.messages[Number(node.dataset.message)] || "";
  });
  const setText = (selector, value) => {
    const node = $(selector);
    if (node && value !== undefined) node.textContent = value;
  };
  const setButton = (selector, value, symbol) => {
    const node = $(selector);
    if (node && value !== undefined) node.innerHTML = `${value} <span>${symbol}</span>`;
  };
  $(".eyebrow").innerHTML = `<span>✦</span> ${editableContent.eyebrow} <span>✦</span>`;
  setText(".hand-note", editableContent.handNote);
  $(".welcome h1").innerHTML = `${editableContent.greeting} <em>${love.to}</em>`;
  setText(".welcome .lead", editableContent.welcomeLead);
  setButton(".welcome .primary", editableContent.openButton, "→");
  setText(".story .step-label", editableContent.storyLabel);
  setText(".letter .tape", editableContent.letterTape);
  setText(".letter > p", editableContent.letterMessage);
  setText(".timeline div:nth-child(1) span", editableContent.timelineOneTitle);
  setText(".timeline div:nth-child(1) small", editableContent.timelineOneText);
  setText(".timeline div:nth-child(2) span", editableContent.timelineTwoTitle);
  setText(".timeline div:nth-child(2) small", editableContent.timelineTwoText);
  setText(".timeline div:nth-child(3) span", editableContent.timelineThreeTitle);
  setText(".timeline div:nth-child(3) small", editableContent.timelineThreeText);
  setButton(".story .primary", editableContent.keepGoingButton, "→");
  setText(".memories .step-label", editableContent.memoriesLabel);
  setText(".memories h2", editableContent.memoriesTitle);
  setText(".p1 span", editableContent.memoryOne);
  setText(".p2 span", editableContent.memoryTwo);
  setText(".p3 span", editableContent.memoryThree);
  setText(".type-line", editableContent.memoryMessage);
  setButton(".memories .primary", editableContent.oneMoreButton, "→");
  setText(".question .step-label", editableContent.questionLabel);
  $(".question h2").innerHTML = `${editableContent.questionLineOne}<br><em>${editableContent.questionLineTwo}</em>`;
  setText(".question > p:not(.step-label)", editableContent.questionLead);
  if (!$("#yesButton").disabled) setButton("#yesButton", editableContent.yesButton, "♥");
  if (!noCount) setText("#noMessage", editableContent.noPrompt);
  setText(".yes-ribbon", editableContent.ribbon);
  setText(".celebration > .step-label", editableContent.celebrationLabel);
  $(".celebration h1").innerHTML = `${editableContent.celebrationTitle} <em>${editableContent.celebrationYes}</em>`;
  setText(".celebration > .lead", editableContent.celebrationLead);
  setButton("#celebrationShare", editableContent.shareButton, "↗");
  setText("#downloadCard", editableContent.saveButton);
  setText("#restartButton", `${editableContent.restartButton} ↻`);
  $("footer").innerHTML = `${editableContent.footer} · <b>${love.from}</b>`;
}

function buildWorld() {
  const world = $("#world");
  for (let i = 0; i < 18; i += 1) {
    const star = document.createElement("i");
    star.className = "star";
    star.style.left = `${(i * 29) % 94}%`;
    star.style.top = `${8 + (i * 17) % 58}%`;
    star.style.animationDelay = `${i * -.25}s`;
    world.append(star);
  }
  for (let i = 0; i < 4; i += 1) {
    const star = document.createElement("i");
    star.className = "shooting-star";
    star.style.top = `${12 + i * 13}%`;
    star.style.left = `${18 + i * 21}%`;
    star.style.animationDelay = `${i * 3.7}s`;
    world.append(star);
  }
  for (let i = 0; i < 13; i += 1) {
    const fly = document.createElement("i");
    fly.className = "firefly";
    fly.style.left = `${4 + (i * 43) % 91}%`;
    fly.style.top = `${35 + (i * 19) % 50}%`;
    fly.style.animationDelay = `${i * -.7}s`;
    fly.style.animationDuration = `${4 + (i % 4)}s`;
    world.append(fly);
  }
  for (let i = 0; i < 16; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = "♥";
    heart.style.left = `${(i * 37) % 96}%`;
    heart.style.animationDelay = `${(i % 7) * -1.4}s`;
    heart.style.animationDuration = `${8 + (i % 5) * 1.8}s`;
    heart.style.fontSize = `${12 + (i % 4) * 6}px`;
    world.append(heart);
  }
}

function showStep(nextStep) {
  step = Math.max(0, Math.min(3, nextStep));
  $$("[data-panel]").forEach((panel) => panel.classList.toggle("active-panel", Number(panel.dataset.panel) === step));
  $$("[data-step-button]").forEach((button) => {
    const number = Number(button.dataset.stepButton);
    button.className = number === step ? "active" : number < step ? "done" : "";
    button.querySelector("span").textContent = number < step ? "♥" : String(number + 1);
  });
}

function updateCounters() {
  const elapsed = Math.max(0, Date.now() - new Date(love.since).getTime());
  const parts = editableContent.counterMode === "manual" ? {
    days: Number(editableContent.manualDays) || 0,
    hours: Number(editableContent.manualHours) || 0,
    mins: Number(editableContent.manualMins) || 0,
    secs: Number(editableContent.manualSecs) || 0,
  } : {
    days: Math.floor(elapsed / 86400000),
    hours: Math.floor(elapsed / 3600000) % 24,
    mins: Math.floor(elapsed / 60000) % 60,
    secs: Math.floor(elapsed / 1000) % 60,
  };
  $$("[data-counter]").forEach((counter) => {
    counter.innerHTML = Object.entries(parts)
      .map(([key, value]) => `<span><b>${String(value).padStart(2, "0")}</b><small>${key}</small></span>`)
      .join("");
  });
}

function createMelodyWav() {
  const sampleRate = 12000;
  const melody = melodyPresets[editableContent.songPreset] || melodyPresets.moonlight;
  const notes = melody.notes;
  const noteDuration = melody.duration;
  const totalSamples = Math.floor(sampleRate * noteDuration * notes.length);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);
  const writeText = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  writeText(0, "RIFF");
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, totalSamples * 2, true);
  for (let sample = 0; sample < totalSamples; sample += 1) {
    const noteIndex = Math.min(notes.length - 1, Math.floor(sample / (sampleRate * noteDuration)));
    const localTime = (sample % Math.floor(sampleRate * noteDuration)) / sampleRate;
    const attack = Math.min(1, localTime / .06);
    const release = Math.min(1, (noteDuration - localTime) / .16);
    const envelope = Math.max(0, Math.min(attack, release));
    const fundamental = Math.sin(2 * Math.PI * notes[noteIndex] * localTime);
    const harmony = Math.sin(2 * Math.PI * notes[noteIndex] * 2 * localTime) * .18;
    view.setInt16(44 + sample * 2, (fundamental + harmony) * envelope * 8200, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

async function prepareBackgroundMusic() {
  const player = $("#backgroundMusic");
  if (!player) return player;
  const customUrl = (editableContent.customSongUrl || "").trim();
  let source = editableContent.songSource || (customUrl ? "url" : "preset");
  let uploadedSong = null;
  if (source === "upload" && audioStore) {
    uploadedSong = await audioStore.get().catch(() => null);
    if (!uploadedSong) source = "preset";
  }
  const signature = source === "upload"
    ? JSON.stringify(["upload", uploadedSong.name, uploadedSong.updatedAt])
    : source === "url"
      ? JSON.stringify(["url", customUrl])
      : JSON.stringify(["preset", editableContent.songPreset || "moonlight"]);
  player.volume = Math.min(1, Math.max(0, Number(editableContent.musicVolume ?? 35) / 100));
  player.loop = editableContent.musicLoop !== "false";
  player.autoplay = true;
  player.muted = false;
  player.defaultMuted = false;
  player.dataset.songSignature = signature;
  player.dataset.songSource = source;
  if (signature === activeSongSignature && player.src) return player;
  player.pause();
  if (activeSongObjectUrl) URL.revokeObjectURL(activeSongObjectUrl);
  activeSongObjectUrl = "";
  if (source === "upload") {
    activeSongObjectUrl = URL.createObjectURL(uploadedSong.blob);
    player.src = activeSongObjectUrl;
  } else if (source === "url" && customUrl) {
    player.src = customUrl;
  } else {
    activeSongObjectUrl = URL.createObjectURL(createMelodyWav());
    player.src = activeSongObjectUrl;
  }
  activeSongSignature = signature;
  player.load();
  return player;
}

function playNote() {
  if (!audioContext) return;
  const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
  playNote.index = (playNote.index || 0) + 1;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = notes[playNote.index % notes.length];
  const volume = Number($("#volume").value);
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(volume * .12, audioContext.currentTime + .05);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .75);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .8);
}

async function startMusic() {
  if (editableContent.musicEnabled === "false") {
    $("#musicStatus").textContent = "music off";
    return false;
  }
  const player = await prepareBackgroundMusic();
  if (player) {
    try {
      await player.play();
      musicPlaying = true;
      $("#musicButton").textContent = "♫";
      $("#musicButton").setAttribute("aria-label", "Pause music");
      $("#musicStatus").textContent = "music playing";
      return true;
    } catch {
      player.pause();
    }
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    $("#musicStatus").textContent = "audio unavailable";
    return false;
  }
  if (!audioContext) audioContext = new AudioContextClass();
  try {
    $("#musicStatus").textContent = "starting music…";
    if (audioContext.state === "suspended") {
      await Promise.race([
        audioContext.resume(),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error("Autoplay blocked")), 450)),
      ]);
    }
    if (audioContext.state !== "running") throw new Error("Audio playback is blocked");
    if (!musicTimer) {
      playNote();
      musicTimer = window.setInterval(playNote, 820);
    }
    musicPlaying = true;
    $("#musicButton").textContent = "♫";
    $("#musicButton").setAttribute("aria-label", "Pause music");
    $("#musicStatus").textContent = "music playing";
    return true;
  } catch {
    musicPlaying = false;
    $("#musicButton").textContent = "♪";
    $("#musicButton").setAttribute("aria-label", "Enable music");
    $("#musicStatus").textContent = "tap for music";
    armAudioUnlock();
    return false;
  }
}

function stopMusic() {
  const player = $("#backgroundMusic");
  if (player) {
    player.pause();
    player.currentTime = 0;
  }
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
  if (audioContext) audioContext.close();
  audioContext = null;
  musicPlaying = false;
  $("#musicButton").textContent = "♪";
  $("#musicButton").setAttribute("aria-label", "Play music");
  $("#musicStatus").textContent = "soft melody";
}

function armAudioUnlock() {
  if (audioUnlockArmed) return;
  audioUnlockArmed = true;
  const unlock = async () => {
    const started = await startMusic();
    if (!started) return;
    audioUnlockArmed = false;
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
    document.removeEventListener("touchstart", unlock);
  };
  document.addEventListener("pointerdown", unlock, { passive: true });
  document.addEventListener("keydown", unlock);
  document.addEventListener("touchstart", unlock, { passive: true });
}

function autoplayAfterLoad() {
  const attempt = async () => {
    if (musicPlaying || editableContent.musicEnabled === "false") return;
    const started = await startMusic();
    if (!started) armAudioUnlock();
  };
  void attempt();
  window.addEventListener("load", () => void attempt(), { once: true });
  window.addEventListener("pageshow", () => void attempt(), { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void attempt();
  });
  window.setTimeout(() => void attempt(), 900);
  window.setTimeout(() => void attempt(), 2400);
  window.setTimeout(() => $("#loader")?.remove(), 1900);
}

function evadeNo(event) {
  if (event) event.preventDefault();
  const button = $("#noButton");
  noCount += 1;
  const maxX = Math.min(window.innerWidth * .17, 145);
  const maxY = Math.min(window.innerHeight * .075, 58);
  const x = (Math.random() - .5) * maxX * 2;
  const y = (Math.random() - .5) * maxY * 2;
  const rotation = (Math.random() - .5) * 44;
  const scale = .75 + Math.random() * .28;
  button.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
  $("#noMessage").textContent = noMessages[(noCount - 1) % noMessages.length];
  if (navigator.vibrate) navigator.vibrate(35);
}

function createClickBurst() {
  const burst = $("#yesBurst");
  burst.innerHTML = "";
  for (let i = 0; i < 14; i += 1) {
    const heart = document.createElement("i");
    heart.textContent = "♥";
    heart.style.setProperty("--heart-angle", `${i * (360 / 14)}deg`);
    burst.append(heart);
  }
}

function buildCelebration() {
  const colors = ["#ff5c8a", "#ffd166", "#7bdff2", "#cdb4db", "#ffffff"];
  $("#confetti").innerHTML = Array.from({ length: 90 }, (_, i) =>
    `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * .9}s"></i>`
  ).join("");
  $("#roseRain").innerHTML = Array.from({ length: 12 }, (_, i) =>
    `<span style="left:${i * 8.5}%;animation-delay:${i * -.42}s">🌹</span>`
  ).join("");
  $("#fireworks").innerHTML = Array.from({ length: 5 }, (_, group) =>
    `<span class="firework firework-${group + 1}">${Array.from({ length: 12 }, (_, spark) =>
      `<i style="transform:rotate(${spark * 30}deg) translateY(-44px)"></i>`).join("")}</span>`
  ).join("");
  $("#celebrationStars").innerHTML = Array.from({ length: 20 }, (_, i) =>
    `<i style="left:${(i * 37) % 96}%;top:${(i * 23) % 92}%;animation-delay:${i * -.13}s">✦</i>`
  ).join("");
  $("#heartHalo").innerHTML = Array.from({ length: 10 }, (_, i) =>
    `<i style="--halo-angle:${i * 36}deg">♥</i>`
  ).join("");
}

function sayYes() {
  const question = $(".question");
  const yes = $("#yesButton");
  const no = $("#noButton");
  if (yes.disabled) return;
  yes.disabled = true;
  yes.classList.add("accepting");
  yes.innerHTML = "YAY! <span>♥</span>";
  no.disabled = true;
  no.classList.add("fading");
  question.classList.add("accepting");
  $("#app").classList.add("accepting-yes");
  createClickBurst();
  if (!musicPlaying) startMusic();
  if (navigator.vibrate) navigator.vibrate([60, 40, 110]);
  window.setTimeout(() => {
    $("#storyExperience").hidden = true;
    $("#celebration").hidden = false;
    $("#app").className = "accepted";
    buildCelebration();
  }, 720);
}

async function shareStory() {
  const data = {
    title: "A little question for you…",
    text: `${love.from} made a tiny love story for ${love.to} 💗`,
    url: window.location.href,
  };
  if (navigator.share) {
    await navigator.share(data);
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(window.location.href);
    alert("Love link copied! 💌");
  }
}

function downloadCard() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#241a4a");
  gradient.addColorStop(1, "#7b3d6a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 630);
  context.textAlign = "center";
  context.fillStyle = "#ff9fbd";
  context.font = "70px Georgia";
  context.fillText("♥", 600, 145);
  context.fillStyle = "#fff8f2";
  context.font = "bold 72px Georgia";
  context.fillText("Our little forever", 600, 270);
  context.font = "34px Arial";
  context.fillStyle = "#f9dbe8";
  context.fillText(`${love.from}  +  ${love.to}`, 600, 350);
  context.font = "26px Arial";
  context.fillText("Thank you for saying YES ✨", 600, 440);
  const link = document.createElement("a");
  link.download = "our-little-forever.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function restart() {
  $("#celebration").hidden = true;
  $("#storyExperience").hidden = false;
  $("#app").className = "";
  const question = $(".question");
  const yes = $("#yesButton");
  const no = $("#noButton");
  question.classList.remove("accepting");
  yes.disabled = false;
  yes.classList.remove("accepting");
  yes.innerHTML = "YES! <span>♥</span>";
  no.disabled = false;
  no.classList.remove("fading");
  no.style.transform = "";
  $("#yesBurst").innerHTML = "";
  noCount = 0;
  $("#noMessage").textContent = "choose wisely, cutie ✨";
  showStep(0);
}

function bindEvents() {
  $$(".next-button").forEach((button) => button.addEventListener("click", () => showStep(Number(button.dataset.next))));
  $$("[data-step-button]").forEach((button) => button.addEventListener("click", () => {
    const requested = Number(button.dataset.stepButton);
    if (requested <= step) showStep(requested);
  }));
  $("#themeButton").addEventListener("click", () => {
    dark = !dark;
    document.documentElement.dataset.theme = dark ? "night" : "day";
    $("#themeButton").textContent = dark ? "☀" : "☾";
  });
  $("#musicButton").addEventListener("click", () => musicPlaying ? stopMusic() : void startMusic());
  $("#volume").addEventListener("input", () => {
    const player = $("#backgroundMusic");
    const nextVolume = Math.round(Number($("#volume").value) * 100);
    if (player) player.volume = nextVolume / 100;
    if (contentStore) editableContent = contentStore.save({ musicVolume: String(nextVolume) });
  });
  $("#shareButton").addEventListener("click", shareStory);
  $("#celebrationShare").addEventListener("click", shareStory);
  $("#downloadCard").addEventListener("click", downloadCard);
  $("#restartButton").addEventListener("click", restart);
  $("#yesButton").addEventListener("click", sayYes);
  $("#noButton").addEventListener("pointerenter", evadeNo);
  $("#noButton").addEventListener("pointerdown", evadeNo);
  $("#noButton").addEventListener("focus", evadeNo);
}

applyLoveContent();
if (contentStore) contentStore.subscribe(async () => {
  const wasPlaying = musicPlaying;
  applyLoveContent();
  updateCounters();
  await prepareBackgroundMusic();
  if (editableContent.musicEnabled === "false") stopMusic();
  else if (wasPlaying || !musicPlaying) void startMusic();
});
if (audioStore) audioStore.subscribe(async () => {
  const wasPlaying = musicPlaying;
  activeSongSignature = "";
  await prepareBackgroundMusic();
  if (editableContent.musicEnabled !== "false" && (wasPlaying || !musicPlaying)) void startMusic();
});
buildWorld();
bindEvents();
showStep(0);
updateCounters();
window.setInterval(updateCounters, 1000);
autoplayAfterLoad();
