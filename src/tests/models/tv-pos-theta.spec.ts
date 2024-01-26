import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { Maths } from "app/utils/maths";

describe( 'TvPosTheta', () => {

	it( 'should find correct angle when intersecting at 90 degree', () => {

		const pointA = new TvPosTheta( -10, -10, 0 );
		const pointB = new TvPosTheta( 10, 10, -Maths.PI2 );

		const angle1 = pointA.angleTo( pointB );
		const angle2 = pointB.angleTo( pointA );

		expect( angle1 ).toBeCloseTo( 270 * Maths.Deg2Rad );
		expect( angle2 ).toBeCloseTo( 90 * Maths.Deg2Rad );

	} );

	it( 'should find correct angle when both points are facing each other', () => {

		const pointA = new TvPosTheta( -10, -10, 0 );
		const pointB = new TvPosTheta( 10, 10, Maths.PI );

		const angle1 = pointA.angleTo( pointB );
		const angle2 = pointB.angleTo( pointA );

		expect( angle1 ).toBeCloseTo( 180 * Maths.Deg2Rad );
		expect( angle2 ).toBeCloseTo( 180 * Maths.Deg2Rad );

	} );

} );
