/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadGeometryService } from 'app/services/road/road-geometry.service';
import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdPoly3Geometry', () => {

	let road: TvRoad;
	let pose: TvPosTheta;

	beforeEach( () => {

		pose = new TvPosTheta();

		road = new TvRoad( '', 100, 1);

	} );

	it( 'should give correct coordinates with 0-degree hdg', () => {

		const s = 0;
		const x = 0;
		const y = 0;
		const hdg = 0;
		const length = 10;

		const a = 0;
		const b = 0;
		const c = 1;
		const d = 0;

		road.getPlanView().addGeometryPoly( s, x, y, hdg, length, a, b, c, d );

		pose = RoadGeometryService.instance.findRoadPosition(road, 0 );
		expect( pose.x ).toBe( 0 );
		expect( pose.y ).toBe( 0 );
		expect( pose.hdg ).toBe( 0 );

		pose = RoadGeometryService.instance.findRoadPosition(road, 1 );
		expect( pose.x ).toBe( 1 );
		expect( pose.y ).toBe( 1 );
		expect( pose.hdg ).toBe( 2 );

		pose = RoadGeometryService.instance.findRoadPosition(road, 2 );
		expect( pose.x ).toBe( 2 );
		expect( pose.y ).toBe( 4 );
		expect( pose.hdg ).toBe( 4 );

		pose = RoadGeometryService.instance.findRoadPosition(road, 3 );
		expect( pose.x ).toBe( 3 );
		expect( pose.y ).toBe( 9 );
		expect( pose.hdg ).toBe( 6 );

	} );

} );
