(function () {
  const store = window.LoveContentStore;
  const audioStore = window.LoveAudioStore;
  const form = document.querySelector("#songForm");
  const preset = document.querySelector("#songPreset");
  const url = document.querySelector("#customSongUrl");
  const volume = document.querySelector("#musicVolume");
  const volumeValue = document.querySelector("#volumeValue");
  const enabled = document.querySelector("#musicEnabled");
  const loop = document.querySelector("#musicLoop");
  const fileInput = document.querySelector("#songUpload");
  const uploadInfo = document.querySelector("#uploadInfo");
  const removeUpload = document.querySelector("#removeUpload");
  const status = document.querySelector("#songStatus");
  const descriptions = {
    moonlight: "Warm piano-like notes with a soft, dreamy rhythm.",
    heartbeat: "A playful pulse that feels like two happy heartbeats.",
    starlight: "A brighter, quicker melody for a magical celebration.",
    lullaby: "Slow, calm notes for a cozy late-night feeling.",
  };
  const supportedExtensions = /\.(mp3|wav|ogg|m4a|aac)$/i;
  const maximumSize = 25 * 1024 * 1024;
  let currentSource = "preset";
  let uploadedRecord = null;
  let saveTimer;

  function renderDescription() {
    document.querySelector("#presetDescription").textContent = descriptions[preset.value] || "";
  }

  function renderUpload() {
    if (uploadedRecord) {
      const size = (uploadedRecord.size / 1024 / 1024).toFixed(1);
      const active = currentSource === "upload" ? " · playing now" : "";
      uploadInfo.textContent = `${uploadedRecord.name} · ${size} MB${active}`;
      uploadInfo.classList.add("active");
      removeUpload.hidden = false;
    } else {
      uploadInfo.textContent = "No song uploaded yet";
      uploadInfo.classList.remove("active");
      removeUpload.hidden = true;
    }
  }

  async function load() {
    const value = store.get();
    preset.value = value.songPreset || "moonlight";
    url.value = value.customSongUrl || "";
    volume.value = value.musicVolume || "35";
    volumeValue.textContent = `${volume.value}%`;
    enabled.checked = value.musicEnabled !== "false";
    loop.checked = value.musicLoop !== "false";
    uploadedRecord = await audioStore.get().catch(() => null);
    currentSource = value.songSource || (value.customSongUrl ? "url" : "preset");
    if (currentSource === "upload" && !uploadedRecord) currentSource = "preset";
    renderDescription();
    renderUpload();
  }

  function save(message = "Saved — website updated live") {
    store.save({
      songPreset: preset.value,
      customSongUrl: url.value.trim(),
      musicVolume: volume.value,
      musicEnabled: String(enabled.checked),
      musicLoop: String(loop.checked),
      songSource: currentSource,
      uploadedSongName: uploadedRecord?.name || "",
    });
    volumeValue.textContent = `${volume.value}%`;
    renderDescription();
    renderUpload();
    status.textContent = message;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      status.textContent = "Changes save automatically";
    }, 1800);
  }

  preset.addEventListener("change", () => {
    currentSource = "preset";
    url.value = "";
    save("Preset melody selected");
  });
  url.addEventListener("input", () => {
    currentSource = url.value.trim() ? "url" : "preset";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => save(), 300);
  });
  volume.addEventListener("input", () => {
    volumeValue.textContent = `${volume.value}%`;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => save(), 100);
  });
  enabled.addEventListener("change", () => save());
  loop.addEventListener("change", () => save());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!(file.type.startsWith("audio/") || supportedExtensions.test(file.name))) {
      status.textContent = "Please choose an audio file";
      fileInput.value = "";
      return;
    }
    if (file.size > maximumSize) {
      status.textContent = "Song is too large — maximum size is 25 MB";
      fileInput.value = "";
      return;
    }
    status.textContent = "Saving your song…";
    try {
      uploadedRecord = await audioStore.save(file);
      currentSource = "upload";
      url.value = "";
      enabled.checked = true;
      save("Uploaded — song is playing on the website");
    } catch {
      status.textContent = "Could not save this song. Try a smaller file.";
    }
    fileInput.value = "";
  });

  removeUpload.addEventListener("click", async () => {
    await audioStore.remove();
    uploadedRecord = null;
    if (currentSource === "upload") currentSource = "preset";
    save("Uploaded song removed");
  });

  document.querySelector("#applySong").addEventListener("click", () => {
    enabled.checked = true;
    save("Applied — music is starting");
  });
  document.querySelector("#resetSong").addEventListener("click", () => {
    const defaults = store.defaults;
    preset.value = defaults.songPreset;
    url.value = defaults.customSongUrl;
    volume.value = defaults.musicVolume;
    enabled.checked = defaults.musicEnabled !== "false";
    loop.checked = defaults.musicLoop !== "false";
    currentSource = "preset";
    save("Music settings reset");
  });
  store.subscribe(load);
  audioStore.subscribe(load);
  load();
})();
