/**
 *
 */
export class Vec2 {
  public x: number;
  public y: number;

  constructor(X?: number, Y?: number) {
    this.x = X;
    this.y = Y;
  }

  /**
   * Add a and b
   * @param {Vec2} a
   * @param {Vec2} b
   * @returns {Vec2} - resultant vector
   */
  static add(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x + b.x, a.y + b.y);
  }

  /**
   * Subract b from a
   * @param {Vec2} a
   * @param {Vec2} b
   * @returns {Vec2} - resultant vector
   */
  static sub(a: Vec2, b: Vec2): Vec2 {
    return new Vec2(a.x - b.x, a.y - b.y);
  }

  /**
   * Scale a by factor
   * @param {Vec2} a
   * @param {number} factor - factor to scale a by
   * @returns {Vec2} - resultant vector
   */
  static scale(a: Vec2, factor: number): Vec2 {
    return new Vec2(a.x * factor, a.y * factor);
  }

  /**
   * Scale b by factor then add it to a
   * @param {Vec2} a
   * @param {Vec2} b
   * @param {number} factor - factor to scale b by
   * @returns {Vec2}
   */
  static scaleAndAdd(a: Vec2, b: Vec2, factor: number): Vec2 {
    return Vec2.add(a, Vec2.scale(b, factor));
  }

  /**
   * Normalize the vectors length to 1
   * @param {Vec2} a
   * @returns {Vec2} - normalized vector
   */
  static normalize(a: Vec2): Vec2 {
    const mag: number = Vec2.len(a);

    if (mag === 0) return new Vec2(0, 0);

    return new Vec2(a.x / mag, a.y / mag);
  }

  /**
   * Calculates length of a vector
   * @param {Vec2} a
   * @returns {number} - length of vector
   */
  static len(a: Vec2): number {
    return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
  }
}
