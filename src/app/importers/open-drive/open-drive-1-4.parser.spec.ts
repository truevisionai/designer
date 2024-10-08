/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OpenDrive14Parser } from './open-drive-1-4.parser';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OpenDriveParserService } from "./open-drive-parser.service";
import { FRENCH_SMALL_XODR, OSM2_XODR, SplineTestHelper, STRAIGHT_XODR } from 'app/services/spline/spline-test-helper.service';

describe( 'OpenDrive Parsing', () => {

	let parser: OpenDrive14Parser;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ OpenDrive14Parser, OpenDriveParserService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		parser = TestBed.inject( OpenDrive14Parser );
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

		const road = map.getRoadById( 1 );

		expect( road ).toBeDefined();

		expect( road.length ).toBe( 100 );
		expect( road.spline.getLength() ).toBe( 100 );
		expect( road.id ).toBe( 1 );
		expect( road.isJunction ).toBe( false );
		expect( road.spline.controlPoints.length ).toBe( 2 );

		expect( road.spline.controlPoints[ 0 ].position.x ).toBe( 0 );
		expect( road.spline.controlPoints[ 0 ].position.y ).toBe( 0 );		//
		expect( road.spline.controlPoints[ 0 ].position.z ).toBe( 0 );

		expect( road.spline.controlPoints[ 1 ].position.x ).toBeCloseTo( 0 );
		expect( road.spline.controlPoints[ 1 ].position.y ).toBe( 100 );	//
		expect( road.spline.controlPoints[ 1 ].position.z ).toBe( 0 );

	} );




} );
