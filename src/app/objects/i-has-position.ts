/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";

export interface IHasPosition {

	setPosition ( position: Vector3 ): void;

	getPosition (): Vector3;
}
