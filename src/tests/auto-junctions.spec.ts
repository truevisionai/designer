// import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
// import { OpenDrive14Parser } from 'app/importers/open-drive/open-drive-1-4.parser';
// import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';
// import { JunctionFactory } from '../app/factories/junction.factory';
// import { TvContactPoint, TvLaneSide } from '../app/modules/tv-map/models/tv-common';
// import * as TIntersection from './stubs/3-way-intersection-auto-stub';
// import * as FourWayIntersection from './stubs/4-way-intersection-auto-stub';
// import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';

// describe( 't-intersection auto maneuver logic tests', () => {

// 	let parser: OpenDrive14Parser;
// 	let map: TvMap;

// 	beforeEach( () => {

// 		parser = new OpenDrive14Parser();
// 		map = TvMapInstance.map = parser.parse( TIntersection.XML );

// 	} );

// 	it( 'should have correct logic for last driving lane', () => {

// 		// // left-right
// 		// JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ).forEach( entry => {
// 		// 	expect( entry.isLastDrivingLane ).toBe( true );
// 		// } );

// 		JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 2 ), TvContactPoint.END ).forEach( ( entry, i, entries ) => {
// 			expect( entry.lane.isLastDrivingLane() ).toBe( true );
// 			expect( entries.length ).toBe( 2 );
// 		} );

// 		JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ).forEach( ( entry, i, entries ) => {
// 			expect( entry.lane.isLastDrivingLane() ).toBe( true );
// 			expect( entries.length ).toBe( 2 );
// 		} );


// 	} );

// 	it( 'should create give correct count for links', () => {

// 		// const entries: JunctionEntryObject[] = [];

// 		// // left-right
// 		// entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ) );
// 		// expect( entries.length ).toBe( 3 );

// 		// // top-bottom
// 		// entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ) );
// 		// expect( entries.length ).toBe( 5 );

// 	} );

// 	it( 'should create right maneuvers', () => {

// 		const entries: JunctionEntryObject[] = [];

// 		// left-right
// 		entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ) );
// 		expect( entries.length ).toBe( 3 );

// 		// top-bottom
// 		entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ) );
// 		expect( entries.length ).toBe( 5 );

// 		const roads = new Map<number, JunctionEntryObject[]>();

// 		entries.forEach( entry => {

// 			if ( !roads.has( entry.road.id ) ) {
// 				roads.set( entry.road.id, [] );
// 			}

// 			roads.get( entry.road.id ).push( entry );

// 		} );

// 		expect( roads.size ).toBe( 2 );
// 		expect( roads.get( 1 ).length ).toBe( 3 );
// 		expect( roads.get( 3 ).length ).toBe( 2 );

// 		const inDescOrder = ( a, b ) => a.id > b.id ? -1 : 1;
// 		const inAscOrder = ( a, b ) => a.id > b.id ? 1 : -1;

// 		const contactA = roads.get( 1 )[ 0 ].contact;
// 		const roadAContact = contactA == TvContactPoint.START ? inAscOrder : inDescOrder;
// 		const roadAEntries = roads.get( 1 )
// 			.filter( e => contactA == TvContactPoint.END ? e.lane.isRight : e.lane.isLeft )
// 			.sort( roadAContact );

// 		const roadBContact = roads.get( 3 )[ 0 ].contact == TvContactPoint.START ? inAscOrder : inDescOrder;
// 		const roadBEntries = roads.get( 3 )
// 			.filter( e => contactA == TvContactPoint.END ? e.lane.isLeft : e.lane.isRight )
// 			.sort( roadBContact );

// 		for ( let i = 0; i < roadAEntries.length; i++ ) {

// 			const element = roadAEntries[ i ];

// 			if ( i < roadBEntries.length - 1 ) {

// 				const otherElement = roadBEntries[ i ];

// 				console.log( 'make-connection' )

// 			}
// 		}


// 	} );

// 	it( 'should have predecessor/successor logic', () => {

// 		// const entries = [];

// 		// // left-right
// 		// entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ) );
// 		// expect( entries.length ).toBe( 3 );

// 		// // left-right
// 		// entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 2 ), TvContactPoint.END ) );
// 		// expect( entries.length ).toBe( 5 );

// 		// // top-bottom
// 		// entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ) );
// 		// expect( entries.length ).toBe( 7 );

// 		// JunctionFactory.mergeEntries( entries );

// 		// expect( map.junctions.size ).toBe( 1 );

// 		// const junction = map.junctions.get( 1 );

// 		// expect( junction.connections.size ).toBe( 6 );

// 		// expect( junction.getJunctionConnection( 1 ) ).toBeDefined();
// 		// expect( junction.getJunctionConnection( 2 ) ).toBeDefined();

// 		// expect( junction.getJunctionConnection( 1 ).laneLink.length ).toBe( 1 );
// 		// expect( junction.getJunctionConnection( 2 ).laneLink.length ).toBe( 1 );

// 		// expect( junction.getJunctionConnection( 1 ).laneLink[ 0 ].incomingLane.id ).toBe( -1 );
// 		// expect( junction.getJunctionConnection( 2 ).laneLink[ 0 ].incomingLane.id ).toBe( -1 );


// 	} );

// } );

// describe( '4-way-intersection auto maneuver logic tests', () => {

// 	let parser: OpenDrive14Parser;
// 	let map: TvMap;

// 	beforeEach( () => {

// 		parser = new OpenDrive14Parser();
// 		map = TvMapInstance.map = parser.parse( FourWayIntersection.XML );

// 	} );

// 	// it( 'should give correct junction count', () => {
// 	//
// 	// 	const roads = map.getRoads();
// 	//
// 	// 	expect( roads.length ).toBe( 4 );
// 	// 	expect( map.findJunction( roads[ 0 ], roads[ 1 ] ) ).toBeNull();
// 	//
// 	// 	JunctionFactory.createJunctions()
// 	//
// 	// 	expect( map.junctions.size ).toBe( 1 );
// 	//
// 	// 	expect( map.findJunction( roads[ 0 ], roads[ 1 ] ) ).toBeDefined();
// 	//
// 	//
// 	// } );

// } );

// function getEntries ( map: TvMap ) {

// 	const entries = [];

// 	// left-right
// 	entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 1 ), TvContactPoint.END ) );
// 	expect( entries.length ).toBe( 3 );

// 	// left-right
// 	entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 2 ), TvContactPoint.END ) );
// 	expect( entries.length ).toBe( 5 );

// 	// top-bottom
// 	entries.push( ...JunctionFactory.createJunctionEntriesForRoad( map.getRoadById( 3 ), TvContactPoint.START ) );
// 	expect( entries.length ).toBe( 7 );
// }
