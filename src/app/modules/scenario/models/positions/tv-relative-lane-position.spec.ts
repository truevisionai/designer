/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OpenScenarioVersion, OrientationType } from "../tv-enums";
import { Orientation } from "../tv-orientation";
import { RelativeLanePosition } from "./tv-relative-lane-position";


describe( 'RelativeLanePosition', () => {

	let relativeLanePosition: RelativeLanePosition;

	beforeEach( () => {
		relativeLanePosition = new RelativeLanePosition( 'entityRef', null, null, null, null, null );
	} );

	it( 'export XML for 1.2 correctly', () => {

		relativeLanePosition = new RelativeLanePosition( 'entityRef', 0, 1, -1, -2 );

		const xml = relativeLanePosition.toXML( OpenScenarioVersion.v1_2 );

		expect( xml.attr_entityRef ).toBe( 'entityRef' );
		expect( xml.attr_dLane ).toBe( 0 );
		expect( xml.attr_ds ).toBe( 1 );
		expect( xml.attr_offset ).toBe( -1 );
		expect( xml.attr_dsLane ).toBe( -2 );
		expect( xml.Orientation ).toBeDefined();


	} );

	it( 'import XML for 1.2 correctly', () => {

		relativeLanePosition = new RelativeLanePosition( 'entityRef', 0, 1, -1, -2, new Orientation( 1, 2, 3 ) );

		const imported = RelativeLanePosition.fromXML( relativeLanePosition.toXML() );

		expect( imported.entityRef ).toBe( 'entityRef' );
		expect( imported.dLane ).toBe( 0 );
		expect( imported.ds ).toBe( 1 );
		expect( imported.offset ).toBe( -1 );
		expect( imported.dsLane ).toBe( -2 );
		expect( imported.orientation ).toBeDefined();
		expect( imported.orientation.h ).toBe( 1 );
		expect( imported.orientation.p ).toBe( 2 );
		expect( imported.orientation.r ).toBe( 3 );
		expect( imported.orientation.type ).toBe( OrientationType.absolute );


	} );


} );
