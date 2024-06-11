/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ThirdOrderPolynom } from 'app/map/models/third-order-polynom';
import { TvRoad } from 'app/map/models/tv-road.model';
import { DebugLine } from '../../objects/debug-line';
import { DebugDrawService } from './debug-draw.service';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2, Vector3 } from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

@Injectable( {
	providedIn: 'root'
} )
export class RoadSpanService {

	constructor (
		private debug: DebugDrawService
	) { }
}
