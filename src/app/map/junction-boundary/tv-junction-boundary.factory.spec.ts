import { TestBed } from '@angular/core/testing';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvJunctionBoundary, TvLaneBoundary } from './tv-junction-boundary';
import { TvJunctionBoundaryFactory } from './tv-junction-boundary.factory';
import { RoadFactory } from 'app/factories/road-factory.service';

describe( 'TvJunctionBoundaryFactory', () => {

	let factory: TvJunctionBoundaryFactory;
	let roadFactory: RoadFactory;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ TvJunctionBoundaryFactory ]
		} );
		factory = TestBed.inject( TvJunctionBoundaryFactory );
		roadFactory = TestBed.inject( RoadFactory );
	} );

	it( 'should create an instance', () => {
		expect( factory ).toBeTruthy();
	} );

	describe( 'createInnerBoundary', () => {
		it( 'should create inner boundary for a simple junction', () => {
			const junction = createMockJunction();
			const boundary = TvJunctionBoundaryFactory.createInnerBoundary( junction );

			expect( boundary ).toBeTruthy();
			expect( boundary.segments.length ).toEqual( 0 );
		} );
	} );

	describe( 'createOuterBoundary', () => {
		it( 'should create outer boundary for a simple junction', () => {
			const junction = createMockJunction();
			const boundary = TvJunctionBoundaryFactory.createOuterBoundary( junction );

			expect( boundary ).toBeTruthy();
			expect( boundary.segments.length ).toEqual( 0 );
		} );
	} );

	describe( 'sortBoundarySegments', () => {
		it( 'should sort boundary segments', () => {

			const road = roadFactory.createDefaultRoad();

			const laneBoundary = new TvLaneBoundary();
			laneBoundary.road = road;
			laneBoundary.boundaryLane = road.laneSections[ 0 ].getLaneById( -1 );
			laneBoundary.sStart = 0;
			laneBoundary.sEnd = 100;


			const boundary = new TvJunctionBoundary();
			boundary.segments = [ laneBoundary ];

			TvJunctionBoundaryFactory.sortBoundarySegments( boundary );

			expect( boundary.segments.length ).toBe( 1 );
			// Add more specific expectations about the order of segments
		} );

		it( 'should handle empty boundary segments', () => {
			const boundary = new TvJunctionBoundary();
			boundary.segments = [];

			TvJunctionBoundaryFactory.sortBoundarySegments( boundary );

			expect( boundary.segments.length ).toBe( 0 );
		} );
	} );
} );

function createMockJunction (): TvJunction {
	// Create and return a mock TvJunction object
	// This would include mock roads, connections, and lane sections
	return new TvJunction( 'mock-junction', 0 );
}
