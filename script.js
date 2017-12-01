'use strict';

function isTurnedOn(items, url) {
  let urlTurnedOn = (items.url || {})[url];
  if (urlTurnedOn !== undefined) {
    return !!urlTurnedOn;
  }
  for (var re of (items.re || [])) {
    if (new RegExp(re.pattern).test(url)) {
      return !!re.turnedOn;
    }
  }
  return !!items.turnedOn;
}

async function updateShowHideLabel(tab) {
  let btn = document.querySelector('#popup-content .toggleImages');
  let items = await browser.storage.local.get()
  btn.textContent = (isTurnedOn(items, tab.url) ? "Show" : "Hide") + " images";
}

async function updateLabels() {
  let tabs = await browser.tabs.query({active: true, currentWindow: true});
  for (var tab of tabs) {
    updateShowHideLabel(tab);
  }
}

updateLabels();

document.addEventListener("click", (e) => {
  async function toggleImages(tabs) {
    let items = await browser.storage.local.get();
    for (var tab of tabs) {
      let message = {};
      message.tabId = tab.id;
      message.command = isTurnedOn(items, tab.url) ? "display" : "hide";
      browser.runtime.sendMessage(message).then(() => updateShowHideLabel(tab));
    }
  }
  if (e.target.classList.contains("toggleImages")) {
    browser.tabs.query({active: true, currentWindow: true})
      .then(toggleImages);
  }
});