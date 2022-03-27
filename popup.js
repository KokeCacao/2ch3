let text = document.getElementById("2CH3_ENABLE_TEXT");
let button = document.getElementById("2CH3_ENABLE_BUTTON");

async function updateUIState(revert=false) {
  chrome.storage.sync.get("CH3", ({ CH3 }) => {
    let text = document.getElementById("2CH3_ENABLE_TEXT");
    if (!revert) text.innerText = CH3 ? "Enabled" : "Disabled";
    else text.innerText = CH3 ? "Disabled" : "Enabled";
  });
}

async function onClick() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      chrome.storage.sync.get("CH3", ({ CH3 }) => {
        CH3 = !CH3;
        chrome.storage.sync.set({ CH3 });
        if (window) window.CH3_ENABLED = CH3;
        else console.log("WARNING: no window detected");
        if (CH3) {
          // append all child
          console.log("turn on");
        } else {
          // remove all child
          console.log("turn off");
          document.getElementById("comments").innerHTML = '';
          document.getElementById("inputs").innerHTML = '';
        }
      });
    },
  });

  updateUIState(true);
};

button.addEventListener("click", onClick);

document.addEventListener('DOMContentLoaded', () => {
  updateUIState();
});