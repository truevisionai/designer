/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OpenDrive14Parser } from './open-drive-1-4.parser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OpenDriveParserService } from "./open-drive-parser.service";

describe( 'OpenDrive Parsing', () => {

	let parserService: OpenDriveParserService;
	let parser: OpenDrive14Parser;
	let httpClient: HttpClient;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ OpenDrive14Parser, OpenDriveParserService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		parser = TestBed.inject( OpenDrive14Parser );
		httpClient = TestBed.inject( HttpClient );
		parserService = TestBed.inject( OpenDriveParserService );

	} );

	it( 'should parse header correctly', () => {

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

		expect( header.attr_revMajor ).toBe( 1 );
		expect( header.attr_revMinor ).toBe( 4 );
		expect( header.attr_name ).toBe( headerXml.attr_name );
		expect( header.attr_version ).toBe( 1 );
		expect( header.attr_date ).toBe( headerXml.attr_date );
		expect( header.attr_north ).toBe( 1 );
		expect( header.attr_south ).toBe( 1 );
		expect( header.attr_east ).toBe( 1 );
		expect( header.attr_west ).toBe( 1 );
		expect( header.attr_vendor ).toBe( headerXml.attr_vendor );

	} );

	it( 'should parse road correctly', () => {

		httpClient.get( "assets/open-drive/straight-road.xml", { responseType: 'text' } ).subscribe( xml => {

			const map = parserService.parse( xml );

			const road = map.roads.get( 1 );

			expect( road ).toBeDefined();

			expect( road.length ).toBe( 100 );
			expect( road.spline.getLength() ).toBe( 100 );
			expect( road.id ).toBe( 1 );
			expect( road.isJunction ).toBe( false );
			expect( road.spline.controlPoints.length ).toBe( 2 );

			expect( road.spline.controlPoints[ 0 ].position.x ).toBe( 0 );
			expect( road.spline.controlPoints[ 0 ].position.y ).toBe( 0 );
			expect( road.spline.controlPoints[ 0 ].position.z ).toBe( 0 );

			expect( road.spline.controlPoints[ 1 ].position.x ).toBeCloseTo( 0 );
			expect( road.spline.controlPoints[ 1 ].position.y ).toBe( 100 );
			expect( road.spline.controlPoints[ 1 ].position.z ).toBe( 0 );

		} );

	} )

} );
