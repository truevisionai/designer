/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint, TvLaneSide, TvLaneType, TvOrientation, TvRoadMarkTypes } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'three';
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { BaseToolService } from 'app/tools/base-tool.service';
import { DebugDrawService } from '../../services/debug/debug-draw.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { SplineFactory } from '../../services/spline/spline.factory';
import { ConnectionService } from '../../map/junction/connection/connection.service';
import { RoadService } from '../../services/road/road.service';
import { JunctionService } from '../../services/junction/junction.service';
import { MapService } from "../../services/map/map.service";
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { RoadDividerService } from "../../services/road/road-divider.service";
import { JunctionFactory } from "../../factories/junction.factory";
import { SplineService } from "../../services/spline/spline.service";
import { SplineBuilder } from 'app/services/spline/spline.builder';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLane } from 'app/map/models/tv-lane';
import { LaneUtils } from 'app/utils/lane.utils';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvRoadLinkNeighbor } from "../../map/models/tv-road-link-neighbor";

@Injectable( {
	providedIn: 'root'
} )
export class RampToolHelper {

	constructor (
		public base: BaseToolService,
		public debug: DebugDrawService,
		public splineFactory: SplineFactory,
		public junctionConnection: ConnectionService,
		public roadFactory: RoadFactory,
		public roadService: RoadService,
		public junctionService: JunctionService,
		public mapService: MapService,
		public roadCutService: RoadDividerService,
		public junctionFactory: JunctionFactory,
		public connectionService: ConnectionService,
		public splineService: SplineService,
		public splineBuilder: SplineBuilder,
		public roadDividerService: RoadDividerService,
	) {
	}

	createJunction ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): TvJunction {

		if ( startPosition instanceof TvLaneCoord ) {

			const sStart = startPosition.s;

			const sEnd = sStart + 20;

			const orientation = TvOrientation.PLUS;

			const junction = this.junctionFactory.createJunction();

			const road = this.roadService.clone( startPosition.road );

			this.splineService.addRoadSegmentNew( startPosition.road.spline, sEnd, road );

			this.splineService.addJunctionSegment( startPosition.road.spline, sStart, junction );

			return junction;

		}

	}

	createRampRoad ( startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ): TvRoad {

		const rampRoad = this.roadService.createNewRoad();

		rampRoad.spline = this.createSpline( startCoord, endCoord );

		if ( startCoord instanceof TvLaneCoord ) {

			startCoord.road.neighbors.push( new TvRoadLinkNeighbor( rampRoad, TvContactPoint.START ) );

			rampRoad.neighbors.push( new TvRoadLinkNeighbor( startCoord.road, null ) );

		}

		this.addLaneSection( startCoord, endCoord, rampRoad );

		// NOTE: This is a hack to make the ramp road work
		rampRoad.spline.segmentMap.set( 0, rampRoad );

		this.splineBuilder.build( rampRoad.spline );

		return rampRoad;

	}

	addLaneSection ( start: TvLaneCoord | Vector3, end: TvLaneCoord | Vector3, road: TvRoad ) {

		const connectingLaneSection = new TvLaneSection( 0, 0, true, road );

		let incomingLanes: TvLane[] = [];

		if ( start instanceof TvLaneCoord ) {
			if ( start.lane.isRight ) {
				incomingLanes = start.laneSection.getLaneArray().filter( lane => lane.id < start.laneId );
			} else {
				// TODO: check if this is correct
				incomingLanes = start.laneSection.getLaneArray().filter( lane => lane.id > start.laneId );
			}
		}

		if ( incomingLanes.find( lane => lane.type == TvLaneType.driving ) == undefined ) {
			if ( start instanceof TvLaneCoord ) {
				if ( start.lane.isRight ) {
					incomingLanes = start.laneSection.getLaneArray().filter( lane => lane.id <= start.laneId );
				} else {
					incomingLanes = start.laneSection.getLaneArray().filter( lane => lane.id >= start.laneId );
				}
			}
		}

		const centerLane = connectingLaneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, false );

		centerLane.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID );

		let rightLaneCount = 1;
		let leftLaneCount = 1;

		for ( const incomingLane of incomingLanes ) {

			const lane = connectingLaneSection.addLane( TvLaneSide.RIGHT, -rightLaneCount, incomingLane.type, true, true );

			LaneUtils.copyPreviousLane( incomingLane, incomingLane.laneSection, incomingLane.laneSection.road, lane );

			rightLaneCount++;

		}

		for ( const sourceLane of incomingLanes ) {

			if ( sourceLane.type == TvLaneType.driving ) continue;

			const lane = connectingLaneSection.addLane( TvLaneSide.LEFT, leftLaneCount, sourceLane.type, true, true );

			LaneUtils.copyPreviousLane( sourceLane, sourceLane.laneSection, sourceLane.laneSection.road, lane );

			leftLaneCount++;

		}

		road.addLaneSectionInstance( connectingLaneSection );

	}

	createSpline ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): AbstractSpline {

		let v1: Vector3, v2: Vector3, d1: Vector3, d2: Vector3;

		if ( startPosition instanceof TvLaneCoord ) {

			const position = this.roadService.findLaneStartPosition(
				startPosition.road,
				startPosition.laneSection,
				startPosition.lane,
				startPosition.s,
				startPosition.offset
			);

			v1 = position.position;

			d1 = startPosition.laneDirection;

			// add 45 degree angle to the direction
			// to smooth out the curve
			// d1.applyAxisAngle( new Vector3( 0, 0, 1 ), -Math.PI / 4 );

		} else if ( startPosition instanceof Vector3 ) {

			v1 = startPosition;

			d1 = new Vector3( 0, 0, 1 );

		}

		if ( endPosition instanceof TvLaneCoord ) {

			v2 = endPosition.position;

			d2 = endPosition.laneDirection.negate();

		} else if ( endPosition instanceof Vector3 ) {

			v2 = endPosition;

			d2 = d1.clone().multiplyScalar( -1 );

		}

		const spline = this.createSplineNew( v1, d1, v2, d2 );

		this.splineBuilder.buildSpline( spline );

		return spline;
	}

	createSplineNew ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider = 3 ): AbstractSpline {

		// directions must be normalized
		const d1 = startDirection.clone().normalize();

		const distance = start.distanceTo( end );

		// v2 and v3 are the control points
		const p1 = start.clone().add( d1.clone().multiplyScalar( Math.min( distance / divider, 30 ) ) );

		// add 45 degree angle to the direction
		// to smooth out the curve
		const d2 = d1.applyAxisAngle( new Vector3( 0, 0, 1 ), -Math.PI / 2 );
		const p2 = p1.clone().add( d2.clone().multiplyScalar( start.distanceTo( p1 ) * 2 ) );

		const spline = new AutoSplineV2();

		spline.controlPoints.push( ControlPointFactory.createControl( spline, start ) );
		// spline.controlPoints.push( ControlPointFactory.createControl( spline, p1 ) );
		// spline.controlPoints.push( ControlPointFactory.createControl( spline, p2 ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, end ) );

		return spline;
	}

	createReferenceLine ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createSpline( startPosition, endPosition );

		this.splineBuilder.buildSpline( spline );

		const points = this.splineService.getPoints( spline, 0.1 );

		const line = this.debug.createLine( points );

		return line;

	}

	updateReferenceLine ( line: Line2, startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createSpline( startPosition, endPosition );

		this.splineBuilder.buildSpline( spline );

		const positions = this.splineService.getPoints( spline, 0.1 );

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
