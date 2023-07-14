/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OpenScenarioVersion, OrientationType } from "../tv-enums";
import { Orientation } from "../tv-orientation";
import { RelativeWorldPosition } from "./tv-relative-world-position";

describe( 'TvRelativeWorldPosition', () => {

	it( 'export XML for 1.2 correctly', () => {

		let position = new RelativeWorldPosition( 'entityRef', 0, 1, -1 );

		const xml = position.toXML( OpenScenarioVersion.v1_2 );

		expect( xml.attr_entityRef ).toBe( 'entityRef' );
		expect( xml.attr_dx ).toBe( 0 );
		expect( xml.attr_dy ).toBe( 1 );
		expect( xml.attr_dz ).toBe( -1 );
		expect( xml.Orientation ).toBeDefined();


	} );

	it( 'import XML for 1.2 correctly', () => {

		let xml = ( new RelativeWorldPosition( 'entityRef', 0, 1, -1, new Orientation( 1, 2, 3 ) ) ).toXML();

		const imported = RelativeWorldPosition.fromXML( xml ) as RelativeWorldPosition;

		expect( imported.entityRef ).toBe( 'entityRef' );
		expect( imported.dx ).toBe( 0 );
		expect( imported.dy ).toBe( 1 );
		expect( imported.dz ).toBe( -1 );
		expect( imported.orientation ).toBeDefined();
		expect( imported.orientation.h ).toBe( 1 );
		expect( imported.orientation.p ).toBe( 2 );
		expect( imported.orientation.r ).toBe( 3 );
		expect( imported.orientation.type ).toBe( OrientationType.absolute );


	} );


} );
