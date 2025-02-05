import { Vector3 } from "three";
import { ParkingCurve } from "./parking-curve";
import { ParkingCurvePoint } from "./parking-spot-creation-strategy";
import { Maths } from "app/utils/maths";

function createStraightParkingCurve (): ParkingCurve {

	const parkingCurve = new ParkingCurve();

	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 0, 0, 0 ) ) );
	parkingCurve.addPoint( new ParkingCurvePoint( parkingCurve, new Vector3( 100, 0, 0 ) ) );

	return parkingCurve;

}

fdescribe( 'ParkingCurve', () => {

	let parkingCurve: ParkingCurve;

	beforeEach( () => {

		parkingCurve = createStraightParkingCurve();

	} );

	it( 'should create parking curve', () => {

		expect( parkingCurve.getSpline().getLength() ).toBeCloseTo( 100 );

	} );

	it( 'should create parking curve', () => {

		const positions = parkingCurve.getPotentialSpots();

		expect( positions.length ).toBe( 40 );

		expect( positions[ 0 ].x ).toBeCloseTo( 1.25 );
		expect( positions[ 0 ].hdg ).toBeCloseTo( 0 );

		expect( positions[ positions.length - 1 ].x ).toBeCloseTo( 98.75 );
		expect( positions[ positions.length - 1 ].hdg ).toBeCloseTo( 0 );

	} );

	it( 'should create parking spots', () => {

		const parkingSpots = parkingCurve.getActualSpots();

		expect( parkingSpots.length ).toBe( 80 );

		expect( parkingSpots[ 0 ].heading ).toBeCloseTo( -Maths.PI2 );

		expect( parkingSpots[ parkingSpots.length - 1 ].heading ).toBeCloseTo( Maths.PI2 );

	} );


} );
