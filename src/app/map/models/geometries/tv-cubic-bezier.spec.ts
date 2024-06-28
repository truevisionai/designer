import { Vector2 } from 'three';
import { TvCubicBezier } from "./tv-cubic-bezier";

describe( 'TvCubicBezier', () => {

	describe( 'getControlPointsFromCoefficients', () => {

		it( 'should return correct control points for given coefficients', () => {
			const coefficients = [
				new Vector2( 0, 0 ),
				new Vector2( 3, 9 ),
				new Vector2( 6, 6 ),
				new Vector2( 1, 1 )
			];

			const expectedControlPoints = [
				new Vector2( 0, 0 ),
				new Vector2( 1, 3 ),
				new Vector2( 3, 6 ),
				new Vector2( 10, 10 )
			];

			const controlPoints = TvCubicBezier.getControlPointsFromCoefficients( coefficients );
			expect( controlPoints.length ).toBe( 4 );
			controlPoints.forEach( ( point, index ) => {
				expect( point.x ).toBeCloseTo( expectedControlPoints[ index ].x, 5 );
				expect( point.y ).toBeCloseTo( expectedControlPoints[ index ].y, 5 );
			} );
		} );

	} );

	describe( 'getCoefficientsFromControlPoints', () => {

		it( 'should return correct coefficients for given control points', () => {
			const controlPoints = [
				new Vector2( 0, 0 ),
				new Vector2( 1, 3 ),
				new Vector2( 3, 6 ),
				new Vector2( 10, 10 )
			];

			const expectedCoefficients = [
				new Vector2( 0, 0 ),
				new Vector2( 3, 9 ),
				new Vector2( 6, 6 ),
				new Vector2( 1, 1 )
			];

			const coefficients = TvCubicBezier.getCoefficientsFromControlPoints( controlPoints );
			expect( coefficients.length ).toBe( 4 );
			coefficients.forEach( ( coef, index ) => {
				expect( coef.x ).toBeCloseTo( expectedCoefficients[ index ].x, 5 );
				expect( coef.y ).toBeCloseTo( expectedCoefficients[ index ].y, 5 );
			} );
		} );

	} );

	describe( 'conversion between coefficients and control points', () => {

		it( 'should correctly convert from control points to coefficients and back', () => {
			const originalControlPoints = [
				new Vector2( 0, 0 ),
				new Vector2( 1, 3 ),
				new Vector2( 3, 6 ),
				new Vector2( 10, 10 )
			];

			const coefficients = TvCubicBezier.getCoefficientsFromControlPoints( originalControlPoints );
			const controlPoints = TvCubicBezier.getControlPointsFromCoefficients( coefficients );

			expect( controlPoints.length ).toBe( 4 );
			controlPoints.forEach( ( point, index ) => {
				expect( point.x ).toBeCloseTo( originalControlPoints[ index ].x, 5 );
				expect( point.y ).toBeCloseTo( originalControlPoints[ index ].y, 5 );
			} );
		} );

	} );

} );
