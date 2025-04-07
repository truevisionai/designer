import { AbstractSpline, NewSegment } from "app/core/shapes/abstract-spline";
import { TvRoad } from "app/map/models/tv-road.model";

export function expectSegments ( spline: AbstractSpline, segments: NewSegment[] ) {

	const values = spline.getSegments();

	const keys = spline.getSegmentKeys();

	expect( values.length ).toBe( segments.length );

	for ( let i = 0; i < segments.length; i++ ) {

		expect( values[ i ] ).toBe( segments[ i ] );

		if ( values[ i ] instanceof TvRoad ) {

			const road = values[ i ] as TvRoad;

			expect( road.sStart ).toBe( keys[ i ] );

		}

	}

}

export function expectInstances ( spline: AbstractSpline, types: any[] ) {

	const values = spline.getSegments();

	expect( values.length ).toBe( types.length );

	for ( let i = 0; i < types.length; i++ ) {

		expect( values[ i ] ).toBeInstanceOf( types[ i ] );

	}

}

export function expectInstancesOf ( values: any[], types: any[] ) {

	expect( values.length ).toBe( types.length );

	for ( let i = 0; i < types.length; i++ ) {

		expect( values[ i ] ).toBeInstanceOf( types[ i ] );

	}

}
