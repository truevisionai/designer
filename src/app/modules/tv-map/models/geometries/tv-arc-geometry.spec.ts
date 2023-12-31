/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapQueries } from '../../queries/tv-map-queries';
import { TvMapInstance } from '../../services/tv-map-instance';
import { TvMap } from '../tv-map.model';
import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdArcGeometry', () => {

	let map: TvMap = TvMapInstance.map;
	let road: TvRoad;
	let pose = new TvPosTheta();

	beforeEach( () => {

		road = new TvRoad( '', 0, 1 );


	} );

	it( 'should give nearest point on arc', () => {

		// add roads
		// 3 arc roads
		// ==========|==========|==========
		const road1 = map.addNewRoad( '', 10, 1 );
		const road2 = map.addNewRoad( '', 10, 2 );
		const road3 = map.addNewRoad( '', 10, 3 );

		road1.addPlanView();
		road2.addPlanView();
		road3.addPlanView();

		road1.addGeometryArc( 0, 0, 0, 0, 10, 0 );
		road2.addGeometryArc( 0, 10, 0, 0, 10, 0 );
		road3.addGeometryArc( 0, 20, 0, 0, 10, 0 );

		let roadResult = TvMapQueries.getRoadByCoords( 0, 0 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 1 );

		roadResult = TvMapQueries.getRoadByCoords( 1, 9 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 1 );

		roadResult = TvMapQueries.getRoadByCoords( 11, 0 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 2 );

		roadResult = TvMapQueries.getRoadByCoords( 11, 10 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 2 );

		roadResult = TvMapQueries.getRoadByCoords( 21, 0 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 3 );

		roadResult = TvMapQueries.getRoadByCoords( 21, 10 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 3 );

	} );

	it( 'should cut correctly', () => {

		const geometry1 = road.addGeometryArc( 0, 0, 0, 0, 10, 0.00001 );
		const geometry2 = road.addGeometryArc( 10, 10, 0, 0, 10, 0.00001 );
		const geometry3 = road.addGeometryArc( 20, 20, 0, 0, 10, 0.00001 );

		const newGeometry = geometry2.cut( 12 );

		// for currently geometry only length is changed
		expect( newGeometry[ 0 ].s ).toBe( 10 );
		expect( newGeometry[ 0 ].length ).toBe( 2 );

		expect( newGeometry[ 1 ].s ).toBeCloseTo( 12 );
		expect( newGeometry[ 1 ].x ).toBeCloseTo( 12 );
		expect( newGeometry[ 1 ].y ).toBeCloseTo( 0 );
		expect( newGeometry[ 1 ].hdg ).toBeCloseTo( 0 );
		expect( newGeometry[ 1 ].length ).toBe( 8 );

		expect( road.geometries.length ).toBe( 3 );

	} )

	it( 'should cut correctly', () => {

		const geometry1 = road.addGeometryArc( 0, 0, 0, 0, 10, 0.00001 );
		const geometry2 = road.addGeometryArc( 10, 10, 0, 0, 10, 0.00001 );
		const geometry3 = road.addGeometryArc( 20, 20, 0, 0, 10, 0.00001 );

		const newGeometry = geometry2.cut( 18 );

		// for currently geometry only length is changed
		expect( newGeometry[ 0 ].s ).toBe( 10 );
		expect( newGeometry[ 0 ].length ).toBe( 8 );

		expect( newGeometry[ 1 ].s ).toBe( 18 );
		expect( newGeometry[ 1 ].x ).toBeCloseTo( 18 );
		expect( newGeometry[ 1 ].y ).toBeCloseTo( 0 );
		expect( newGeometry[ 1 ].hdg ).toBeCloseTo( 0 );
		expect( newGeometry[ 1 ].length ).toBe( 2 );

		expect( road.geometries.length ).toBe( 3 );

	} )

} );
