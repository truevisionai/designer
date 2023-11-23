/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapQueries } from '../../queries/tv-map-queries';
import { TvMapInstance } from '../../services/tv-map-instance';
import { TvMap } from '../tv-map.model';
import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'TvLineGeometry', () => {

	let map: TvMap;
	let road: TvRoad;
	let pose = new TvPosTheta();

	beforeEach( () => {

		map = new TvMap();

		TvMapInstance.map = map;

		road = new TvRoad( '', 10, 1 );

		road.addPlanView();

	} );

	it( 'should give correct coordinates with 0-degree hdg', () => {

		road.addGeometryLine( 0, 0, 1, 0, 10 );

		let posTheta = new TvPosTheta();

		posTheta = road.getRoadCoordAt( 0 );

		expect( posTheta.x ).toBe( 0 );
		expect( posTheta.y ).toBe( 1 );
		expect( posTheta.hdg ).toBe( 0 );

		posTheta = road.getRoadCoordAt( 10 );

		expect( posTheta.x ).toBe( 10 );
		expect( posTheta.y ).toBe( 1 );
		expect( posTheta.hdg ).toBe( 0 );

	} );

	it( 'should give correct coordinates with 90degree hdg', () => {

		const hdg = 90 * ( Math.PI / 180 );

		road.addGeometryLine( 0, 1, 0, hdg, 10 );

		let posTheta = new TvPosTheta();

		posTheta = road.getRoadCoordAt( 0 );

		expect( posTheta.x ).toBe( 1 );
		expect( posTheta.y ).toBe( 0 );
		expect( posTheta.hdg ).toBe( hdg );

		posTheta = road.getRoadCoordAt( 10 );

		expect( Math.round( posTheta.x ) ).toBe( 1 );
		expect( Math.round( posTheta.y ) ).toBe( 10 );
		expect( posTheta.hdg ).toBe( hdg );

	} );

	it( 'should give correct coordinates with 180 degree hdg', () => {

		const hdg = 180 * ( Math.PI / 180 );

		road.addGeometryLine( 0, 0, 0, hdg, 10 );

		let posTheta = road.getRoadCoordAt( 0 );

		expect( Math.round( posTheta.x ) ).toBe( 0 );
		expect( posTheta.y ).toBe( 0 );
		expect( posTheta.hdg ).toBe( hdg );

		posTheta = road.getRoadCoordAt( 10 );

		expect( Math.round( posTheta.x ) ).toBe( -10 );
		expect( Math.round( posTheta.y ) ).toBe( 0 );
		expect( posTheta.hdg ).toBe( hdg );

	} );

	it( 'should give correct coordinates for s and t with 0 degree hdg', () => {

		const hdg = 0;
		const x = 0;
		const y = 0;
		const s = 0;
		const length = 10;

		let t = 0;

		road.addGeometryLine( s, x, y, hdg, length );

		pose = road.getRoadCoordAt( s );

		expect( Math.round( pose.x ) ).toBe( 0 );
		expect( pose.y ).toBe( 0 );

		t = 1;

		pose = road.getRoadCoordAt( s, t );

		expect( Math.round( pose.x ) ).toBe( 0 );
		expect( pose.y ).toBe( t );

	} );

	it( 'should give correct coordinates for s and t with 90 degree hdg', () => {

		const hdg = 90 * ( Math.PI / 180 );
		const x = 0;
		const y = 0;
		const s = 0;
		const length = 10;

		let t = 0;

		road.addGeometryLine( s, x, y, hdg, length );

		pose = road.getRoadCoordAt( s );

		expect( Math.round( pose.x ) ).toBe( 0 );
		expect( Math.round( pose.y ) ).toBe( 0 );

		t = 1;

		pose = road.getRoadCoordAt( s, t );

		expect( Math.round( pose.x ) ).toBe( -1 );
		expect( Math.round( pose.y ) ).toBe( 0 );

	} );

	it( 'should give nearest point on line', () => {

		// add roads
		// 3 straight road
		// ==========|==========|==========
		const road1 = map.addNewRoad( '', 10, 1, -1 );
		const road2 = map.addNewRoad( '', 10, 2, -1 );
		const road3 = map.addNewRoad( '', 10, 3, -1 );

		road1.addPlanView();
		road2.addPlanView();
		road3.addPlanView();

		road1.addGeometryLine( 0, 0, 0, 0, 10 );
		road2.addGeometryLine( 0, 10, 0, 0, 10 );
		road3.addGeometryLine( 0, 20, 0, 0, 10 );

		let roadResult = TvMapQueries.getRoadByCoords( 0, 0 );
		expect( roadResult ).not.toBeNull();
		expect( roadResult.id ).toBe( 1 );

		roadResult = TvMapQueries.getRoadByCoords( 1, 10 );
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

		const lineGeometry1 = road.addGeometryLine( 0, 0, 0, 0, 10 );
		const lineGeometry2 = road.addGeometryLine( 10, 10, 0, 0, 10 );
		const lineGeometry3 = road.addGeometryLine( 20, 20, 0, 0, 10 );


		const geometries = lineGeometry2.cut( 12 );

		// for currently geometry only length is changed
		expect( geometries[ 0 ].s ).toBe( 10 );
		expect( geometries[ 0 ].length ).toBe( 2 );

		expect( geometries[ 1 ].s ).toBe( 12 );
		expect( geometries[ 1 ].x ).toBe( 12 );
		expect( geometries[ 1 ].y ).toBe( 0 );
		expect( geometries[ 1 ].hdg ).toBe( 0 );
		expect( geometries[ 1 ].length ).toBe( 8 );

		expect( road.geometries.length ).toBe( 3 );

	} )

	it( 'should cut correctly', () => {

		const lineGeometry1 = road.addGeometryLine( 0, 0, 0, 0, 10 );
		const lineGeometry2 = road.addGeometryLine( 10, 10, 0, 0, 10 );
		const lineGeometry3 = road.addGeometryLine( 20, 20, 0, 0, 10 );

		const geometries = lineGeometry2.cut( 18 );

		// for currently geometry only length is changed
		expect( geometries[ 0 ].s ).toBe( 10 );
		expect( geometries[ 0 ].length ).toBe( 8 );

		expect( geometries[ 1 ].s ).toBe( 18 );
		expect( geometries[ 1 ].x ).toBe( 18 );
		expect( geometries[ 1 ].y ).toBe( 0 );
		expect( geometries[ 1 ].hdg ).toBe( 0 );
		expect( geometries[ 1 ].length ).toBe( 2 );

		expect( road.geometries.length ).toBe( 3 );

	} )

} );
