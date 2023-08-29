/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OpenDriverParser } from './open-drive-parser.service';


describe( 'OpenDrive Parsing', () => {

	let parser: OpenDriverParser;

	beforeEach( () => TestBed.configureTestingModule( {} ) );

	beforeEach( () => {
		parser = new OpenDriverParser();
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




} );
