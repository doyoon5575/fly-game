export class HUD {
  constructor() {
    this.speedValue = document.querySelector("#speed-value");
    this.altitudeValue = document.querySelector("#altitude-value");
    this.timerValue = document.querySelector("#timer-value");
    this.scoreValue = document.querySelector("#score-value");
    this.recordValue = document.querySelector("#record-value");
    this.boostFill = document.querySelector("#boost-fill");
    this.healthFill = document.querySelector("#health-fill");
    this.weaponFill = document.querySelector("#weapon-fill");
    this.boostPercent = document.querySelector("#boost-percent");
    this.healthPercent = document.querySelector("#health-percent");
    this.weaponPercent = document.querySelector("#weapon-percent");
    this.messageBanner = document.querySelector("#message-banner");
  }

  update(plane, raceTimer, weaponSystem, targetManager) {
    this.speedValue.textContent = `SPD ${Math.round(plane.currentSpeed)}`;
    this.altitudeValue.textContent = `ALT ${Math.max(0, Math.round(plane.altitude))}`;
    this.timerValue.textContent = raceTimer.getFormattedTime();
    this.scoreValue.textContent = `KILLS ${targetManager.destroyedCount}`;
    this.recordValue.textContent = `MAX ${Math.round(plane.maxAltitude)}`;

    this.boostFill.style.transform = `scaleX(${clamp01(plane.boostNormalized)})`;
    this.healthFill.style.transform = `scaleX(${clamp01(plane.healthNormalized)})`;
    this.weaponFill.style.transform = `scaleX(${clamp01(weaponSystem.heatNormalized)})`;
    this.boostPercent.textContent = `${Math.round(clamp01(plane.boostNormalized) * 100)}%`;
    this.healthPercent.textContent = `${Math.round(clamp01(plane.healthNormalized) * 100)}%`;
    this.weaponPercent.textContent = weaponSystem.overheated
      ? "HOT"
      : `${Math.round(clamp01(weaponSystem.heatNormalized) * 100)}%`;
  }

  showMessage(text) {
    this.messageBanner.textContent = text;
    this.messageBanner.classList.remove("hidden");
  }

  clearMessage() {
    this.messageBanner.textContent = "";
    this.messageBanner.classList.add("hidden");
  }
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
