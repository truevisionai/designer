/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvPlaneView } from "./tv-plane-view";

describe( 'Planeview tests', () => {

	let planView: TvPlaneView;

	beforeEach( () => {

		planView = new TvPlaneView();

		// laneSection = new TvLaneSection( 1, 0, true, null );

		// laneSection.addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, false, true );
		// rightFour = laneSection.getLastAddedLane();

		// laneSection.getLaneArray().forEach( lane => {

		// 	if ( lane.side !== TvLaneSide.CENTER ) {

		// 		lane.addWidthRecord( 0, 2, 0, 0, 0 );

		// 	}

		// } );

	} );

	it( 'should clone correctly', () => {

		planView.addGeometryLine( 0, 0, 0, 0, 10 );
		planView.addGeometryLine( 10, 10, 0, 0, 10 );
		planView.addGeometryLine( 20, 20, 0, 0, 10 );

		const cloned = planView.clone();

		expect( cloned.geometries.length ).toBe( 3 );


	} )

	it( 'should cut planview correctly', () => {

		planView.addGeometryLine( 0, 0, 0, 0, 10 );
		planView.addGeometryLine( 10, 10, 0, 0, 10 );
		planView.addGeometryLine( 20, 20, 0, 0, 10 );

		let planView1: TvPlaneView, planView2: TvPlaneView;

		[ planView1, planView2 ] = planView.cut( 15 );

		expect( planView1.geometries.length ).toBe( 2 );
		expect( planView2.geometries.length ).toBe( 2 );

		expect( planView1.getBlockLength() ).toBe( 15 );
		expect( planView2.getBlockLength() ).toBe( 15 );

	} )

	it( 'should cut planview correctly', () => {

		planView.addGeometryLine( 0, 0, 0, 0, 10 );
		planView.addGeometryLine( 10, 10, 0, 0, 10 );
		planView.addGeometryLine( 20, 20, 0, 0, 10 );

		let planView1: TvPlaneView, planView2: TvPlaneView;

		[ planView1, planView2 ] = planView.cut( 25 );

		expect( planView1.geometries.length ).toBe( 3 );
		expect( planView2.geometries.length ).toBe( 1 );

		expect( planView1.getBlockLength() ).toBe( 25 );
		expect( planView2.getBlockLength() ).toBe( 5 );

	} )


} );
