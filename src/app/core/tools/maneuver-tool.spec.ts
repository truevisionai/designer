/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { ManeuverTool } from './maneuver-tool';


describe( 'ManeuverTool Test', () => {

    let tool: ManeuverTool;
    let map: TvMap;

    beforeEach( () => {

        tool = new ManeuverTool();

        tool.init();

        map = TvMapInstance.map = new TvMap();

    } );

    // it( 'should return correct entry exit side', () => {

    //     // start-end <-> start:end
    //     //  1L <---     <----  1L
    //     // -1R --->     ----> -1R

    //     const roadA = map.addDefaultRoad();
    //     roadA.addGeometryLine( 0, 0, 0, 0, 10 );

    //     const roadB = map.addDefaultRoad();
    //     roadB.addGeometryLine( 0, 15, 0, 0, 10 );

    //     const positionA = roadA.endPosition().toVector3();
    //     const positionB = roadB.startPosition().toVector3();

    //     const aL2 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 2 ) );
    //     const aL1 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 1 ) );
    //     const aR1 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -1 ) );
    //     const aR2 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -2 ) );

    //     const bL2 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 2 ) );
    //     const bL1 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 1 ) );
    //     const bR1 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -1 ) );
    //     const bR2 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -2 ) );

    //     let result = tool.findEntryExitSide( aL1, bL1 );

    //     expect( result.entry.id ).toBe( bL1.id );
    //     expect( result.exit.id ).toBe( aL1.id );
    //     expect( result.side ).toBe( TvLaneSide.RIGHT );

    //     result = tool.findEntryExitSide( bL1, aL1 );

    //     expect( result.entry.id ).toBe( bL1.id );
    //     expect( result.exit.id ).toBe( aL1.id );
    //     expect( result.side ).toBe( TvLaneSide.RIGHT );

    //     result = tool.findEntryExitSide( aR1, bR1 );

    //     expect( result.entry.id ).toBe( aR1.id );
    //     expect( result.exit.id ).toBe( bR1.id );
    //     expect( result.side ).toBe( TvLaneSide.RIGHT );

    //     result = tool.findEntryExitSide( bR1, aR1 );

    //     expect( result.entry.id ).toBe( aR1.id );
    //     expect( result.exit.id ).toBe( bR1.id );
    //     expect( result.side ).toBe( TvLaneSide.RIGHT );

    // } );

    // it( 'should return true for existing connection ', () => {

    //     const roadA = map.addDefaultRoad();
    //     roadA.addGeometryLine( 0, 0, 0, 0, 10 );

    //     const roadB = map.addDefaultRoad();
    //     roadB.addGeometryLine( 0, 15, 0, 0, 10 );

    //     const roadC = map.addDefaultRoad();
    //     roadC.addGeometryLine( 0, 15, 10, 0, 10 );

    //     const positionA = roadA.endPosition().toVector3();
    //     const positionB = roadB.startPosition().toVector3();
    //     const positionC = roadC.startPosition().toVector3();

    //     const aL2 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 2 ) );
    //     const aL1 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 1 ) );
    //     const aR1 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -1 ) );
    //     const aR2 = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -2 ) );

    //     const bL2 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 2 ) );
    //     const bL1 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 1 ) );
    //     const bR1 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -1 ) );
    //     const bR2 = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -2 ) );

    //     const cL2 = new JunctionEntryObject( "", positionC, TvContactPoint.START, roadC, roadC.getFirstLaneSection().getLaneById( 2 ) );
    //     const cL1 = new JunctionEntryObject( "", positionC, TvContactPoint.START, roadC, roadC.getFirstLaneSection().getLaneById( 1 ) );
    //     const cR1 = new JunctionEntryObject( "", positionC, TvContactPoint.START, roadC, roadC.getFirstLaneSection().getLaneById( -1 ) );
    //     const cR2 = new JunctionEntryObject( "", positionC, TvContactPoint.START, roadC, roadC.getFirstLaneSection().getLaneById( -2 ) );

    //     const entryExitSide = tool.findEntryExitSide( aL1, bL1 );

    //     const laneWidth = aL1.lane.getWidthValue( 0 );

    //     const entry = entryExitSide.entry;
    //     const exit = entryExitSide.exit;
    //     const side = entryExitSide.side;

    //     const junction = tool.findJunction( entry, exit );

    //     const connectingRoad = tool.createConnectingRoad( entry, exit, side, laneWidth, junction );

    //     let result = tool.hasConnection( junction, entry, exit );

    //     expect( result.connectionFound ).toBe( false );

    //     tool.createConnections( junction, entry, connectingRoad, exit );

    //     result = tool.hasConnection( junction, entry, exit );

    //     expect( result.connectionFound ).toBe( true );

    //     result = tool.hasConnection( junction, exit, entry );

    //     expect( result.connectionFound ).toBe( false );

    //     expect( map.roads.size ).toBe( 4 );

    //     expect( junction.connections.size ).toBe( 1 );

    //     result = tool.hasConnection( junction, aR2, bR2 );

    //     // // false because till now only left side connection has been created
    //     // // if we check for right side connection it should return false
    //     // expect( result.connectionFound ).toBe( false );

    //     // result = tool.hasConnection( junction, aL2, bL2 );

    //     // // true because left side connection already exists
    //     // expect( result.connectionFound ).toBe( true );

    //     // // create another connection road a and c left side
    //     // tool.createConnections( junction, aL1, tool.createConnectingRoad( aL1, cL1, side, laneWidth, junction ), cL1 );

    //     // expect( openDrive.roads.size ).toBe( 5 );

    //     // expect( junction.connections.size ).toBe( 4 );

    //     // // []

    //     // // expect(result.)

    // } )

    // it( 'should connect road for connection from left to right', () => {

    //     // start-end <-> start:end
    //     //  1L <---     <----  1L
    //     // -1R --->     ----> -1R

    //     const roadA = map.addDefaultRoad();
    //     roadA.addGeometryLine( 0, 0, 0, 0, 10 );

    //     const roadB = map.addDefaultRoad();
    //     roadB.addGeometryLine( 0, 15, 0, 0, 10 );

    //     const positionA = roadA.endPosition().toVector3();
    //     const positionB = roadB.startPosition().toVector3();

    //     const leftA = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 1 ) );
    //     const rightA = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -1 ) );

    //     const leftB = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 1 ) );
    //     const rightB = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -1 ) );

    //     let nodes = tool.getSplinePositions( leftA, leftB, TvLaneSide.LEFT );
    //     expect( nodes.start.x ).toBe( 10 );
    //     expect( nodes.end.x ).toBe( 15 );
    //     expect( nodes.side ).toBe( TvLaneSide.LEFT );

    //     nodes = tool.getSplinePositions( leftB, leftA, TvLaneSide.RIGHT );
    //     expect( nodes.start.x ).toBe( 15 );
    //     expect( nodes.end.x ).toBe( 10 );
    //     expect( nodes.side ).toBe( TvLaneSide.RIGHT );

    //     nodes = tool.getSplinePositions( rightA, rightB, TvLaneSide.RIGHT );
    //     expect( nodes.start.x ).toBe( 10 );
    //     expect( nodes.end.x ).toBe( 15 );
    //     expect( nodes.side ).toBe( TvLaneSide.RIGHT );

    //     nodes = tool.getSplinePositions( rightB, rightA, TvLaneSide.LEFT );
    //     expect( nodes.start.x ).toBe( 15 );
    //     expect( nodes.end.x ).toBe( 10 );
    //     expect( nodes.side ).toBe( TvLaneSide.LEFT );

    //     // this will create junctions and connections
    //     tool.connectJunctionObject( leftA, leftB );
    //     tool.connectJunctionObject( rightA, rightB );

    //     ////////////////////////////////////////////////////////////////////////
    //     // connecting road successor/predecssor tests

    //     const roadC = map.roads.get( 3 );
    //     const roadD = map.roads.get( 4 );

    //     expect( !roadC ).toBe( false );
    //     expect( !roadD ).toBe( false );

    //     expect( roadC.successor.elementType ).toBe( "road" );
    //     expect( roadC.successor.elementId ).toBe( roadA.id );
    //     expect( roadC.successor.contactPoint ).toBe( TvContactPoint.END );

    //     expect( roadC.predecessor.elementType ).toBe( "road" );
    //     expect( roadC.predecessor.elementId ).toBe( roadB.id );
    //     expect( roadC.predecessor.contactPoint ).toBe( TvContactPoint.START );

    //     expect( roadD.successor.elementType ).toBe( "road" );
    //     expect( roadD.successor.elementId ).toBe( roadB.id );
    //     expect( roadD.successor.contactPoint ).toBe( TvContactPoint.START );

    //     expect( roadD.predecessor.elementType ).toBe( "road" );
    //     expect( roadD.predecessor.elementId ).toBe( roadA.id );
    //     expect( roadD.predecessor.contactPoint ).toBe( TvContactPoint.END );

    //     ////////////////////////////////////////////////////////////////////////
    //     // incoming/outgoing road successor/predecessor relation

    //     expect( map.junctions.size ).toBe( 1 );

    //     const junction = map.junctions.get( 1 );

    //     expect( junction.connections.size ).toBe( 2 );

    //     expect( roadA.successor.elementType ).toBe( "junction" )
    //     expect( roadA.successor.elementId ).toBe( junction.id )

    //     expect( roadB.predecessor.elementType ).toBe( "junction" )
    //     expect( roadB.predecessor.elementId ).toBe( junction.id )

    //     ////////////////////////////////////////////////////////////////////////
    //     // junction connection tests
    //     let connection = junction.getJunctionConnection( 1 );
    //     let link = connection.laneLink[ 0 ];

    //     expect( !connection ).toBe( false );
    //     expect( connection.incomingRoad ).toBe( 2 );
    //     expect( connection.connectingRoad ).toBe( 3 );
    //     expect( connection.contactPoint ).toBe( TvContactPoint.START );
    //     expect( link.from ).toBe( +1 );
    //     expect( link.to ).toBe( -1 );

    //     connection = junction.getJunctionConnection( 2 );
    //     link = connection.laneLink[ 0 ];

    //     expect( !connection ).toBe( false );
    //     expect( connection.incomingRoad ).toBe( 1 );
    //     expect( connection.connectingRoad ).toBe( 4 );
    //     expect( connection.contactPoint ).toBe( TvContactPoint.START );
    //     expect( link.from ).toBe( -1 );
    //     expect( link.to ).toBe( -1 );


    //     ////////////////////////////////////////////////////////////////////////
    //     // connection road lane links
    //     ////////////////////////////////////////////////////////////////////////

    //     const laneC = roadC.getFirstLaneSection().getLaneById( -1 );

    //     expect( !laneC ).toBe( false );
    //     expect( laneC.predecessor ).toBe( 1 );
    //     expect( laneC.succcessor ).toBe( 1 );

    //     const laneD = roadD.getFirstLaneSection().getLaneById( -1 );

    //     expect( !laneD ).toBe( false );
    //     expect( laneD.predecessor ).toBe( -1 );
    //     expect( laneD.succcessor ).toBe( -1 );

    // } );

    // it( 'should connect road for connection from right to left', () => {

    //     // start-end <-> start:end
    //     //  1L <---     <----  1L
    //     // -1R --->     ----> -1R

    //     const roadA = map.addDefaultRoad();
    //     roadA.addGeometryLine( 0, 0, 0, 0, 10 );

    //     const roadB = map.addDefaultRoad();
    //     roadB.addGeometryLine( 0, 15, 0, 0, 10 );

    //     const positionA = roadA.endPosition().toVector3();
    //     const positionB = roadB.startPosition().toVector3();

    //     const leftA = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( 1 ) );
    //     const rightA = new JunctionEntryObject( "", positionA, TvContactPoint.END, roadA, roadA.getFirstLaneSection().getLaneById( -1 ) );

    //     const leftB = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( 1 ) );
    //     const rightB = new JunctionEntryObject( "", positionB, TvContactPoint.START, roadB, roadB.getFirstLaneSection().getLaneById( -1 ) );

    //     let nodes = tool.getSplinePositions( leftA, leftB, TvLaneSide.LEFT );
    //     expect( nodes.start.x ).toBe( 10 );
    //     expect( nodes.end.x ).toBe( 15 );
    //     expect( nodes.side ).toBe( TvLaneSide.LEFT );

    //     nodes = tool.getSplinePositions( leftB, leftA, TvLaneSide.RIGHT );
    //     expect( nodes.start.x ).toBe( 15 );
    //     expect( nodes.end.x ).toBe( 10 );
    //     expect( nodes.side ).toBe( TvLaneSide.RIGHT );

    //     nodes = tool.getSplinePositions( rightA, rightB, TvLaneSide.RIGHT );
    //     expect( nodes.start.x ).toBe( 10 );
    //     expect( nodes.end.x ).toBe( 15 );
    //     expect( nodes.side ).toBe( TvLaneSide.RIGHT );

    //     nodes = tool.getSplinePositions( rightB, rightA, TvLaneSide.LEFT );
    //     expect( nodes.start.x ).toBe( 15 );
    //     expect( nodes.end.x ).toBe( 10 );
    //     expect( nodes.side ).toBe( TvLaneSide.LEFT );

    //     // this will create junctions and connections
    //     tool.connectJunctionObject( leftB, leftA );
    //     tool.connectJunctionObject( rightB, rightA );

    //     ////////////////////////////////////////////////////////////////////////
    //     // connecting road successor/predecssor tests

    //     const roadC = map.roads.get( 3 );
    //     const roadD = map.roads.get( 4 );

    //     expect( roadC.successor.elementType ).toBe( "road" );
    //     expect( roadC.successor.elementId ).toBe( roadA.id );
    //     expect( roadC.successor.contactPoint ).toBe( TvContactPoint.END );

    //     expect( roadC.predecessor.elementType ).toBe( "road" );
    //     expect( roadC.predecessor.elementId ).toBe( roadB.id );
    //     expect( roadC.predecessor.contactPoint ).toBe( TvContactPoint.START );

    //     expect( roadD.successor.elementType ).toBe( "road" );
    //     expect( roadD.successor.elementId ).toBe( roadB.id );
    //     expect( roadD.successor.contactPoint ).toBe( TvContactPoint.START );

    //     expect( roadD.predecessor.elementType ).toBe( "road" );
    //     expect( roadD.predecessor.elementId ).toBe( roadA.id );
    //     expect( roadD.predecessor.contactPoint ).toBe( TvContactPoint.END );

    //     ////////////////////////////////////////////////////////////////////////
    //     // incoming/outgoing road successor/predecessor relation

    //     expect( map.junctions.size ).toBe( 1 );

    //     const junction = map.junctions.get( 1 );

    //     expect( junction.connections.size ).toBe( 2 );

    //     expect( roadA.successor.elementType ).toBe( "junction" )
    //     expect( roadA.successor.elementId ).toBe( junction.id )

    //     expect( roadB.predecessor.elementType ).toBe( "junction" )
    //     expect( roadB.predecessor.elementId ).toBe( junction.id )

    //     ////////////////////////////////////////////////////////////////////////
    //     // junction connection tests
    //     let connection = junction.getJunctionConnection( 1 );
    //     let link = connection.laneLink[ 0 ];

    //     expect( !connection ).toBe( false );
    //     expect( connection.incomingRoad ).toBe( 2 );
    //     expect( connection.connectingRoad ).toBe( 3 );
    //     expect( connection.contactPoint ).toBe( TvContactPoint.START );
    //     expect( link.from ).toBe( +1 );
    //     expect( link.to ).toBe( -1 );

    //     connection = junction.getJunctionConnection( 2 );
    //     link = connection.laneLink[ 0 ];

    //     expect( !connection ).toBe( false );
    //     expect( connection.incomingRoad ).toBe( 1 );
    //     expect( connection.connectingRoad ).toBe( 4 );
    //     expect( connection.contactPoint ).toBe( TvContactPoint.START );
    //     expect( link.from ).toBe( -1 );
    //     expect( link.to ).toBe( -1 );


    //     ////////////////////////////////////////////////////////////////////////
    //     // connection road lane links
    //     ////////////////////////////////////////////////////////////////////////

    //     const laneC = roadC.getFirstLaneSection().getLaneById( -1 );

    //     expect( !laneC ).toBe( false );
    //     expect( laneC.predecessor ).toBe( 1 );
    //     expect( laneC.succcessor ).toBe( 1 );

    //     const laneD = roadD.getFirstLaneSection().getLaneById( -1 );

    //     expect( !laneD ).toBe( false );
    //     expect( laneD.predecessor ).toBe( -1 );
    //     expect( laneD.succcessor ).toBe( -1 );


    // } );

    // it( 'should connect road for connection', () => {

    //     // start-end <-> end:start
    //     //  1L <---     <---- -1R
    //     // -1R --->     ---->  1L

    //     const roadA = openDrive.addDefaultRoad();
    //     roadA.addGeometryLine( 0, 0, 0, 0, 10 );

    //     const roadB = openDrive.addDefaultRoad();
    //     roadB.addGeometryLine( 0, 25, 0, -Math.PI, 10 );

    //     const positionA = roadA.endPosition().toVector3();
    //     const positionB = roadB.startPosition().toVector3();

    //     let a = new JunctionEntryObject( "", positionA, OdContactPoints.END, roadA, roadA.getFirstLaneSection().getLaneById( 1 ) );
    //     let b = new JunctionEntryObject( "", positionB, OdContactPoints.END, roadB, roadB.getFirstLaneSection().getLaneById( 1 ) );

    //     let nodes = tool.findStartEndForRoad( a, b );

    //     expect( nodes ).toBeUndefined();

    //     /////////////////////////////////////////////////////////////////////////////

    //     a = new JunctionEntryObject( "", positionA, OdContactPoints.END, roadA, roadA.getFirstLaneSection().getLaneById( -1 ) );

    //     nodes = tool.findStartEndForRoad( a, b );

    //     expect( nodes.start.x ).toBe( 15 );
    //     expect( nodes.end.x ).toBe( 10 );

    // } );

    it( 'should connect right road for connection' );


} );
