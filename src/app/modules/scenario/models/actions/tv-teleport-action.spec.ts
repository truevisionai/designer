import { Maths } from "app/utils/maths";
import { OpenScenarioLoader } from "../../services/open-scenario.loader"

describe( 'TvTeleportAction', () => {

	it( 'should import correctly', () => {

		const loader = new OpenScenarioLoader( null );

		const worldPosition = loader.parseWorldPosition( {
			"attr_x": 0,
			"attr_y": 0,
			"attr_z": 0,
			"attr_h": 0,
			"attr_p": 0,
			"attr_r": 1.5
		} )

		expect( worldPosition ).toBeDefined();
		expect( worldPosition.x ).toBe( 0 );
		expect( worldPosition.y ).toBe( 0 );
		expect( worldPosition.z ).toBe( 0 );
		expect( Maths.approxEquals( worldPosition.h, -Maths.M_PI_2 ) ).toBe( true );
		expect( worldPosition.p ).toBe( 0 );
		expect( worldPosition.r ).toBe( 0 );

	} )

} )
