import { Vector3 } from "three";
import { ParkingCurve } from "./parking-curve";
import { ParkingCurvePoint } from "../../modules/parking-spot/services/parking-spot-creation-strategy";
import { Maths } from "app/utils/maths";
import { ParkingGraph } from "./parking-graph";

function createStraightParkingCurve (): ParkingCurve {

	const parkingCurve = new ParkingCurve();

	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 0, 0, 0 ) ) );
	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 5, 0, 0 ) ) );

	return parkingCurve;

}

fdescribe( 'ParkingCurve', () => {

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


fdescribe( 'ParkingGraph', () => {

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
