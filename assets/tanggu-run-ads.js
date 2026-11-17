"use strict";

const googleAdsTag = "AW-18493163584";
const storeClickConversion = "AW-18493163584/Q9c3CPXIibodEMCQnfJE";
const consentKey = "tanggu-run-ads-measurement";
const storeLink = document.getElementById("app-store");
const allowButton = document.getElementById("allow-measurement");
const denyButton = document.getElementById("deny-measurement");
const measurementStatus = document.getElementById("measurement-status");

let measurementAllowed = false;
let tagRequested = false;

function configureMeasurement(allowed) {
  measurementAllowed = allowed;
  allowButton.setAttribute("aria-pressed", String(allowed));
  denyButton.setAttribute("aria-pressed", String(!allowed));
  measurementStatus.textContent = allowed
    ? "광고 성과 측정이 켜졌습니다."
    : "광고 성과 측정이 꺼져 있습니다.";

  const consent = {
    ad_storage: allowed ? "granted" : "denied",
    ad_user_data: allowed ? "granted" : "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  };

  if (tagRequested) {
    window.gtag("consent", "update", consent);
    return;
  }
  if (!allowed) return;

  tagRequested = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", consent);
  window.gtag("js", new Date());
  window.gtag("config", googleAdsTag, {
    allow_ad_personalization_signals: false,
    send_page_view: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsTag}`;
  script.addEventListener("error", () => {
    script.remove();
    tagRequested = false;
  });
  document.head.append(script);
}

function saveMeasurementChoice(allowed) {
  try {
    localStorage.setItem(consentKey, allowed ? "allow" : "deny");
  } catch {
    // The choice still applies on this page when browser storage is unavailable.
  }
  configureMeasurement(allowed);
}

let savedChoice = null;
try {
  savedChoice = localStorage.getItem(consentKey);
} catch {
  // Keep measurement off by default when browser storage is unavailable.
}
configureMeasurement(savedChoice === "allow");

allowButton.addEventListener("click", () => saveMeasurementChoice(true));
denyButton.addEventListener("click", () => saveMeasurementChoice(false));

storeLink.addEventListener("click", (event) => {
  if (!measurementAllowed || !tagRequested || event.defaultPrevented) return;

  const conversion = { send_to: storeClickConversion, value: 0, currency: "KRW" };
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    window.gtag("event", "conversion", conversion);
    return;
  }

  event.preventDefault();
  let navigated = false;
  const openStore = () => {
    if (navigated) return;
    navigated = true;
    window.location.assign(storeLink.href);
  };
  window.setTimeout(openStore, 800);
  window.gtag("event", "conversion", { ...conversion, event_callback: openStore });
});
