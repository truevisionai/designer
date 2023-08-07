/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapQueries } from '../../queries/tv-map-queries';
import { TvMapInstance } from '../../services/tv-map-source-file';
import { TvMap } from '../tv-map.model';
import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdArcGeometry', () => {

	let map: TvMap;
	let road: TvRoad;
	let pose = new TvPosTheta();

	beforeEach( () => {

		map = new TvMap();

		TvMapInstance.map = map;

	} );

	it( 'should give nearest point on arc', () => {

		// add roads
		// 3 arc roads
		// ==========|==========|==========
		const road1 = map.addNewRoad( '', 10, 1, -1 );
		const road2 = map.addNewRoad( '', 10, 2, -1 );
		const road3 = map.addNewRoad( '', 10, 3, -1 );

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

} );
