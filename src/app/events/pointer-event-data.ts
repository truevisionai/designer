/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {Face3, Intersection, Object3D, Vector2, Vector3} from 'three/three-core';

export class BaseEventData {
  object: Object3D;
}

export enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2
}

export class PointerMoveData {
  point: Vector3;
}

export class PointerEventData extends BaseEventData {
  distance: number;
  distanceToRay?: number;
  point: Vector3;
  index?: number;
  face?: Face3 | null;
  faceIndex?: number;
  uv?: Vector2;
  button: MouseButton;
  intersections?: Intersection[];
  approxCameraDistance?: number
}

