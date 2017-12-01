'use strict';

function isTurnedOn(items, url) {
  let urlTurnedOn = (items.url || {})[url];
  if (urlTurnedOn != undefined) {
    return !!urlTurnedOn;
  }
  for (var re of (items.re || [])) {
    if (new RegExp(re.pattern).test(url)) {
      return re.turnedOn;
    }
  }
  return items.turnedOn;
}

function turnOn(tabId) {
  return browser.tabs.insertCSS(tabId, {
    file: 'style.css',
    cssOrigin: 'user',
    allFrames: true,
    runAt: 'document_start'
  });
}

function turnOff(tabId) {
  return browser.tabs.removeCSS(tabId, {
    file: 'style.css',
    cssOrigin: 'user',
    allFrames: true
  });
}

async function setUrl(pageUrl, on) {
  let items = await browser.storage.local.get({ url: {} });
  items.url[pageUrl] = !!on;
  return browser.storage.local.set(items);
}

async function removeUrl(tabUrl) {
  let items = await browser.storage.local.get({ url: {} });
  delete items.url[tabUrl];
  return browser.storage.local.set(items);
}

async function refreshTab(tabId) {
  let tab = await browser.tabs.get(tabId);
  let items = await browser.storage.local.get();
  return isTurnedOn(items, tab.url) ? turnOn(tab.id) : turnOff(tab.id);
}

browser.webNavigation.onCommitted.addListener((details) => refreshTab(details.tabId));

async function resetTab(tab) {
  await removeUrl(tab.url);
  return isTurnedOn(items, tab.url) ? turnOn(tab.id) : turnOff(tab.id);
}

async function processMessage(message, sender, sendResponse) {
  let tab = await browser.tabs.get(message.tabId);
  if (message.command === "display") {
    turnOff(tab.id);
    setUrl(tab.url, false);
  } else if (message.command === "hide") {
    turnOn(tab.id);
    setUrl(tab.url, true);
  } else if (message.command === "reset") {
    resetTab(tab);
  }
}

browser.runtime.onMessage.addListener(processMessage);