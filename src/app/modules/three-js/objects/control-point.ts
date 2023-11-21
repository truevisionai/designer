/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Material } from 'three';
import { AbstractControlPoint } from "./abstract-control-point";

export class NewDistanceNode extends AbstractControlPoint {

	constructor ( public roadId, public laneId, public s: number, public t: number, geometry?: BufferGeometry, material?: Material ) {
		super( geometry, material );
	}

}


