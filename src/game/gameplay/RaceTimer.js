export class RaceTimer {
  constructor(checkpointManager, options = {}) {
    this.options = {
      autoStartOnCheckpoint: true,
      stopOnCourseFinish: true,
      ...options
    };

    this.elapsedTime = 0;
    this.hasStarted = false;
    this.isRunning = false;

    checkpointManager.onCheckpointPassed((nextCheckpointIndex) => {
      if (this.options.autoStartOnCheckpoint && !this.hasStarted && nextCheckpointIndex > 0) {
        this.start();
      }
    });

    checkpointManager.onCourseFinished(() => {
      if (this.options.stopOnCourseFinish) {
        this.stop();
      }
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
