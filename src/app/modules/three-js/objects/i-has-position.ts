/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D, Vector3 } from 'three';

export interface IHasPosition extends Object3D {

	setPosition ( position: Vector3 ): void;

	copyPosition ( position: Vector3 ): void;

	getPosition (): Vector3;
}
