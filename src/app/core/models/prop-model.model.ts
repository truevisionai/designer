/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';

/**
 * Prop class instance holds info about the prop
 */
export class PropModel {

	constructor ( public guid: string, public rotationVariance: Vector3, public scaleVariance: Vector3 ) {

	}
}
