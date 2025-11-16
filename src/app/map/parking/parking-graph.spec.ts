/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "app/core/maths";

import { ParkingGraph } from "./parking-graph";
import { ParkingCurve } from "./parking-curve";

describe( 'ParkingGraph', () => {

	let parkingGraph: ParkingGraph;
	let parkingCurve: ParkingCurve;

	beforeEach( () => {

		parkingGraph = new ParkingGraph();

		parkingCurve = parkingGraph.createParkingCurve( [ new Vector3( 0, 0 ), new Vector3( 100, 0 ) ] );

	} );

	it( 'should create parking graph', () => {

		expect( parkingGraph.getParkingCurveCount() ).toBe( 1 );
		expect( parkingGraph.getNodeCount() ).toBe( 0 );
		expect( parkingGraph.getEdgeCount() ).toBe( 0 );
		expect( parkingGraph.getRegionCount() ).toBe( 0 );

	} );

	it( 'should create parking curve', () => {

		const curves = parkingGraph.getParkingCurves();

		expect( curves.length ).toBe( 1 );

		const points = curves[ 0 ].getControlPoints();

		expect( points.length ).toBe( 2 );

		const start = points[ 0 ].getPosition();
		const end = points[ 1 ].getPosition();

		expect( start.x ).toBeCloseTo( 0 );
		expect( start.y ).toBeCloseTo( 0 );
		expect( end.x ).toBeCloseTo( 100 );
		expect( end.y ).toBeCloseTo( 0 );
	} );

	it( 'should create parking spots', () => {

		const bakedRegions = parkingGraph.bakeCurve( parkingCurve );

		expect( parkingGraph.getParkingCurveCount() ).toBe( 0 );
		expect( parkingGraph.getRegionCount() ).toBe( bakedRegions.length );
		expect( parkingGraph.getRegionCount() ).toBeGreaterThan( 0 );
		expect( parkingGraph.getNodeCount() ).toBeGreaterThan( 0 );
		expect( parkingGraph.getEdgeCount() ).toBeGreaterThan( 0 );

		const previewRegions = parkingCurve.generatePreviewRegions();

		expect( previewRegions.length ).toBe( 80 );

		previewRegions.forEach( region => expect( region.getEdgeCount() ).toBe( 4 ) );

	} );


} );
