export class RaceTimer {
  constructor(checkpointManager) {
    this.elapsedTime = 0;
    this.hasStarted = false;
    this.isRunning = false;

    checkpointManager.onCheckpointPassed((nextCheckpointIndex) => {
      if (!this.hasStarted && nextCheckpointIndex > 0) {
        this.start();
      }
    });

    checkpointManager.onCourseFinished(() => {
      this.stop();
    });
  }

  update(dt) {
    if (!this.isRunning) {
      return;
    }

    this.elapsedTime += dt;
  }

  start() {
    this.hasStarted = true;
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.elapsedTime = 0;
    this.hasStarted = false;
    this.isRunning = false;
  }

  getFormattedTime() {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    const secondsText = seconds.toFixed(2).padStart(5, "0");
    return `${String(minutes).padStart(2, "0")}:${secondsText}`;
  }
}
