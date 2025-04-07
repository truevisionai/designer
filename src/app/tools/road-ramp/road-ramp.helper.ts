/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvOrientation } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'app/core/maths';
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { BaseToolService } from 'app/tools/base-tool.service';
import { DebugDrawService } from '../../services/debug/debug-draw.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { SplineFactory } from '../../services/spline/spline.factory';
import { RoadService } from '../../services/road/road.service';
import { JunctionService } from '../../services/junction/junction.service';
import { MapService } from "../../services/map/map.service";
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { RoadDividerService } from "../../services/road/road-divider.service";
import { JunctionFactory } from "../../factories/junction.factory";
import { SplineService } from "../../services/spline/spline.service";
import { SplineGeometryGenerator } from 'app/services/spline/spline-geometry-generator';
import { RoadFactory } from 'app/factories/road-factory.service';
import { SplineUtils } from "../../utils/spline.utils";

@Injectable( {
	providedIn: 'root'
} )
export class RampToolHelper {

	constructor (
		public base: BaseToolService,
		public debug: DebugDrawService,
		public splineFactory: SplineFactory,
		public roadFactory: RoadFactory,
		public roadService: RoadService,
		public junctionService: JunctionService,
		public mapService: MapService,
		public roadCutService: RoadDividerService,
		public junctionFactory: JunctionFactory,
		public splineService: SplineService,
		public splineBuilder: SplineGeometryGenerator,
		public roadDividerService: RoadDividerService,
	) {
	}

	createJunction ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): TvJunction {

		if ( startPosition instanceof TvLaneCoord ) {

			const sStart = startPosition.laneDistance;

			const sEnd = sStart + 20;

			const orientation = TvOrientation.PLUS;

			const junction = this.junctionFactory.createByType();

			const road = this.roadService.clone( startPosition.road );

			SplineUtils.addSegment( startPosition.road.spline, sEnd, road );

			SplineUtils.addSegment( startPosition.road.spline, sStart, junction );

			return junction;

		}

	}

	createRampRoad ( startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ): TvRoad {

		const rampRoad = RoadFactory.createRampRoad( startCoord, endCoord );

		this.mapService.map.updateRoadId( rampRoad );

		return rampRoad;

	}

	// addLaneSection ( start: TvLaneCoord | Vector3, end: TvLaneCoord | Vector3, road: TvRoad ): void {

	// 	// let rightLaneCount = 1;
	// 	// let leftLaneCount = 1;

	// 	// for ( const incomingLane of incomingLanes ) {

	// 	// 	const lane = connectingLaneSection.createRightLane( -rightLaneCount, incomingLane.type, true, true );

	// 	// 	LaneUtils.copyPreviousLane( incomingLane, incomingLane.laneSection, incomingLane.laneSection.road, lane );

	// 	// 	rightLaneCount++;

	// 	// }

	// 	// for ( const sourceLane of incomingLanes ) {

	// 	// 	if ( sourceLane.type == TvLaneType.driving ) continue;

	// 	// 	const lane = connectingLaneSection.createLeftLane( leftLaneCount, sourceLane.type, true, true );

	// 	// 	LaneUtils.copyPreviousLane( sourceLane, sourceLane.laneSection, sourceLane.laneSection.road, lane );

	// 	// 	leftLaneCount++;

	// 	// }

	// 	// road.getLaneProfile().addLaneSection( connectingLaneSection );

	// }

	createSpline ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): AbstractSpline {

		return SplineFactory.createRampRoadSpline( startPosition, endPosition );

	}

	createReferenceLine ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createSpline( startPosition, endPosition );

		this.splineBuilder.buildSpline( spline );

		const points = spline.getPoints( 0.1 );

		const line = this.debug.createLine( points );

		return line;

	}

	updateReferenceLine ( line: Line2, startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createSpline( startPosition, endPosition );

		this.splineBuilder.buildGeometry( spline );

		const positions = spline.getPoints( 0.1 );

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		line.geometry.dispose();

		line.geometry = geometry;

		return line;

	}

}
