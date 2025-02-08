import { Vector3 } from "app/core/maths";

import { ParkingGraph } from "./parking-graph";

fdescribe( 'ParkingGraph', () => {

	let parkingGraph: ParkingGraph;

	beforeEach( () => {

		parkingGraph = new ParkingGraph();

		parkingGraph.createParkingCurve( [ new Vector3( 0, 0 ), new Vector3( 100, 0 ) ] );

	} );

	it( 'should create parking graph', () => {


	} );

	it( 'should create parking curve', () => {



	} );

	it( 'should create parking spots', () => {

		// const parkingSpots = parkingGraph.getActualSpots();

		// expect( parkingSpots.length ).toBe( 80 );

		// expect( parkingSpots[ 0 ].heading ).toBeCloseTo( -Maths.PI2 );

		// expect( parkingSpots[ parkingSpots.length - 1 ].heading ).toBeCloseTo( Maths.PI2 );

	} );


} );
