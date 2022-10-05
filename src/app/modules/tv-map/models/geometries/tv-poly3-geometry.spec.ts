/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdPoly3Geometry', () => {

	let road: TvRoad;
	let pose: TvPosTheta;

	beforeEach( () => {

		pose = new TvPosTheta();

		road = new TvRoad( '', 100, 1, -1 );

		road.addPlanView();

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

		road.addGeometryPoly( s, x, y, hdg, length, a, b, c, d );

		road.getGeometryCoords( 0, pose );
		expect( pose.x ).toBe( 0 );
		expect( pose.y ).toBe( 0 );
		expect( pose.hdg ).toBe( 0 );

		road.getGeometryCoords( 1, pose );
		expect( pose.x ).toBe( 1 );
		expect( pose.y ).toBe( 1 );
		expect( pose.hdg ).toBe( 2 );

		road.getGeometryCoords( 2, pose );
		expect( pose.x ).toBe( 2 );
		expect( pose.y ).toBe( 4 );
		expect( pose.hdg ).toBe( 4 );

		road.getGeometryCoords( 3, pose );
		expect( pose.x ).toBe( 3 );
		expect( pose.y ).toBe( 9 );
		expect( pose.hdg ).toBe( 6 );

	} );

} );
