/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadGeometryService } from 'app/services/road/road-geometry.service';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoad } from './tv-road.model';

describe( 'RoadTests', () => {

	let road: TvRoad;
	let pose: TvPosTheta;

	beforeEach( () => {

		pose = new TvPosTheta();

		road = new TvRoad( '', 30, 1 );

		// 3 straight road lines
		road.getPlanView().addGeometryLine( 0, 0, 0, 0, 10 );
		road.getPlanView().addGeometryLine( 10, 0, 0, 1, 10 );
		road.getPlanView().addGeometryLine( 20, 0, 0, 2, 10 );

	} );

	it( 'should give correct geometry', () => {

		expect( road.getPlanView().getGeometryCount() ).toBe( 3 );

		expect( road.getPlanView().getGeometryAtIndex( 0 ).hdg ).toBe( 0 );
		expect( road.getPlanView().getGeometryAtIndex( 1 ).hdg ).toBe( 1 );
		expect( road.getPlanView().getGeometryAtIndex( 2 ).hdg ).toBe( 2 );


	} );

	it( 'should give correct geometry index', () => {

		pose = RoadGeometryService.instance.findRoadPosition(road, 0 );
		expect( pose.hdg ).toBe( 0 );

		pose = RoadGeometryService.instance.findRoadPosition(road, 10 );
		expect( pose.hdg ).toBe( 1 );

		pose = RoadGeometryService.instance.findRoadPosition(road, 20 );
		expect( pose.hdg ).toBe( 2 );

	} );

	it( 'should give correct lane section', () => {

		road.getLaneProfile().createAndAddLaneSection( 0, false );
		road.getLaneProfile().createAndAddLaneSection( 10, false );
		road.getLaneProfile().createAndAddLaneSection( 20, false );


		expect( road.getLaneProfile().getLaneSectionAt( 0 ).s ).toBe( 0 );
		expect( road.getLaneProfile().getLaneSectionAt( 9 ).s ).toBe( 0 );
		expect( road.getLaneProfile().getLaneSectionAt( 10 ).s ).toBe( 10 );
		expect( road.getLaneProfile().getLaneSectionAt( 11 ).s ).toBe( 10 );
		expect( road.getLaneProfile().getLaneSectionAt( 20 ).s ).toBe( 20 );
		expect( road.getLaneProfile().getLaneSectionAt( 21 ).s ).toBe( 20 );
		expect( road.getLaneProfile().getLaneSectionAt( 30 ).s ).toBe( 20 );

	} );


	it( 'should give correct lane offset', () => {

		road.getLaneProfile().createAndAddLaneOffset( 0, 0, 0, 0, 0 );
		road.getLaneProfile().createAndAddLaneOffset( 10, 10, 0, 0, 0 );
		road.getLaneProfile().createAndAddLaneOffset( 20, 20, 0, 0, 0 );

		expect( road.getLaneProfile().getLaneOffsetAt( 0 ).a ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetAt( 1 ).a ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetAt( 9 ).a ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetAt( 10 ).a ).toBe( 10 );
		expect( road.getLaneProfile().getLaneOffsetAt( 11 ).a ).toBe( 10 );
		expect( road.getLaneProfile().getLaneOffsetAt( 20 ).a ).toBe( 20 );

	} );


	it( 'should give correct lane offset value', () => {

		road.getLaneProfile().createAndAddLaneOffset( 0, 0, 0, 0, 0 );
		road.getLaneProfile().createAndAddLaneOffset( 10, 10, 0, 0, 0 );
		road.getLaneProfile().createAndAddLaneOffset( 20, 20, 0, 0, 0 );

		expect( road.getLaneProfile().getLaneOffsetValue( 0 ) ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetValue( 1 ) ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetValue( 9 ) ).toBe( 0 );
		expect( road.getLaneProfile().getLaneOffsetValue( 10 ) ).toBe( 10 );
		expect( road.getLaneProfile().getLaneOffsetValue( 11 ) ).toBe( 10 );
		expect( road.getLaneProfile().getLaneOffsetValue( 20 ) ).toBe( 20 );

	} );

} );
