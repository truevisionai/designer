/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map/map.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadLinkService } from 'app/services/road/road-link.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadNode } from 'app/objects/road-node';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineFactory } from 'app/services/spline/spline.factory';
import { AssetService } from 'app/core/asset/asset.service';
import { RoadToolDebugger } from "./road-tool.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolHelper {

	constructor (
		public assetService: AssetService,
		public splineService: SplineService,
		public base: BaseToolService,
		public pointFactory: ControlPointFactory,
		public roadLinkService: RoadLinkService,
		public roadService: RoadService,
		public splineFactory: SplineFactory,
		public toolDebugger: RoadToolDebugger,
	) {
	}

	addControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ): void {

		spline.addControlPoint( controlPoint );

		spline.update();

		this.splineService.update( spline );

	}

	insertControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		spline.insertPoint( controlPoint );

		this.splineService.update( spline );

	}

	removeControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		spline.removeControlPoint( controlPoint );

		spline.update();

		this.splineService.update( spline );

	}

	showLinks ( spline: AbstractSpline, point: AbstractControlPoint ) {

		this.roadLinkService.showSplineLinks( spline, point );

	}

	updateLinks ( spline: AbstractSpline, point: AbstractControlPoint ) {

		this.roadLinkService.updateSplineLinks( spline, point );

	}

	hideLinks ( selectedRoad: TvRoad ) {

		this.roadLinkService.hideLinks( selectedRoad );

	}

	removeRoad ( road: TvRoad ) {

		this.roadService.remove( road );

	}

	duplicateRoad ( selectedRoad: TvRoad ) {

		return this.roadService.duplicateRoad( selectedRoad );

	}

	createJoiningRoad ( nodeA: RoadNode, nodeB: RoadNode ) {

		const joiningRoad = this.roadService.createJoiningRoad( nodeA, nodeB );

		this.roadLinkService.linkRoads( nodeA, nodeB, joiningRoad );

		return joiningRoad;

	}

	addSpline ( spline: AbstractSpline ) {

		this.splineService.add( spline );

	}

	updateSpline ( spline: AbstractSpline ) {

		this.splineService.update( spline );

	}

	removeSpline ( spline: AbstractSpline ) {

		this.splineService.remove( spline );

	}

}
