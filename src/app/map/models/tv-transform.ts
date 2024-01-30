/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';


export class TvTransform {
	constructor (
		public position: Vector3,
		public rotation: Euler,
		public scale: Vector3
	) {
	}
}
