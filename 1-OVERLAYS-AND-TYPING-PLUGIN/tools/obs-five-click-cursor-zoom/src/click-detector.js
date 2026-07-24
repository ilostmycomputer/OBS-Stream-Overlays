export class RapidClickDetector {
  constructor({ requiredClicks, windowMs, radiusPx, cooldownMs }) {
    if (!Number.isInteger(requiredClicks) || requiredClicks < 2) {
      throw new TypeError('requiredClicks must be an integer of at least 2');
    }

    this.requiredClicks = requiredClicks;
    this.windowMs = windowMs;
    this.radiusPx = radiusPx;
    this.cooldownMs = cooldownMs;
    this.clicks = [];
    this.cooldownUntil = Number.NEGATIVE_INFINITY;
  }

  reset() {
    this.clicks = [];
  }

  register({ x, y, time = Date.now() }) {
    if (time < this.cooldownUntil) return false;

    const cutoff = time - this.windowMs;
    this.clicks = this.clicks.filter((click) => click.time >= cutoff);
    this.clicks.push({ x, y, time });

    if (this.clicks.length < this.requiredClicks) return false;

    const candidate = this.clicks.slice(-this.requiredClicks);
    const first = candidate[0];
    const insideWindow = candidate.at(-1).time - first.time <= this.windowMs;
    const insideRadius = this.radiusPx <= 0 || candidate.every((click) => {
      return Math.hypot(click.x - first.x, click.y - first.y) <= this.radiusPx;
    });

    if (!insideWindow || !insideRadius) return false;

    this.clicks = [];
    this.cooldownUntil = time + this.cooldownMs;
    return true;
  }
}
