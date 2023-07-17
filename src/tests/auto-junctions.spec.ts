import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { OpenDriverParser } from 'app/modules/tv-map/services/open-drive-parser.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { JunctionFactory } from '../app/core/factories/junction.factory';
import { TvContactPoint } from '../app/modules/tv-map/models/tv-common';
import * as XML from './stubs/3-way-intersection-auto-stub';

describe( 't-intersection auto maneuver logic tests', () => {

	let parser: OpenDriverParser;
	let map: TvMap;

	beforeEach( () => {

		parser = new OpenDriverParser();
		map = TvMapInstance.map = parser.parse( XML.XML );

	} );

	it( 'should have correct logic for last driving lane', () => {

		// // left-right
		// JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ).forEach( entry => {
		// 	expect( entry.isLastDrivingLane ).toBe( true );
		// } );

		JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 2 ), TvContactPoint.END ).forEach( ( entry, i, entries ) => {
			expect( entry.isLastDrivingLane() ).toBe( true );
			expect( entries.length ).toBe( 2 );
		} );

		JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ).forEach( ( entry, i, entries ) => {
			expect( entry.isLastDrivingLane() ).toBe( true );
			expect( entries.length ).toBe( 2 );
		} );


	} );

	it( 'should have predecessor/successor logic', () => {

		const entries = [];

		// left-right
		entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ) );
		expect( entries.length ).toBe( 3 );

		// left-right
		entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 2 ), TvContactPoint.END ) );
		expect( entries.length ).toBe( 5 );

		// top-bottom
		entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ) );
		expect( entries.length ).toBe( 7 );

		JunctionFactory.mergeEntries( entries );

		expect( map.junctions.size ).toBe( 1 );

		const junction = map.junctions.get( 1 );

		expect( junction.connections.size ).toBe( 6 );

		expect( junction.getJunctionConnection( 1 ) ).toBeDefined();
		expect( junction.getJunctionConnection( 2 ) ).toBeDefined();

		expect( junction.getJunctionConnection( 1 ).laneLink.length ).toBe( 1 );
		expect( junction.getJunctionConnection( 2 ).laneLink.length ).toBe( 1 );

		expect( junction.getJunctionConnection( 1 ).laneLink[ 0 ].incomingLane.id ).toBe( -1 );
		expect( junction.getJunctionConnection( 2 ).laneLink[ 0 ].incomingLane.id ).toBe( -1 );


	} );

} );
