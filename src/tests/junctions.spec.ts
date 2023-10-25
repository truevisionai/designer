import { JunctionFactory } from 'app/factories/junction.factory';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { OpenDriverParser } from 'app/modules/tv-map/services/open-drive-parser.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { JunctionEntryObject } from '../app/modules/three-js/objects/junction-entry.object';
import * as CROSSING8 from './stubs/crossing-8-road-stub';

describe( 'Crossing 8 XODR Tests', () => {

	let parser: OpenDriverParser;
	let map: TvMap;

	beforeEach( () => {

		parser = new OpenDriverParser();
		map = TvMapInstance.map = parser.parse( CROSSING8.XML );

	} );

	it( 'correct hasRoadConnection logic', () => {

		expect( map.junctions ).toBeDefined();
		expect( map.junctions.size ).toBe( 1 );

		const incoming = map.roads.get( 502 ); // predecessor
		const connecting = map.roads.get( 500 );
		const outgoing = map.roads.get( 514 ); // successor

		const junction = map.junctions.get( 2 );

		expect( junction ).toBeDefined();
		expect( junction.connections.size ).toBe( 12 );

		expect( junction.hasRoadConnection( incoming, outgoing ) ).toBeTrue();
		expect( junction.hasRoadConnection( incoming, connecting ) ).toBeFalse();
		expect( junction.hasRoadConnection( outgoing, connecting ) ).toBeFalse();

		expect( junction.hasRoadConnection( connecting, incoming ) ).toBeFalse();
		expect( junction.hasRoadConnection( connecting, outgoing ) ).toBeFalse();

	} );

	it( 'should have predecessor/successor logic', () => {

		const pre = map.roads.get( 502 ); // predecessor
		const connecting = map.roads.get( 500 );
		const succ = map.roads.get( 514 ); // successor

		expect( connecting.predecessor.elementId ).toBe( pre.id );
		expect( connecting.successor.elementId ).toBe( succ.id );

	} );

	it( 'should create correct junction objects', () => {

		const entries = JunctionFactory.createJunctionEntries( map.getRoads() );

		const start = entries.filter( entry => entry.road.id === 502 && entry.contact === 'start' )[ 0 ];
		const end = entries.filter( entry => entry.road.id === 502 && entry.contact === 'end' )[ 0 ];

		expect( start ).toBeDefined();
		expect( end ).toBeUndefined();


	} );

	it( 'should remove lane link correctly', () => {

		const entries = JunctionFactory.createJunctionEntries( map.getRoads() );

		const start: JunctionEntryObject = entries.filter( entry => entry.road.id === 502 && entry.contact === 'start' )[ 0 ];

		expect( start ).toBeDefined();

		// 3 connections
		// 0 - 3 links
		// 1 - 1 link
		// 2 - 1 link
		expect( start.connections.length ).toBe( 3 );

		const connection = start.connections[ 0 ];
		const laneLink = connection.laneLink[ 0 ];

		expect( connection.laneLink.length ).toBe( 3 );
		expect( laneLink.connectingLane.laneSection.lanes.size ).toBe( 5 );

		connection.removeLaneLink( laneLink );

		expect( connection.laneLink.length ).toBe( 2 );

		expect( laneLink.connectingLane.laneSection.lanes.size ).toBe( 4 );

	} );

} );
