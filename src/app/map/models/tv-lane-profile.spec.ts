/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneProfile } from './tv-lane-profile';
import { TvRoad } from './tv-road.model';
import { TvLaneSection } from './tv-lane-section';
import { TvLaneOffset } from './tv-lane-offset';
import { TvContactPoint } from './tv-common';

describe( 'TvLaneProfile', () => {

	let laneProfile: TvLaneProfile;
	let road: TvRoad;

	beforeEach( () => {
		road = new TvRoad( 'Road', 100, 0 );
		spyOn( road, 'getLength' ).and.returnValue( 100 );
		laneProfile = new TvLaneProfile( road );
	} );

	it( 'should create a TvLaneProfile instance', () => {
		expect( laneProfile ).toBeInstanceOf( TvLaneProfile );
	} );

	it( 'should get the road', () => {
		expect( laneProfile.getRoad() ).toBe( road );
		expect( road.getLength() ).toBe( 100 );
	} );

	it( 'should get the first lane section', () => {
		const laneSection = new TvLaneSection( 1, 0, false, road );
		laneProfile[ 'laneSections' ] = [ laneSection ];
		expect( laneProfile.getFirstLaneSection() ).toBe( laneSection );
	} );

	it( 'should get the last lane section', () => {
		const laneSection = new TvLaneSection( 1, 0, false, road );
		laneProfile[ 'laneSections' ] = [ laneSection ];
		expect( laneProfile.getLastLaneSection() ).toBe( laneSection );
	} );

	it( 'should get the lane sections', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile.addLaneSection( laneSection1 );
		laneProfile.addLaneSection( laneSection2 );
		expect( laneProfile.getLaneSections() ).toEqual( [ laneSection1, laneSection2 ] );
	} );

	it( 'should get the lane offsets', () => {
		const laneOffset1 = new TvLaneOffset( 0, 0, 0, 0, 0 );
		const laneOffset2 = new TvLaneOffset( 100, 1, 2, 3, 4 );
		laneProfile.addLaneOffset( laneOffset1 );
		laneProfile.addLaneOffset( laneOffset2 );
		expect( laneProfile.getLaneOffsets().length ).toEqual( 2 );
		expect( laneProfile.getLaneOffsets() ).toEqual( [ laneOffset1, laneOffset2 ] );
	} );

	it( 'should get the lane section by id', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile.addLaneSection( laneSection1 );
		laneProfile.addLaneSection( laneSection2 );
		expect( laneProfile.getLaneSectionById( 2 ) ).toBe( laneSection2 );
	} );

	it( 'should clear the lane sections', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile[ 'laneSections' ] = [ laneSection1, laneSection2 ];
		laneProfile.clearLaneSections();
		expect( laneProfile.getLaneSections() ).toEqual( [] );
	} );

	it( 'should add and get a lane section', () => {
		const laneSection = laneProfile.addGetLaneSection( 100, true );
		expect( laneProfile.getLaneSections() ).toContain( laneSection );
	} );

	it( 'should get the lane section at a specific s coordinate', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile[ 'laneSections' ] = [ laneSection1, laneSection2 ];
		expect( laneProfile.getLaneSectionAt( 100 ) ).toBe( laneSection2 );
	} );

	it( 'should create and add a lane offset', () => {
		const laneOffset = laneProfile.createAndAddLaneOffset( 100, 1, 2, 3, 4 );
		expect( laneProfile.getLaneOffsets() ).toContain( laneOffset );
	} );

	it( 'should update lane offset values', () => {
		laneProfile.createAndAddLaneOffset( 100, 1, 0, 0, 0 );
		laneProfile.updateLaneOffsetValues( 200 );
		// Add assertions here
		expect( laneProfile.getLaneOffsetValue( 200 ) ).toBe( 1 );
	} );

	it( 'should get the lane offset value at a specific s coordinate', () => {
		laneProfile.createAndAddLaneOffset( 100, 1, 2, 3, 4 );
		const offset = laneProfile.getLaneOffsetValue( 100 );
		expect( offset ).toBe( 1 ); // Update with the expected value
	} );

	it( 'should get the lane offset entry at a specific s coordinate', () => {
		const laneOffset = new TvLaneOffset( 100, 1, 2, 3, 4 );
		laneProfile.addLaneOffset( laneOffset );
		const result = laneProfile.getLaneOffsetEntryAt( 100 );
		expect( result ).toBe( laneOffset );
	} );

	it( 'should clear the lane profile', () => {
		const laneSection = new TvLaneSection( 1, 0, false, road );
		const laneOffset = new TvLaneOffset( 100, 1, 2, 3, 4 );
		laneProfile[ 'laneSections' ] = [ laneSection ];
		laneProfile.addLaneOffset( laneOffset );
		laneProfile.clear();
		expect( laneProfile.getLaneSections() ).toEqual( [] );
		expect( laneProfile.getLaneOffsets() ).toEqual( [] );
	} );

	it( 'should sort the lane sections and lane offsets', () => {
		const laneSection1 = new TvLaneSection( 2, 100, true, road );
		const laneSection2 = new TvLaneSection( 1, 0, false, road );
		const laneOffset1 = new TvLaneOffset( 100, 1, 2, 3, 4 );
		const laneOffset2 = new TvLaneOffset( 0, 0, 0, 0, 0 );
		laneProfile[ 'laneSections' ] = [ laneSection1, laneSection2 ];
		laneProfile.addLaneOffset( laneOffset1 );
		laneProfile.addLaneOffset( laneOffset2 );
		laneProfile.sortLaneSections();
		expect( laneProfile.getLaneSections() ).toEqual( [ laneSection2, laneSection1 ] );
		expect( laneProfile.getLaneOffsets() ).toEqual( [ laneOffset2, laneOffset1 ] );
	} );

	it( 'should get the lane section at a specific contact point', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile[ 'laneSections' ] = [ laneSection1, laneSection2 ];
		expect( laneProfile.getLaneSectionAtContact( TvContactPoint.START ) ).toBe( laneSection1 );
		expect( laneProfile.getLaneSectionAtContact( TvContactPoint.END ) ).toBe( laneSection2 );
	} );

	it( 'should remove a lane offset', () => {
		const laneOffset = new TvLaneOffset( 100, 1, 2, 3, 4 );
		laneProfile.addLaneOffset( laneOffset );
		laneProfile.removeLaneOffset( laneOffset );
		expect( laneProfile.getLaneOffsets() ).not.toContain( laneOffset );
	} );

	it( 'should get the lane offset at a specific number', () => {
		const laneOffset = new TvLaneOffset( 100, 1, 2, 3, 4 );
		laneProfile.addLaneOffset( laneOffset );
		const result = laneProfile.getLaneOffsetAt( 100 );
		expect( result ).toBe( laneOffset );
	} );

	it( 'should compute lane section coordinates', () => {
		const laneSection1 = new TvLaneSection( 1, 0, false, road );
		const laneSection2 = new TvLaneSection( 2, 100, true, road );
		laneProfile[ 'laneSections' ] = [ laneSection1, laneSection2 ];
		laneProfile.computeLaneSectionCoordinates();
		// Add assertions here
		expect( laneSection1.s ).toBe( 0 );
		expect( laneSection1.getLength() ).toBe( 100 );
		expect( laneSection1.endS ).toBe( 100 );
		expect( laneSection2.s ).toBe( 100 );
		expect( laneSection2.getLength() ).toBe( 0 );
		expect( laneSection2.endS ).toBe( 100 );
	} );


} );
