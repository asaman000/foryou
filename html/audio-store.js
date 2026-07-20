(function () {
  const DB_NAME = "our-little-forever-audio-v1";
  const STORE_NAME = "songs";
  const CHANNEL_NAME = "our-little-forever-audio-live";

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function run(mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => database.close();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function announce(message) {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(message);
    channel.close();
  }

  async function save(file) {
    const record = {
      id: "active",
      blob: file,
      name: file.name,
      type: file.type,
      size: file.size,
      updatedAt: Date.now(),
    };
    await run("readwrite", (store) => store.put(record));
    announce({ type: "saved", name: record.name, updatedAt: record.updatedAt });
    return record;
  }

  function get() {
    return run("readonly", (store) => store.get("active"));
  }

  async function remove() {
    await run("readwrite", (store) => store.delete("active"));
    announce({ type: "removed", updatedAt: Date.now() });
  }

  function subscribe(callback) {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", (event) => callback(event.data));
  }

  window.LoveAudioStore = { save, get, remove, subscribe };
})();
