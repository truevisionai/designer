/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { ROUNDABOUT_XODR, SplineTestHelper, } from 'app/services/spline/spline-test-helper.service';
import { setupTest } from 'tests/setup-tests';
import { TvContactPoint } from "../tv-common";


describe( 'TvJunction', () => {

	let testHelper: SplineTestHelper;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );

	} );

	describe( 'Roundabout', () => {

		it( 'should give correct road links for junction=43', async () => {

			const map = await testHelper.loadAndParseXodr( ROUNDABOUT_XODR );

			const junction = map.getJunction( 43 );

			// 108, 115, 113
			// END START START
			expect( junction.getIncomingRoadCount() ).toBe( 3 );
			expect( junction.getRoadLinks().length ).toBe( 3 );
			expect( junction.getRoadLinks().map( i => i.id ) ).toEqual( [
				108, 115, 113
			] );
			expect( junction.getRoadLinks().map( i => i.contact ) ).toEqual( [
				TvContactPoint.END, TvContactPoint.START, TvContactPoint.START,
			] );

			// 111, 109, 110
			expect( junction.getConnectionCount() ).toBe( 3 );
			expect( junction.getLaneLinkCount() ).toBe( 10 );

		} );

		it( 'should give correct road links for junction=46', async () => {

			const map = await testHelper.loadAndParseXodr( ROUNDABOUT_XODR );

			const junction = map.getJunction( 46 );

			// NOTE: this is not working because bounding box position is incorrect
			// bounding box is set to 0,0,0 and not calculated correctly

			expect( junction.getIncomingRoadCount() ).toBe( 3 );
			expect( junction.getRoadLinks().length ).toBe( 3 );
			expect( junction.getRoadLinks().map( i => i.id ) ).toEqual( [
				113, 114, 119,
			] );
			junction.updatePositionAndBounds();
			expect( junction.getRoadLinks().map( i => i.contact ) ).toEqual( [
				TvContactPoint.END,
				TvContactPoint.START,
				TvContactPoint.START,
			] );

			expect( junction.getConnectionCount() ).toBe( 3 );
			expect( junction.getLaneLinkCount() ).toBe( 10 );

		} );

	} )

} );
