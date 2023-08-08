/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { Object3D } from 'three';

export class PropInstance {

	public point: BaseControlPoint;

	constructor ( public guid: string, public object: Object3D ) {

	}

	update () {

	}

}
