/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RoadSplineService } from './road-spline.service';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { RoadFactory } from 'app/factories/road-factory.service';
import { Vector3 } from 'three';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

describe( 'Service: RoadSpline', () => {

	let road1: TvRoad;
	let road2: TvRoad;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadSplineService ]
		} );

		road1 = RoadFactory.createStraightRoad( new Vector3( 0, 0, 0 ), Math.PI / 2, 10 );
		road2 = RoadFactory.createStraightRoad( new Vector3( 10, 0, 0 ), Math.PI / 2, 10 );

		TvMapInstance.map.addRoad( road1 );
		TvMapInstance.map.addRoad( road2 );

	} );

	it( 'should ...', inject( [ RoadSplineService ], ( service: RoadSplineService ) => {

		expect( service ).toBeTruthy();

	} ) );

	it( 'should maneuver spline for parallel points in same direction', inject( [ RoadSplineService ], ( service: RoadSplineService ) => {

		const pointA = new TvLaneCoord( road1.id, 0, 1, 0, 0 );
		const pointB = new TvLaneCoord( road2.id, 0, 1, 0, 0 );

		const spline = service.createManeuverSpline( pointA, pointB, TvLaneSide.RIGHT );

		expect( spline.controlPoints.length ).toBe( 4 );


	} ) );

} );
