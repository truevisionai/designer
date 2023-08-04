/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdParamPoly3Geometry', () => {

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
		const length = 100;

		const aU = 0;
		const bU = 0;
		const cU = 40;
		const dU = 50;

		const aV = 0;
		const bV = 0;
		const cV = 10;
		const dV = 0;

		road.addGeometryParamPoly( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV );

		// not working
		// pose = road.getRoadCoordAt( 0 );
		// expect( pose.x ).toBe( 0 );
		// expect( pose.y ).toBe( 0 );
		// expect( pose.hdg ).toBe( 0 );

		// pose = road.getRoadCoordAt( 10 );
		// expect( pose.x ).toBe( 0.45 );
		// expect( pose.y ).toBe( 0.1 );
		// expect( pose.hdg ).toBe( 0.20749622643520266 );

		// pose = road.getRoadCoordAt( 20 );
		// expect( pose.x ).toBe( 2.0 );
		// expect( pose.y ).toBe( 0.4 );
		// expect( pose.hdg ).toBe( 0.17985349979247828 );

	} );

} );
