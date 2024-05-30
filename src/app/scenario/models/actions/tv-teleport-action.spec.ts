/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OpenScenarioLoader } from '../../services/open-scenario.loader';

describe( 'TvTeleportAction', () => {

	it( 'should import correctly', () => {

		const loader = new OpenScenarioLoader( null, null );

		const worldPosition = loader.parseWorldPosition( {
			'attr_x': 0,
			'attr_y': 0,
			'attr_z': 0,
			'attr_h': 0,
			'attr_p': 0,
			'attr_r': 1.5
		} );

		expect( worldPosition ).toBeDefined();
		expect( worldPosition.position.x ).toBe( 0 );
		expect( worldPosition.position.y ).toBe( 0 );
		expect( worldPosition.position.z ).toBe( 0 );
		// expect( Maths.approxEquals( worldPosition.rotation.h, -Maths.M_PI_2 ) ).toBe( true );
		// expect( worldPosition.rotation.p ).toBe( 0 );
		// expect( worldPosition.rotation.r ).toBe( 0 );

	} );

} );
