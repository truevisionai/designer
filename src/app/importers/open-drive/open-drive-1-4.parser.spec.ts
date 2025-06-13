/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OpenDrive14Parser } from './open-drive-1-4.parser';
import { SplineTestHelper, STRAIGHT_XODR } from 'app/services/spline/spline-test-helper.service';
import { setupTest } from "../../../tests/setup-tests";

describe( 'OpenDrive Parsing', () => {

	let parser: OpenDrive14Parser;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		parser = new OpenDrive14Parser( null );
		testHelper = TestBed.inject( SplineTestHelper );

	} );

	xit( 'should parse header correctly', () => {

		const headerXml = {
			attr_revMajor: '1',
			attr_revMinor: '4',
			attr_name: 'himanshu',
			attr_version: '1',
			attr_date: 'Date',
			attr_north: '1.0000000000000000e+00',
			attr_south: '1.0000000000000000e+00',
			attr_east: '1.0000000000000000e+00',
			attr_west: '1.0000000000000000e+00',
			attr_vendor: 'Truevision.ai',
		};

		const header = parser.parseHeader( headerXml );

		expect( header.revMajor ).toBe( 1 );
		expect( header.revMinor ).toBe( 4 );
		expect( header.name ).toBe( headerXml.attr_name );
		expect( header.version ).toBe( 1 );
		expect( header.date ).toBe( headerXml.attr_date );
		expect( header.north ).toBe( 1 );
		expect( header.south ).toBe( 1 );
		expect( header.east ).toBe( 1 );
		expect( header.west ).toBe( 1 );
		expect( header.vendor ).toBe( headerXml.attr_vendor );

	} );

	it( 'should parse road correctly', async () => {

		const contents = await testHelper.loadXodr( STRAIGHT_XODR ).toPromise();

		const map = testHelper.openDriveParser.parse( contents );

		const road = map.getRoad( 1 );

		expect( road ).toBeDefined();

		expect( road.length ).toBe( 100 );
		expect( road.spline.getLength() ).toBe( 100 );
		expect( road.id ).toBe( 1 );
		expect( road.isJunction ).toBe( false );
		expect( road.spline.getControlPointCount() ).toBe( 2 );

		expect( road.spline.getControlPoints()[ 0 ].position.x ).toBe( 0 );
		expect( road.spline.getControlPoints()[ 0 ].position.y ).toBe( 0 );		//
		expect( road.spline.getControlPoints()[ 0 ].position.z ).toBe( 0 );

		expect( road.spline.getControlPoints()[ 1 ].position.x ).toBeCloseTo( 0 );
		expect( road.spline.getControlPoints()[ 1 ].position.y ).toBe( 100 );	//
		expect( road.spline.getControlPoints()[ 1 ].position.z ).toBe( 0 );

	} );

	it( 'should parse orientation string to TvOrientation', () => {
		expect( parser.parseOrientation( '+' ) ).toBeDefined();
		expect( parser.parseOrientation( '-' ) ).toBeDefined();
		expect( parser.parseOrientation( 'none' ) ).toBeDefined();
		expect( parser.parseOrientation( 'unknown' ) ).toBeDefined();
	} );

	it( 'should parse element type string to TvLinkType', () => {
		expect( parser.parseElementType( 'road' ) ).toBeDefined();
		expect( parser.parseElementType( 'junction' ) ).toBeDefined();
		expect( parser.parseElementType( 'other' ) ).toBeNull();
	} );

	it( 'should parse contact point string to TvContactPoint', () => {
		expect( parser.parseContactPoint( 'start' ) ).toBeDefined();
		expect( parser.parseContactPoint( 'end' ) ).toBeDefined();
		expect( parser.parseContactPoint( 'other' ) ).toBeNull();
	} );

	it( 'should parse lane offset correctly', () => {
		const xml = { attr_s: '1', attr_a: '2', attr_b: '3', attr_c: '4', attr_d: '5' };
		const offset = parser.parseLaneOffset( xml );
		expect( offset.s ).toBe( 1 );
		expect( offset.a ).toBe( 2 );
		expect( offset.b ).toBe( 3 );
		expect( offset.c ).toBe( 4 );
		expect( offset.d ).toBe( 5 );
	} );

	it( 'should parse user data array', () => {
		const xml = {
			userData: [
				{ attr_code: 'foo', attr_value: 'bar' },
				{ attr_code: 'baz', attr_value: 'qux' }
			]
		};
		const result = parser.parseUserData( xml as any );
		expect( result.length ).toBe( 2 );
		expect( result[ 0 ].code ).toBe( 'foo' );
		expect( result[ 0 ].value ).toBe( 'bar' );
		expect( result[ 1 ].code ).toBe( 'baz' );
		expect( result[ 1 ].value ).toBe( 'qux' );
	} );

	it( 'should parse lane width and add width record', () => {
		const xml = { attr_sOffset: '1', attr_a: '2', attr_b: '3', attr_c: '4', attr_d: '5' };
		const width = parser.parseLaneWidth( xml as any );
		expect( width.s ).toBe( 1 );
		expect( width.a ).toBe( 2 );
		expect( width.b ).toBe( 3 );
		expect( width.c ).toBe( 4 );
		expect( width.d ).toBe( 5 );
	} );

	it( 'should parse lane material and add material record', () => {
		const lane = { addMaterialRecord: jasmine.createSpy() };
		const xml = { attr_sOffset: '1', attr_surface: 'asphalt', attr_friction: '0.8', attr_roughness: '0.1' };
		parser.parseLaneMaterial( lane as any, xml as any );
		expect( lane.addMaterialRecord ).toHaveBeenCalledWith( 1, 'asphalt', 0.8, 0.1 );
	} );

	it( 'should parse lane visibility and add visibility record', () => {
		const lane = { addVisibilityRecord: jasmine.createSpy() };
		const xml = { attr_sOffset: '1', attr_forward: '100', attr_back: '100', attr_left: '50', attr_right: '50' };
		parser.parseLaneVisibility( lane as any, xml as any );
		expect( lane.addVisibilityRecord ).toHaveBeenCalledWith( 1, 100, 100, 50, 50 );
	} );

	it( 'should parse lane speed and add speed record', () => {
		const lane = { addSpeedRecord: jasmine.createSpy() };
		const xml = { attr_sOffset: '1', attr_max: '60', attr_unit: 'km/h' };
		parser.parseLaneSpeed( lane as any, xml as any );
		expect( lane.addSpeedRecord ).toHaveBeenCalledWith( 1, 60, 'km/h' );
	} );

	it( 'should parse lane access and add access record', () => {
		const lane = { addAccessRecord: jasmine.createSpy() };
		const xml = { attr_sOffset: '1', attr_restriction: 'no_cars' };
		parser.parseLaneAccess( lane as any, xml as any );
		expect( lane.addAccessRecord ).toHaveBeenCalledWith( 1, 'no_cars' );
	} );

	it( 'should parse lane height and add height record', () => {
		const lane = { addHeightRecord: jasmine.createSpy() };
		const xml = { attr_sOffset: '1', attr_inner: '0.0', attr_outer: '0.2' };
		parser.parseLaneHeight( lane as any, xml as any );
		expect( lane.addHeightRecord ).toHaveBeenCalledWith( 1, 0.0, 0.2 );
	} );


} );
