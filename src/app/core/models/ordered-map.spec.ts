/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { OrderedMap } from "./ordered-map";
import { TvLaneBorder } from "../../map/models/tv-lane-border";

describe( 'OrderedMap test', () => {

	let map: OrderedMap<TvLaneBorder>

	beforeEach( () => TestBed.configureTestingModule( {} ) );

	beforeEach( () => {

		map = new OrderedMap<TvLaneBorder>();

		map.set( 0, new TvLaneBorder( 1, 0, 0, 0, 0 ) );
		map.set( 50, new TvLaneBorder( 50, 0, 0, 0, 0 ) );
		map.set( 100, new TvLaneBorder( 100, 0, 0, 0, 0 ) );

	} );

	it( 'should give correct positions', () => {

		expect( map.findAt( 0 ).s ).toBe( 1 );
		expect( map.findAt( 10 ).s ).toBe( 1 );
		expect( map.findAt( 40 ).s ).toBe( 1 );

	} );


} );
