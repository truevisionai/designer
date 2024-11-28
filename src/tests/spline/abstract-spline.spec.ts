import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { JunctionFactory } from "app/factories/junction.factory";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineFactory } from "app/services/spline/spline.factory";

describe( 'AbstractSpline', () => {

	let spline: AbstractSpline;

	beforeEach( () => {

		spline = SplineFactory.createSpline();

	} );

	it( 'should be created', () => {

		expect( spline ).toBeTruthy();

	} );

	it( 'should be give correct segment start/end', () => {

		spyOn( spline, 'getLength' ).and.returnValue( 100 );

		spline.addSegment( 0, RoadFactory.createRoad() );
		spline.addSegment( 50, JunctionFactory.create() );
		spline.addSegment( 70, RoadFactory.createRoad() );

		const firstSegment = spline.getSegmentAt( 0 );
		const junctionSegment = spline.getSegmentAt( 50 );
		const lastSegment = spline.getSegmentAt( 70 );

		expect( firstSegment ).toBeInstanceOf( TvRoad );
		expect( spline.getSegmentStart( firstSegment ) ).toBe( 0 );
		expect( spline.getSegmentEnd( firstSegment ) ).toBe( 50 );

		expect( junctionSegment ).toBeInstanceOf( TvJunction );
		expect( spline.getSegmentStart( junctionSegment ) ).toBe( 50 );
		expect( spline.getSegmentEnd( junctionSegment ) ).toBe( 70 );

		expect( lastSegment ).toBeInstanceOf( TvRoad );
		expect( spline.getSegmentStart( lastSegment ) ).toBe( 70 );
		expect( spline.getSegmentEnd( lastSegment ) ).toBe( 100 );

	} )


} )
