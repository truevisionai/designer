/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneHeight } from './lane-height.model';

function createMockLaneHeight ( sOffset: number, innerHeight: number, outerHeight: number ): TvLaneHeight {
	return new TvLaneHeight( sOffset, innerHeight, outerHeight );
}

describe( 'TvLaneHeight', () => {

	it( 'should create an instance with default values', () => {
		const laneHeight = createMockLaneHeight( 0, 0, 0 );
		expect( laneHeight.sOffset ).toBe( 0 );
		expect( laneHeight.inner ).toBe( 0 );
		expect( laneHeight.outer ).toBe( 0 );
		expect( laneHeight.uuid ).toBeDefined();
	} );

	it( 'should create an instance with given values', () => {
		const laneHeight = createMockLaneHeight( 10, 5, 15 );
		expect( laneHeight.sOffset ).toBe( 10 );
		expect( laneHeight.inner ).toBe( 5 );
		expect( laneHeight.outer ).toBe( 15 );
	} );

	it( 'should get and set sOffset', () => {
		const laneHeight = createMockLaneHeight( 0, 0, 0 );
		laneHeight.s = 20;
		expect( laneHeight.s ).toBe( 20 );
	} );

	it( 'should calculate linear value correctly', () => {
		const laneHeight = createMockLaneHeight( 0, 10, 20 );
		expect( laneHeight.getLinearValue( 0 ) ).toBe( 10 );
		expect( laneHeight.getLinearValue( 0.5 ) ).toBe( 15 );
		expect( laneHeight.getLinearValue( 1 ) ).toBe( 20 );
	} );

	it( 'should match another TvLaneHeight instance', () => {
		const laneHeight1 = createMockLaneHeight( 0, 10, 20 );
		const laneHeight2 = createMockLaneHeight( 0, 10, 20 );
		expect( laneHeight1.matches( laneHeight2 ) ).toBe( true );
	} );

	it( 'should not match another TvLaneHeight instance with different values', () => {
		const laneHeight1 = createMockLaneHeight( 0, 10, 20 );
		const laneHeight2 = createMockLaneHeight( 0, 15, 25 );
		expect( laneHeight1.matches( laneHeight2 ) ).toBe( false );
	} );

	it( 'should copy height from another TvLaneHeight instance', () => {
		const laneHeight1 = createMockLaneHeight( 0, 10, 20 );
		const laneHeight2 = createMockLaneHeight( 0, 15, 25 );
		laneHeight1.copyHeight( laneHeight2 );
		expect( laneHeight1.inner ).toBe( 15 );
		expect( laneHeight1.outer ).toBe( 25 );
	} );

	it( 'should set height correctly', () => {
		const laneHeight = createMockLaneHeight( 0, 10, 20 );
		laneHeight.setHeight( 30 );
		expect( laneHeight.inner ).toBe( 30 );
		expect( laneHeight.outer ).toBe( 30 );
	} );

	it( 'should clone correctly', () => {
		const laneHeight = createMockLaneHeight( 0, 10, 20 );
		const clone = laneHeight.clone();
		expect( clone.sOffset ).toBe( 0 );
		expect( clone.inner ).toBe( 10 );
		expect( clone.outer ).toBe( 20 );
		expect( clone.uuid ).not.toBe( laneHeight.uuid );
	} );

} );
