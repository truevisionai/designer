import { Injectable } from '@angular/core';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { TvContactPoint, TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { TvVirtualJunction } from 'app/modules/tv-map/models/junctions/tv-virtual-junction';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { BaseToolService } from 'app/tools/base-tool.service';
import { DebugDrawService } from '../debug/debug-draw.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { RoadSplineService } from './road-spline.service';
import { JunctionConnectionService } from '../junction/junction-connection.service';
import { LaneLinkService } from '../junction/lane-link.service';
import { RoadService } from './road.service';
import { JunctionService } from '../junction/junction.service';
import { MapService } from "../map.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadRampService {

	constructor (
		public base: BaseToolService,
		public debug: DebugDrawService,
		public roadSplineService: RoadSplineService,
		private junctionConnection: JunctionConnectionService,
		private laneLink: LaneLinkService,
		public roadService: RoadService,
		private junctionService: JunctionService,
		public mapService: MapService,
	) { }

	createJunction ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): TvVirtualJunction {

		if ( startPosition instanceof TvLaneCoord ) {

			const sStart = startPosition.s;

			const sEnd = sStart + 20;

			const orientation = TvOrientation.PLUS;

			return this.junctionService.createVirtualJunction( startPosition.road, sStart, sEnd, orientation );

		} else {

			throw new Error( 'startCoord must be of type TvLaneCoord' );

		}

	}

	// createConnection ( junction: TvVirtualJunction, startPosition: TvLaneCoord | Vector3, connectingRoad: TvRoad, connectingLane: TvLane ) {

	// 	const incomingRoad = startPosition instanceof TvLaneCoord ? startPosition.road : null;

	// 	const incomingLane = startPosition instanceof TvLaneCoord ? startPosition.lane : null;

	// 	const connection = this.junctionConnection.createConnectionV2( junction, incomingRoad, connectingRoad, TvContactPoint.START );

	// 	const laneLink = this.laneLink.createLaneLink( incomingLane, connectingLane );

	// 	connection.addLaneLink( laneLink );

	// 	junction.addConnection( connection );

	// 	return connection;

	// }

	createRampRoad ( virtualJunction: TvVirtualJunction, startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ): TvRoad {

		const incomingRoad = startCoord instanceof TvLaneCoord ? startCoord.road : null;

		const incomingLane = startCoord instanceof TvLaneCoord ? startCoord.lane : null;

		const sStart = startCoord instanceof TvLaneCoord ? startCoord.s : 0;

		const connectionLane = incomingLane.cloneAtS( -1, sStart );

		const rampRoad = this.roadService.createRampRoad( connectionLane );

		rampRoad.spline = this.createRampSplineV2( startCoord, endCoord );

		const connection = this.junctionConnection.createConnectionV2( virtualJunction, incomingRoad, rampRoad, TvContactPoint.START );

		connection.addLaneLink( new TvJunctionLaneLink( incomingLane, connectionLane ) );

		virtualJunction.addConnection( connection );

		rampRoad.setJunction( virtualJunction );

		// const startElevation = incomingRoad.getElevationValue( sStart );

		// const endElevation = endCoord instanceof TvLaneCoord ? endCoord.road.getElevationValue( endCoord.s ) : endCoord.z;

		// rampRoad.addElevation( 0, startElevation + 0.1, 0, 0, 0 );

		// rampRoad.addElevationInstance( new TvElevation( rampRoad.length, endElevation + 0.1, 0, 0, 0 ) );

		return rampRoad;

	}

	makeRampRoadPoints ( v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ): Vector3[] {

		// const direction = posTheta.toDirectionVector();
		const normalizedDirection1 = direction1.clone().normalize();
		const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

		const upVector = new Vector3( 0, 0, 1 );
		const perpendicular1 = normalizedDirection1.clone().cross( upVector );
		const perpendicular4 = normalizedDirection4.clone().cross( upVector );

		const distanceAB = v1.distanceTo( v4 );

		const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
		const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

		return [ v1, v2, v3, v4 ];
	}

	createRampSplineV2 ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): AbstractSpline {

		let v1: Vector3, v2: Vector3, d1: Vector3, d2: Vector3;

		if ( startPosition instanceof TvLaneCoord ) {

			v1 = startPosition.position;

			d1 = startPosition.laneDirection;

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

		return this.roadSplineService.createSpline( v1, d1, v2, d2 );

	}

	createRampReferenceLine ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createRampSplineV2( startPosition, endPosition );

		const points = spline.getPoints( 0.1 );

		const line = this.debug.createLine( points );

		return line;

	}

	updateRampReferenceLine ( line: Line2, startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ): Line2 {

		const spline = this.createRampSplineV2( startPosition, endPosition );

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
