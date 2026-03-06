export class RespawnSystem {
  constructor(plane, checkpointManager, raceTimer, onRespawn) {
    this.plane = plane;
    this.checkpointManager = checkpointManager;
    this.raceTimer = raceTimer;
    this.onRespawn = onRespawn;
  }

  update(input) {
    if (!input.respawnPressed && !this.plane.isDestroyed) {
      return false;
    }

    this.respawn();
    return true;
  }

  respawn() {
    this.plane.resetToSpawn();
    this.checkpointManager.reset();
    this.raceTimer.reset();

    if (this.onRespawn) {
      this.onRespawn();
    }
  }
}
