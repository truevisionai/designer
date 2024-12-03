/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadService } from 'app/services/road/road.service';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadNode } from 'app/objects/road/road-node';
import { SplineService } from 'app/services/spline/spline.service';
import { SplineFactory } from 'app/services/spline/spline.factory';
import { AssetService } from 'app/assets/asset.service';
import { RoadToolDebugger } from "./road-tool.debugger";
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineGeometryGenerator } from 'app/services/spline/spline-geometry-generator';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolHelper {

	constructor (
		public assetService: AssetService,
		public splineService: SplineService,
		public base: BaseToolService,
		public roadService: RoadService,
		public splineFactory: SplineFactory,
		public toolDebugger: RoadToolDebugger,
		public roadFactory: RoadFactory,
		public splineBuilder: SplineGeometryGenerator,
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


	removeRoad ( road: TvRoad ): void {

		this.roadService.remove( road );

	}

	duplicateRoad ( selectedRoad: TvRoad ): any {

		return this.roadService.duplicateRoad( selectedRoad );

	}

	createJoiningRoad ( nodeA: RoadNode, nodeB: RoadNode ): TvRoad {

		const joiningRoad = this.createFromNodes( nodeA, nodeB );

		joiningRoad.linkPredecessorRoad( nodeA.road, nodeA.contact );

		joiningRoad.linkSuccessorRoad( nodeB.road, nodeB.contact );

		return joiningRoad;

	}

	createFromNodes ( firstNode: RoadNode, secondNode: RoadNode ): any {

		const spline = this.splineFactory.createSplineFromNodes( firstNode, secondNode );

		this.splineBuilder.buildGeometry( spline );

		const joiningRoad = this.roadFactory.createJoiningRoad( spline, firstNode, secondNode );

		spline.addSegment( 0, joiningRoad );

		joiningRoad.spline = spline;

		this.splineBuilder.generateGeometryAndBuildSegmentsAndBounds( spline );

		return joiningRoad;

	}

}
