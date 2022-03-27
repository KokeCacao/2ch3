let CH3 = false;

// When the extension starts running
chrome.runtime.onInstalled.addListener(() => {
  CH3 = false;
  chrome.storage.sync.set({ CH3 });
  // if (window) window.CH3_ENABLED = CH3;
  // else console.log("WARNING: no window detected");
  console.log('CH3 started');
});
