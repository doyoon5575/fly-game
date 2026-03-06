export class InputController {
  constructor() {
    this.keysDown = new Set();
    this.justPressed = new Set();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
  }

  handleKeyDown(event) {
    if (!this.keysDown.has(event.code)) {
      this.justPressed.add(event.code);
    }

    this.keysDown.add(event.code);
  }

  handleKeyUp(event) {
    this.keysDown.delete(event.code);
  }

  handleBlur() {
    this.keysDown.clear();
    this.justPressed.clear();
  }

  isDown(code) {
    return this.keysDown.has(code);
  }

  consumePress(code) {
    const pressed = this.justPressed.has(code);
    this.justPressed.delete(code);
    return pressed;
  }

  getState() {
    return {
      throttle: Number(this.isDown("KeyW")) - Number(this.isDown("KeyS")),
      yaw: Number(this.isDown("KeyD")) - Number(this.isDown("KeyA")),
      pitch: Number(this.isDown("ArrowUp")) - Number(this.isDown("ArrowDown")),
      roll: Number(this.isDown("KeyQ")) - Number(this.isDown("KeyE")),
      boost: this.isDown("ShiftLeft") || this.isDown("ShiftRight"),
      respawnPressed: this.consumePress("KeyR")
    };
  }

  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
  }
}
