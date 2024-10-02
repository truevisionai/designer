/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { MapService } from 'app/services/map/map.service';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineGeometryGenerator } from 'app/services/spline/spline-geometry-generator';
import { SplineSegmentService } from 'app/services/spline/spline-segment.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerToolService {

	constructor (
		public dividerService: RoadDividerService,
		public base: BaseToolService,
		public debugService: DebugDrawService,
		public roadDebug: RoadDebugService,
		public roadService: RoadService,
		public splineService: SplineService,
		public splineBuilder: SplineGeometryGenerator,
		public mapService: MapService,
		public segmentService: SplineSegmentService,
	) { }

}
