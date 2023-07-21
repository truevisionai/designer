/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPosTheta } from './tv-pos-theta';
import { TvRoad } from './tv-road.model';

describe( 'OdRoad', () => {

	let road: TvRoad;
	let pose: TvPosTheta;

	beforeEach( () => {

		pose = new TvPosTheta();

		road = new TvRoad( '', 30, 1, -1 );

		road.addPlanView();

		// 3 straight road lines
		road.addGeometryLine( 0, 0, 0, 0, 10 );
		road.addGeometryLine( 10, 0, 0, 1, 10 );
		road.addGeometryLine( 20, 0, 0, 2, 10 );

	} );

	it( 'should give correct geometry', () => {

		expect( road.getGeometryBlockCount() ).toBe( 3 );

		expect( road.getGeometryBlock( 0 ).hdg ).toBe( 0 );
		expect( road.getGeometryBlock( 1 ).hdg ).toBe( 1 );
		expect( road.getGeometryBlock( 2 ).hdg ).toBe( 2 );


	} );

	it( 'should give correct geometry index', () => {

		pose = road.getRoadCoordAt( 0 );
		expect( pose.hdg ).toBe( 0 );

		pose = road.getRoadCoordAt( 10 );
		expect( pose.hdg ).toBe( 1 );

		pose = road.getRoadCoordAt( 20 );
		expect( pose.hdg ).toBe( 2 );

	} );

	it( 'should give correct lane section', () => {

		road.addLaneSection( 0, false );
		road.addLaneSection( 10, false );
		road.addLaneSection( 20, false );


		expect( road.getLaneSectionAt( 0 ).s ).toBe( 0 );
		expect( road.getLaneSectionAt( 9 ).s ).toBe( 0 );
		expect( road.getLaneSectionAt( 10 ).s ).toBe( 10 );
		expect( road.getLaneSectionAt( 11 ).s ).toBe( 10 );
		expect( road.getLaneSectionAt( 20 ).s ).toBe( 20 );
		expect( road.getLaneSectionAt( 21 ).s ).toBe( 20 );
		expect( road.getLaneSectionAt( 30 ).s ).toBe( 20 );

	} );


	it( 'should give correct lane offset', () => {

		road.addLaneOffset( 0, 0, 0, 0, 0 );
		road.addLaneOffset( 10, 10, 0, 0, 0 );
		road.addLaneOffset( 20, 20, 0, 0, 0 );

		expect( road.getLaneOffsetAt( 0 ).a ).toBe( 0 );
		expect( road.getLaneOffsetAt( 1 ).a ).toBe( 0 );
		expect( road.getLaneOffsetAt( 9 ).a ).toBe( 0 );
		expect( road.getLaneOffsetAt( 10 ).a ).toBe( 10 );
		expect( road.getLaneOffsetAt( 11 ).a ).toBe( 10 );
		expect( road.getLaneOffsetAt( 20 ).a ).toBe( 20 );

	} );


	it( 'should give correct lane offset value', () => {

		road.addLaneOffset( 0, 0, 0, 0, 0 );
		road.addLaneOffset( 10, 10, 0, 0, 0 );
		road.addLaneOffset( 20, 20, 0, 0, 0 );

		expect( road.getLaneOffsetValue( 0 ) ).toBe( 0 );
		expect( road.getLaneOffsetValue( 1 ) ).toBe( 0 );
		expect( road.getLaneOffsetValue( 9 ) ).toBe( 0 );
		expect( road.getLaneOffsetValue( 10 ) ).toBe( 10 );
		expect( road.getLaneOffsetValue( 11 ) ).toBe( 10 );
		expect( road.getLaneOffsetValue( 20 ) ).toBe( 20 );

	} );

} );
