import { Injectable } from '@angular/core';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { TvVirtualJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { AbstractSpline } from "../../core/shapes/abstract-spline";

@Injectable( {
	providedIn: 'root'
} )
export class RoadRampService {

	constructor () { }

	createRampRoad ( virtualJunction: TvVirtualJunction, startCoord: TvLaneCoord, endCoord: TvLaneCoord | Vector3 ): TvRoad {

		let v1, v2, v3, v4;

		if ( endCoord instanceof TvLaneCoord ) {
			[ v1, v2, v3, v4 ] = this.makeRampRoadPoints( startCoord.position, endCoord.position, startCoord.posTheta.toDirectionVector() );
		} else if ( endCoord instanceof Vector3 ) {
			[ v1, v2, v3, v4 ] = this.makeRampRoadPoints( startCoord.position, endCoord, startCoord.posTheta.toDirectionVector() );
		}

		const newLane = startCoord.lane.cloneAtS( -1, startCoord.s );

		const rampRoad = RoadFactory.createRampRoad( newLane );

		const connection = new TvJunctionConnection( virtualJunction.connections.size, startCoord.road, rampRoad, TvContactPoint.START, null );

		connection.addLaneLink( new TvJunctionLaneLink( startCoord.lane, newLane ) );

		virtualJunction.addConnection( connection );

		rampRoad.junctionId = virtualJunction.id;

		rampRoad.addControlPointAt( v1 );
		rampRoad.addControlPointAt( v2 );
		rampRoad.addControlPointAt( v3 );
		rampRoad.addControlPointAt( v4 );

		const startElevation = startCoord.road.getElevationValue( startCoord.s );
		const endElevation = endCoord instanceof TvLaneCoord ? endCoord.road.getElevationValue( endCoord.s ) : endCoord.z;

		rampRoad.addElevation( 0, startElevation + 0.1, 0, 0, 0 );
		rampRoad.addElevationInstance( new TvElevation( rampRoad.length, endElevation + 0.1, 0, 0, 0 ) );

		// rampRoad.updateGeometryFromSpline();

		// rampRoad.predecessor = new TvRoadLinkChild( TvRoadLinkChildType.road, startCoord.roadId, TvContactPoint.START );
		// rampRoad.predecessor.elementDir = TvOrientation.PLUS;
		// rampRoad.predecessor.elementS = startCoord.s;

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

	makeRampSpline ( v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ): AbstractSpline {

		// const direction = posTheta.toDirectionVector();
		const normalizedDirection1 = direction1.clone().normalize();
		const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

		const upVector = new Vector3( 0, 0, 1 );
		const perpendicular1 = normalizedDirection1.clone().cross( upVector );
		const perpendicular4 = normalizedDirection4.clone().cross( upVector );

		const distanceAB = v1.distanceTo( v4 );

		const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
		const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

		const spline = new AutoSplineV2();

		spline.addControlPointAt( v1 );
		spline.addControlPointAt( v2 );
		spline.addControlPointAt( v3 );
		spline.addControlPointAt( v4 );

		return spline;
	}

	updateRampSpline ( spline: AutoSpline, v1: Vector3, v4: Vector3, direction1: Vector3, direction4?: Vector3 ) {

		// const direction = posTheta.toDirectionVector();
		const normalizedDirection1 = direction1.clone().normalize();
		const normalizedDirection4 = direction4 ? direction4.clone().normalize() : direction1.clone().normalize();

		const upVector = new Vector3( 0, 0, 1 );
		const perpendicular1 = normalizedDirection1.clone().cross( upVector );
		const perpendicular4 = normalizedDirection4.clone().cross( upVector );

		const distanceAB = v1.distanceTo( v4 );

		const v2 = v1.clone().add( normalizedDirection1.clone().multiplyScalar( distanceAB / 3 ) );
		const v3 = v4.clone().add( perpendicular1.clone().multiplyScalar( -distanceAB / 3 ) );

		spline.getSecondPoint().position.copy( v2 );
		spline.getSecondLastPoint().position.copy( v3 );

		return spline;
	}

}
