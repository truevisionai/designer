/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadLinkService } from 'app/services/road/road-link.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { RoadNode } from 'app/objects/road-node';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineFactory } from 'app/services/spline/spline.factory';
import { AssetService } from 'app/core/asset/asset.service';
import { RoadToolDebugger } from "./road-tool.debugger";
import { TvRoadLink } from 'app/map/models/tv-road-link';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineBuilder } from 'app/services/spline/spline.builder';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolHelper {

	constructor (
		public assetService: AssetService,
		public splineService: SplineService,
		public base: BaseToolService,
		public roadLinkService: RoadLinkService,
		public roadService: RoadService,
		public splineFactory: SplineFactory,
		public toolDebugger: RoadToolDebugger,
		public roadFactory: RoadFactory,
		public splineBuilder: SplineBuilder,
		public splineTestHelper: SplineTestHelper
	) {
	}

	// addControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ): void {
	//
	// 	this.splineService.addControlPoint( spline, controlPoint );
	//
	// }
	//
	// insertControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {
	//
	// 	this.splineService.insertControlPoint( spline, controlPoint );
	//
	// }
	//
	// removeControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {
	//
	// 	this.splineService.removeControlPoint( spline, controlPoint );
	//
	// }

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

		const joiningRoad = this.createFromNodes( nodeA, nodeB );

		this.roadLinkService.linkRoads( nodeA, nodeB, joiningRoad );

		return joiningRoad;

	}

	createFromNodes ( firstNode: RoadNode, secondNode: RoadNode ) {

		const spline = this.splineFactory.createSplineFromNodes( firstNode, secondNode );

		this.splineBuilder.buildGeometry( spline );

		const joiningRoad = this.roadFactory.createJoiningRoad( spline, firstNode, secondNode );

		spline.segmentMap.set( 0, joiningRoad );

		joiningRoad.spline = spline;

		this.splineBuilder.build( spline );

		return joiningRoad;

	}

	createFromLinks ( firstNode: TvRoadLink, secondNode: TvRoadLink ) {

		const spline = this.splineFactory.createSplineFromLinks( firstNode, secondNode );

		this.splineBuilder.buildGeometry( spline );

		const joiningRoad = this.roadFactory.createFromLinks( spline, firstNode, secondNode );

		spline.segmentMap.set( 0, joiningRoad );

		joiningRoad.spline = spline;

		this.splineBuilder.build( spline );

		return joiningRoad;

	}

	// addSpline ( spline: AbstractSpline ) {
	//
	// 	this.splineService.add( spline );
	//
	// }
	//
	// updateSpline ( spline: AbstractSpline ) {
	//
	// 	this.splineService.update( spline );
	//
	// }
	//
	// removeSpline ( spline: AbstractSpline ) {
	//
	// 	this.splineService.remove( spline );
	//
	// }

}
