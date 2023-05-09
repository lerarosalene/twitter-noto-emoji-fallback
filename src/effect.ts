export class Effect {
  private _cleanup: Function | null = null;

  public run(f: Function) {
    this._cleanup?.();
    this._cleanup = null;
    const cleanup = f();
    if (cleanup instanceof Function) {
      this._cleanup = cleanup;
    }
  }

  public end() {
    this._cleanup?.();
    this._cleanup = null;
  }
}
