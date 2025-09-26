export const DB_NAME = 'TextToSiteDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'sites';

export let db;

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "name" });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject("Error opening database");
    };
  });
}

export async function saveSite(siteName, siteData) {
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.put({ name: siteName, data: siteData });
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error saving site");
  });
}

export async function getSites() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject("Error getting sites");
  });
}

export async function removeSite(siteName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(siteName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(`Error removing site: ${siteName}`);
  });
}
