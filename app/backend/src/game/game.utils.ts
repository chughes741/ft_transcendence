import { Vec2 } from "./vector";

export function degToRad(angle: number): number {
  return angle * (Math.PI / 180);
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect

export function checkIntersect(p1: Vec2, p2: Vec2, p3: Vec2, p4: Vec2): Vec2 {
  //Check to make sure none of the lines are length of 0
  if ((p1.x === p2.x && p1.y === p2.y) || (p3.x === p4.x && p3.y === p4.y))
    return null;

  const denominator: number =
    (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);

  //Check if lines are parallel
  if (denominator === 0) return null;

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    denominator;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    denominator;

  //Make sure intersection occurs along segment in question
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  //Create new point and return
  const x = p1.x + ua * (p2.x - p1.x);
  const y = p1.y + ua * (p2.y - p1.y);

  return new Vec2(x, y);
}
