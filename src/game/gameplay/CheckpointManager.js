export class CheckpointManager {
  constructor(checkpoints) {
    this.checkpoints = checkpoints;
    this.nextCheckpointIndex = 0;
    this.finished = false;
    this.checkpointPassedListeners = new Set();
    this.courseFinishedListeners = new Set();

    this.refreshVisuals();
  }

  onCheckpointPassed(listener) {
    this.checkpointPassedListeners.add(listener);
    return () => this.checkpointPassedListeners.delete(listener);
  }

  onCourseFinished(listener) {
    this.courseFinishedListeners.add(listener);
    return () => this.courseFinishedListeners.delete(listener);
  }

  update(planePosition, planeRadius) {
    if (this.finished || this.totalCheckpoints <= 0) {
      return;
    }

    const checkpoint = this.checkpoints[this.nextCheckpointIndex];
    if (!checkpoint || !checkpoint.containsPoint(planePosition, planeRadius)) {
      return;
    }

    this.nextCheckpointIndex += 1;
    this.checkpointPassedListeners.forEach((listener) => {
      listener(this.nextCheckpointIndex, this.totalCheckpoints);
    });

    if (this.nextCheckpointIndex >= this.totalCheckpoints) {
      this.finished = true;
      this.courseFinishedListeners.forEach((listener) => listener());
    }

    this.refreshVisuals();
  }

  reset() {
    this.nextCheckpointIndex = 0;
    this.finished = false;
    this.refreshVisuals();
  }

  refreshVisuals() {
    this.checkpoints.forEach((checkpoint, index) => {
      if (index < this.nextCheckpointIndex) {
        checkpoint.setVisualState("passed");
      } else if (index === this.nextCheckpointIndex && !this.finished) {
        checkpoint.setVisualState("next");
      } else {
        checkpoint.setVisualState("upcoming");
      }
    });
  }

  get totalCheckpoints() {
    return this.checkpoints.length;
  }
}
