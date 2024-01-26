/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPosTheta } from './tv-pos-theta';
import { TvRoad } from './tv-road.model';

describe( 'OdRoadLanes', () => {

	let road: TvRoad;
	let pose: TvPosTheta;

	beforeEach( () => {

		pose = new TvPosTheta();

		road = new TvRoad( '', 30, 1 );

		road.addPlanView();

		const s = 0;
		const x = 0;
		const y = 0;
		const hdg = 0;
		const length = 30;

		road.addGeometryLine( s, x, y, hdg, length );

	} );

	it( 'should give correct getLaneOffsetAt s', () => {

		road.addLaneSection( 0, true );
		road.addLaneOffsetRecord( 0, 0, 0, 0, 0 );
		road.addLaneOffsetRecord( 10, 1, 0, 0, 0 );
		road.addLaneOffsetRecord( 20, 2, 0, 0, 0 );

		expect( road.getLaneOffsetValue( 0 ) ).toBe( 0 );
		// expect( road.getLaneOffsetValue( 1 ) ).toBe( 0 );
		expect( road.getLaneOffsetValue( 10 ) ).toBe( 1 );
		// expect( road.getLaneOffsetValue( 11 ) ).toBe( 1 );
		expect( road.getLaneOffsetValue( 20 ) ).toBe( 2 );
		// expect( road.getLaneOffsetValue( 21 ) ).toBe( 2 );
		expect( road.getLaneOffsetValue( 30 ) ).toBe( 2 );


	} );

} );
