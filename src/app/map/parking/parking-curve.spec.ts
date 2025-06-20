/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from "three";
import { ParkingCurve } from "./parking-curve";
import { Maths } from "app/utils/maths";
import { ParkingGraph } from "./parking-graph";
import { ParkingCurvePoint } from "../../modules/parking-spot/objects/parking-curve-point";

function createStraightParkingCurve (): ParkingCurve {

	const parkingCurve = new ParkingCurve();

	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 0, 0, 0 ) ) );
	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 5, 0, 0 ) ) );

	return parkingCurve;

}

describe( 'ParkingCurve', () => {

	let parkingCurve: ParkingCurve;

	beforeEach( () => {

		parkingCurve = createStraightParkingCurve();

	} );

	it( 'should create parking curve', () => {

		expect( parkingCurve.getSpline().getLength() ).toBeCloseTo( 5 );

	} );

	it( 'should create parking curve', () => {

		const regions = parkingCurve.generatePreviewRegions();

		expect( regions.length ).toBe( 4 );

		// expect( regions[ 0 ].x ).toBeCloseTo( 1.25 );
		// expect( regions[ 0 ].hdg ).toBeCloseTo( 0 );

		// expect( regions[ regions.length - 1 ].x ).toBeCloseTo( 98.75 );
		// expect( regions[ regions.length - 1 ].hdg ).toBeCloseTo( 0 );

	} );

	it( 'should create parking spots', () => {

		const regions = parkingCurve.generatePreviewRegions();

		expect( regions.length ).toBe( 4 );

		// expect( regions[ 0 ].heading ).toBeCloseTo( -Maths.PI2 );

		// expect( regions[ regions.length - 1 ].heading ).toBeCloseTo( Maths.PI2 );

	} );


} );


describe( 'ParkingGraph', () => {

	let parkingCurve: ParkingCurve;
	let parkingGraph: ParkingGraph;

	beforeEach( () => {

		parkingGraph = new ParkingGraph();
		parkingCurve = parkingGraph.createParkingCurve( [ new Vector3( 0, 0 ), new Vector3( 5, 0 ) ] );

		parkingGraph.bakeCurve( parkingCurve );

	} );

	it( 'should have correct node count', () => {

		expect( parkingGraph.getNodeCount() ).toBe( 9 );
		expect( parkingGraph.getParkingCurveCount() ).toBe( 0 );

	} );

	it( 'should have correct edge count', () => {

		expect( parkingGraph.getEdgeCount() ).toBe( 12 );
		expect( parkingGraph.getParkingCurveCount() ).toBe( 0 );

	} );

	it( 'should have correct region count', () => {

		expect( parkingGraph.getParkingCurveCount() ).toBe( 0 );
		expect( parkingGraph.getRegionCount() ).toBe( 4 );

		parkingGraph.getRegions().forEach( region => {
			expect( region.getEdgeCount() ).toBe( 4 )
		} );

	} );

} );



describe( 'ParkingGraph Import/Export', () => {

	let parkingCurve: ParkingCurve;
	let parkingGraph: ParkingGraph;

	beforeEach( () => {

		parkingGraph = new ParkingGraph();
		parkingCurve = parkingGraph.createParkingCurve( [ new Vector3( 0, 0 ), new Vector3( 5, 0 ) ] );

		parkingGraph.bakeCurve( parkingCurve );

	} );

	it( 'should export parking node', () => {

		const json = parkingGraph.toSceneJSON();

		expect( json.node.length ).toBe( 9 );
		expect( json.edge.length ).toBe( 12 );
		expect( json.region.length ).toBe( 4 );
		expect( json.parkingCurve.length ).toBe( 0 );

	} );

	it( 'should export parking edge', () => {

		const edge = parkingGraph.getEdges()[ 0 ];

		const json = edge.toSceneJSON();

		expect( json ).toEqual( {
			attr_id: edge.id,
			attr_startNodeId: edge.getStartNode().id,
			attr_endNodeId: edge.getEndNode().id,
			attr_markingGuid: edge.getMarkingGuid()
		} );

	} );

	it( 'should export parking curve', () => {

		//

	} );

} );
