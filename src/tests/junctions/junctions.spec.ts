// import { JunctionFactory } from 'app/factories/junction.factory';
// import { TvMap } from 'app/modules/tv-models/models/tv-models.model';
// import { OpenDrive14Parser } from 'app/importers/open-drive/open-drive-1-4.parser';
// import { TvMapInstance } from 'app/modules/tv-models/services/tv-models-instance';
// import { JunctionEntryObject } from '../app/modules/three-js/objects/junction-entry.object';
// import * as CROSSING8 from './stubs/crossing-8-road-stub';

// describe( 'Crossing 8 XODR Tests', () => {

// 	let parser: OpenDrive14Parser;
// 	let models: TvMap;

// 	beforeEach( () => {

// 		parser = new OpenDrive14Parser();
// 		models = TvMapInstance.models = parser.parse( CROSSING8.XML );

// 	} );

// 	it( 'correct hasRoadConnection logic', () => {

// 		expect( models.junctions ).toBeDefined();
// 		expect( models.junctions.size ).toBe( 1 );

// 		const incoming = models.roads.get( 502 ); // predecessor
// 		const connecting = models.roads.get( 500 );
// 		const outgoing = models.roads.get( 514 ); // successor

// 		const junction = models.junctions.get( 2 );

// 		expect( junction ).toBeDefined();
// 		expect( junction.connections.size ).toBe( 12 );

// 		expect( junction.hasRoadConnection( incoming, outgoing ) ).toBeTrue();
// 		expect( junction.hasRoadConnection( incoming, connecting ) ).toBeFalse();
// 		expect( junction.hasRoadConnection( outgoing, connecting ) ).toBeFalse();

// 		expect( junction.hasRoadConnection( connecting, incoming ) ).toBeFalse();
// 		expect( junction.hasRoadConnection( connecting, outgoing ) ).toBeFalse();

// 	} );

// 	it( 'should have predecessor/successor logic', () => {

// 		const pre = models.roads.get( 502 ); // predecessor
// 		const connecting = models.roads.get( 500 );
// 		const succ = models.roads.get( 514 ); // successor

// 		expect( connecting.predecessor.elementId ).toBe( pre.id );
// 		expect( connecting.successor.elementId ).toBe( succ.id );

// 	} );

// 	// it( 'should create correct junction objects', () => {
// 	//
// 	// 	const entries = JunctionFactory.createJunctionEntries( models.getRoads() );
// 	//
// 	// 	const start = entries.filter( entry => entry.road.id === 502 && entry.contact === 'start' )[ 0 ];
// 	// 	const end = entries.filter( entry => entry.road.id === 502 && entry.contact === 'end' )[ 0 ];
// 	//
// 	// 	expect( start ).toBeDefined();
// 	// 	expect( end ).toBeUndefined();
// 	//
// 	//
// 	// } );

// 	// it( 'should remove lane link correctly', () => {
// 	//
// 	// 	const entries = JunctionFactory.createJunctionEntries( models.getRoads() );
// 	//
// 	// 	const start: JunctionEntryObject = entries.filter( entry => entry.road.id === 502 && entry.contact === 'start' )[ 0 ];
// 	//
// 	// 	expect( start ).toBeDefined();
// 	//
// 	// 	// 3 connections
// 	// 	// 0 - 3 links
// 	// 	// 1 - 1 link
// 	// 	// 2 - 1 link
// 	// 	expect( start.connections.length ).toBe( 3 );
// 	//
// 	// 	const connection = start.connections[ 0 ];
// 	// 	const laneLink = connection.laneLink[ 0 ];
// 	//
// 	// 	expect( connection.laneLink.length ).toBe( 3 );
// 	// 	expect( laneLink.connectingLane.laneSection.lanes.size ).toBe( 5 );
// 	//
// 	// 	connection.removeLaneLink( laneLink );
// 	//
// 	// 	expect( connection.laneLink.length ).toBe( 2 );
// 	//
// 	// 	expect( laneLink.connectingLane.laneSection.lanes.size ).toBe( 4 );
// 	//
// 	// } );

// } );
