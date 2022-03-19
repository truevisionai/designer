/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { TestBed } from '@angular/core/testing';
// import { OdRoad } from 'app/modules/tv-map/models/od-road.model';
// import { LaneSide, OdLaneType, OdSides, OdContactPoints } from 'app/modules/tv-map/models/od-common.model';
// import { Vector3, Vector2 } from 'three';
// import { OpenDriveQueries } from 'app/modules/tv-map/queries/tv-map-queries';
// import { OdSourceFile } from 'app/modules/tv-map/services/od-source-file';
// import { OpenDrive } from 'app/modules/tv-map/models/tv-map.models';
// import { Maths } from 'app/utils/maths';
// import { OdPosTheta } from 'app/modules/tv-map/models/od-pos-theta';
// import { ManeuverTool, IJunctionConnection } from './maneuver-tool';
// import { OdLineGeometry } from 'app/modules/tv-map/models/geometries/od-line-geometry';
// import { OdArcGeometry } from 'app/modules/tv-map/models/geometries/od-arc-geometry';
// import { OpenDriveService } from 'app/modules/tv-map/services/tv-map.service';
// import { OdWriter } from 'app/modules/tv-map/services/od-writer.service';

// interface Geom {
//     road: number;
//     positions: Vector3[];  // x,y,z
// }

// describe( 'ManeuverTool Test', () => {

//     let tool: ManeuverTool;

//     beforeEach( () => {

//         tool = new ManeuverTool();

//         tool.init();

//         ManeuverTool.DOTCOUNT = 0;

//     } );

//     function findIntersectionsSlow ( roads: OdRoad[] ): Vector3[] {

//         const newRoads: Geom[] = [];

//         const t1 = performance.now();

//         for ( let i = 0; i < roads.length; i++ ) {

//             const road = roads[ i ];

//             const positions: Vector3[] = [];

//             const geom = {
//                 road: road.id,
//                 positions: positions,
//             }

//             const geometries = road.geometries;

//             for ( let g = 0; g < geometries.length; g++ ) {

//                 const geometry = geometries[ g ];

//                 const s = geometry.s;
//                 const s2 = geometry.s2;

//                 let posTheta = new OdPosTheta();

//                 for ( let s = 0; s <= s2; s += 10 ) {

//                     geometry.getCoords( s, posTheta );

//                     positions.push( posTheta.toVector3() );

//                 }
//             }

//             newRoads.push( geom );
//         }

//         const t2 = performance.now();

//         const timeToMakeGeometries = t2 - t1;

//         const intersections: Vector3[] = [];

//         for ( let i = 0; i < newRoads.length; i++ ) {

//             const positions = newRoads[ i ].positions;

//             for ( let j = i + 1; j < newRoads.length; j++ ) {

//                 const otherPositions = newRoads[ j ].positions;

//                 for ( let k = 0; k < otherPositions.length; k++ ) {

//                     const otherPosition = otherPositions[ k ];

//                     for ( let l = 0; l < positions.length; l++ ) {

//                         const position = positions[ l ];
//                         const distance = position.distanceTo( otherPosition );

//                         if ( distance < 9.9 ) {

//                             intersections.push( position );
//                         }
//                     }
//                 }
//             }
//         }

//         const t3 = performance.now();

//         const timeToFindIntersections = t3 - t2;

//         return intersections;
//     }

//     function findRoadIntersections ( roads: OdRoad[] ) {

//         const positions: [][] = [];

//         roads.forEach( road => {

//             const otherRoads = roads.filter( r => r.id != road.id && !road.isJunction );

//             const roadGeometries = road.geometries;

//             otherRoads.forEach( otherRoad => {

//                 const otherRoadGeometries = otherRoad.geometries;

//                 roadGeometries.forEach( g => {

//                     otherRoadGeometries.forEach( og => {

//                         // g.getIntersections( og );

//                         const s = og.s;
//                         const s2 = og.s2;

//                         let position = null;
//                         let posTheta = new OdPosTheta();

//                         for ( let s = 0; s <= s2; s++ ) {

//                             position = og.getCoords( s, posTheta );

//                             positions[ road.id ]

//                         }
//                     } );

//                 } )

//             } );
//         } );
//     }

//     function getLineArcIntersections ( A: Vector3, B: Vector3, C: Vector3, R: number ): Vector3[] {

//         // https://revisionmaths.com/advanced-level-maths-revision/pure-maths/geometry/equation-circle
//         // https://stackoverflow.com/a/1088058
//         // equation of circle with center (a,b) with radius r is
//         // 
//         // (x-a)^2 + (y-b)^2 = r^2
//         // 

//         // line segment
//         // const A = new Vector3( 0, 0, 0 );
//         // const B = new Vector3( 0, 150, 0 );
//         // const slope = Maths.slope( A, B );

//         // center of circle
//         // const C = new Vector3( 0, 0, 0 );
//         // const R = 100;

//         const LAB = A.distanceTo( B );

//         const D = new Vector3(
//             ( B.x - A.x ) / LAB,
//             ( B.y - A.y ) / LAB,
//             0
//         );

//         // compute the distance between the points A and E, where
//         // E is the point of AB closest the circle center (Cx, Cy)
//         const t = D.x * ( C.x - A.x ) + D.y * ( C.y - A.y )

//         const E = new Vector3(
//             t * D.x + A.y,
//             t * D.y + A.y,
//             0
//         );

//         const LEC = E.distanceTo( C );

//         // line intersects
//         if ( LEC < R ) {

//             // compute distance from t to circle intersection point
//             const dt = Math.sqrt( R * R - LEC * LEC );

//             // compute first intersection point
//             const F = new Vector3(
//                 ( t - dt ) * D.x + A.x,
//                 ( t - dt ) * D.y + A.y,
//                 0
//             );

//             // compute second intersection point
//             const G = new Vector3(
//                 ( t + dt ) * D.x + A.x,
//                 ( t + dt ) * D.y + A.y,
//                 0
//             );

//             const intersections = [];

//             const F_online = Maths.isPointOnLine( A, B, F );

//             if ( F_online ) intersections.push( F );

//             const G_online = Maths.isPointOnLine( A, B, G );

//             if ( G_online ) intersections.push( G );

//             return intersections;

//             // const isXOnLine = Maths.isPointOnLine( A, B, new Vector3( 0, 10, 0 ) );

//         } else if ( Maths.approxEquals( LEC, R ) ) {

//             // TODO: Return tanget also in future
//             // tangent point to circle is E

//             return [];

//         } else {

//             // line does not intersect
//             return [];

//         }
//     }

//     it( 'should check line and line intersection', () => {

//         create2x2LaneRoadIntersection( 10000 );

//         const intersections = findIntersectionsSlow( [ ...OdSourceFile.openDrive.roads.values() ] );

//         expect( intersections.length ).toBe( 1 );

//     } );

//     it( 'should give left side for point direction checks', () => {

//         // TODO: Move this to maths.spec.ts

//         let side: OdSides;

//         side = Maths.findSide( new Vector3( 0, 10, 0 ), new Vector3( 0, 0, 0 ), 0 );

//         expect( side ).toBe( OdSides.LEFT );

//         side = Maths.findSide( new Vector3( 0, 10, 0 ), new Vector3( 0, 0, 0 ), -0.78 ); // -45 degree

//         expect( side ).toBe( OdSides.LEFT );

//         side = Maths.findSide( new Vector3( 0, 10, 0 ), new Vector3( 0, 0, 0 ), 0.78 ); // +45 degree

//         expect( side ).toBe( OdSides.LEFT );

//         side = Maths.findSide( new Vector3( 10, 10, 0 ), new Vector3( 0, 0, 0 ), -1.57 ); // -90 degree

//         expect( side ).toBe( OdSides.LEFT );

//         side = Maths.findSide( new Vector3( 10, 0, 0 ), new Vector3( 0, 0, 0 ), -1.57 ); // -90 degree

//         expect( side ).toBe( OdSides.LEFT );

//         side = Maths.findSide( new Vector3( 10, 20, 0 ), new Vector3( 0, 0, 0 ), -1.57 ); // -90 degree

//         expect( side ).toBe( OdSides.LEFT );

//     } );

//     it( 'should give right side for point direction checks', () => {

//         // TODO: Move this to maths.spec.ts

//         let side: OdSides;

//         // +90 degree
//         expect( Maths.findSide( new Vector3( 10, 0, 0 ), new Vector3( 0, 0, 0 ), 1.57 ) )
//             .toBe( OdSides.RIGHT );

//         expect( Maths.findSide( new Vector3( 10, 10, 0 ), new Vector3( 0, 0, 0 ), 1.57 ) )
//             .toBe( OdSides.RIGHT );

//         expect( Maths.findSide( new Vector3( 100, 100, 0 ), new Vector3( 0, 0, 0 ), 1.57 ) )
//             .toBe( OdSides.RIGHT );

//         expect( Maths.findSide( new Vector3( 1000, 1000, 0 ), new Vector3( 0, 0, 0 ), 1.57 ) )
//             .toBe( OdSides.RIGHT );

//         // +45 degree
//         expect( Maths.findSide( new Vector3( 10, 0, 0 ), new Vector3( 0, 0, 0 ), 0.78 ) )
//             .toBe( OdSides.RIGHT );

//         expect( Maths.findSide( new Vector3( 100, 0, 0 ), new Vector3( 0, 0, 0 ), 0.78 ) )
//             .toBe( OdSides.RIGHT );

//     } )

//     it( 'should create 8 dots for 2x2 lane intersections with same direction', () => {

//         const roads = create2x2LaneRoadIntersection();

//         const intesections = tool.findIntersectionsSlow( roads );

//         const junctions = tool.createJunctionAreas( intesections );

//         expect( intesections.length ).toBe( 1 );
//         expect( junctions.length ).toBe( 1 );

//         // TODO: assert junction[0] values also for correct s, start, end values

//         const dots = tool.createDotsForJunction( junctions[ 0 ] );

//         expect( dots.length ).toBe( 8 );
//         expect( dots[ 0 ].id ).toBe( 0 );
//         expect( dots[ 1 ].id ).toBe( 1 );
//         expect( dots[ 2 ].id ).toBe( 2 );
//         expect( dots[ 3 ].id ).toBe( 3 );
//         expect( dots[ 4 ].id ).toBe( 4 );
//         expect( dots[ 5 ].id ).toBe( 5 );
//         expect( dots[ 6 ].id ).toBe( 6 );
//         expect( dots[ 7 ].id ).toBe( 7 );

//         // A Left End > A Left Start
//         expect( dots[ 1 ].s ).toBeGreaterThan( dots[ 0 ].s );
//         // A Right Start > A Right End
//         expect( dots[ 2 ].s ).toBeGreaterThan( dots[ 3 ].s );

//         // B Left End > B Left Start
//         expect( dots[ 5 ].s ).toBeGreaterThan( dots[ 4 ].s );
//         // B Right Start > B Right End
//         expect( dots[ 6 ].s ).toBeGreaterThan( dots[ 7 ].s );

//         // TODO: test position
//         // TODO: test connections

//         const connections = ManeuverTool.createConnections( roads, dots );

//         const straightConnections = connections.filter( c => c.type == 'straight' );
//         const leftTurnConnections = connections.filter( c => c.type == "left-turn" );
//         const rightTurnConnections = connections.filter( c => c.type == "right-turn" );

//         expect( connections.length ).toBe( 12 );
//         expect( straightConnections.length ).toBe( 4 );
//         expect( leftTurnConnections.length ).toBe( 4 );
//         expect( rightTurnConnections.length ).toBe( 4 );

//         expect( straightConnections[ 0 ].incomingRoad ).toBe( 1 );
//         expect( straightConnections[ 0 ].outgoingRoad ).toBe( 1 );
//         expect( straightConnections[ 0 ].fromLane ).toBe( 1 );
//         expect( straightConnections[ 0 ].toLane ).toBe( 1 );
//         expect( straightConnections[ 0 ].point ).toBe( 'start' );

//         expect( straightConnections[ 1 ].incomingRoad ).toBe( 1 );
//         expect( straightConnections[ 1 ].outgoingRoad ).toBe( 1 );
//         expect( straightConnections[ 1 ].fromLane ).toBe( -1 );
//         expect( straightConnections[ 1 ].toLane ).toBe( -1 );
//         expect( straightConnections[ 1 ].point ).toBe( 'start' );

//         expect( straightConnections[ 2 ].incomingRoad ).toBe( 2 );
//         expect( straightConnections[ 2 ].outgoingRoad ).toBe( 2 );
//         expect( straightConnections[ 2 ].fromLane ).toBe( 1 );
//         expect( straightConnections[ 2 ].toLane ).toBe( 1 );
//         expect( straightConnections[ 2 ].point ).toBe( 'start' );

//         expect( straightConnections[ 3 ].incomingRoad ).toBe( 2 );
//         expect( straightConnections[ 3 ].outgoingRoad ).toBe( 2 );
//         expect( straightConnections[ 3 ].fromLane ).toBe( -1 );
//         expect( straightConnections[ 3 ].toLane ).toBe( -1 );
//         expect( straightConnections[ 3 ].point ).toBe( 'start' );

//         expect( leftTurnConnections[ 0 ].entry.id ).toBe( 0 );
//         expect( leftTurnConnections[ 0 ].exit.id ).toBe( 5 );
//         expect( leftTurnConnections[ 0 ].incomingRoad ).toBe( 1 );
//         expect( leftTurnConnections[ 0 ].outgoingRoad ).toBe( 2 );
//         expect( leftTurnConnections[ 0 ].fromLane ).toBe( 1 );                  // forward
//         expect( leftTurnConnections[ 0 ].toLane ).toBe( 1 );                    // forward
//         expect( leftTurnConnections[ 0 ].point ).toBe( 'start' );

//         expect( leftTurnConnections[ 1 ].entry.id ).toBe( 2 );
//         expect( leftTurnConnections[ 1 ].exit.id ).toBe( 7 );
//         expect( leftTurnConnections[ 1 ].incomingRoad ).toBe( 1 );
//         expect( leftTurnConnections[ 1 ].outgoingRoad ).toBe( 2 );
//         expect( leftTurnConnections[ 1 ].fromLane ).toBe( -1 );                  // backward
//         expect( leftTurnConnections[ 1 ].toLane ).toBe( -1 );                    // backward
//         expect( leftTurnConnections[ 1 ].point ).toBe( 'start' );

//         expect( leftTurnConnections[ 2 ].entry.id ).toBe( 4 );
//         expect( leftTurnConnections[ 2 ].exit.id ).toBe( 3 );
//         expect( leftTurnConnections[ 2 ].incomingRoad ).toBe( 2 );
//         expect( leftTurnConnections[ 2 ].outgoingRoad ).toBe( 1 );
//         expect( leftTurnConnections[ 2 ].fromLane ).toBe( 1 );                  // forward
//         expect( leftTurnConnections[ 2 ].toLane ).toBe( -1 );                   // backward
//         expect( leftTurnConnections[ 2 ].point ).toBe( 'start' );

//         expect( leftTurnConnections[ 3 ].entry.id ).toBe( 6 );
//         expect( leftTurnConnections[ 3 ].exit.id ).toBe( 1 );
//         expect( leftTurnConnections[ 3 ].incomingRoad ).toBe( 2 );
//         expect( leftTurnConnections[ 3 ].outgoingRoad ).toBe( 1 );
//         expect( leftTurnConnections[ 3 ].fromLane ).toBe( -1 );                 // backward
//         expect( leftTurnConnections[ 3 ].toLane ).toBe( 1 );                    // forward
//         expect( leftTurnConnections[ 3 ].point ).toBe( 'start' );

//     } );

//     it( 'should create 8 dots for 2x2 lane intersections with opposite direction', () => {

//         const roads = create2x2LaneRoadIntersection();

//         // make road go from top to down
//         roads[ 1 ].planView.geometries[ 0 ].x = 0;
//         roads[ 1 ].planView.geometries[ 0 ].y = 50;
//         roads[ 1 ].planView.geometries[ 0 ].hdg = -1.57;

//         const intesections = tool.findIntersectionsSlow( roads );

//         const junctions = tool.createJunctionAreas( intesections );

//         expect( intesections.length ).toBe( 1 );
//         expect( junctions.length ).toBe( 1 );

//         // TODO: assert junction[0] values also for correct s, start, end values

//         const dots = tool.createDotsForJunction( junctions[ 0 ] );

//         expect( dots.length ).toBe( 8 );
//         expect( dots[ 0 ].id ).toBe( 0 );
//         expect( dots[ 1 ].id ).toBe( 1 );
//         expect( dots[ 2 ].id ).toBe( 2 );
//         expect( dots[ 3 ].id ).toBe( 3 );
//         expect( dots[ 4 ].id ).toBe( 4 );
//         expect( dots[ 5 ].id ).toBe( 5 );
//         expect( dots[ 6 ].id ).toBe( 6 );
//         expect( dots[ 7 ].id ).toBe( 7 );

//         // A Left End > A Left Start
//         expect( dots[ 1 ].s ).toBeGreaterThan( dots[ 0 ].s );
//         // A Right Start > A Right End
//         expect( dots[ 2 ].s ).toBeGreaterThan( dots[ 3 ].s );

//         // B Left End > B Left Start
//         expect( dots[ 5 ].s ).toBeGreaterThan( dots[ 4 ].s );
//         // B Right Start > B Right End
//         expect( dots[ 6 ].s ).toBeGreaterThan( dots[ 7 ].s );

//         // TODO: test position
//         // TODO: test connections

//         const connections = ManeuverTool.createConnections( roads, dots );

//         const straightConnections = connections.filter( c => c.type == 'straight' );
//         const leftTurnConnections = connections.filter( c => c.type == "left-turn" );
//         const rightTurnConnections = connections.filter( c => c.type == "right-turn" );

//         expect( connections.length ).toBe( 12 );
//         expect( straightConnections.length ).toBe( 4 );
//         expect( leftTurnConnections.length ).toBe( 4 );
//         expect( rightTurnConnections.length ).toBe( 4 );

//         expect( straightConnections[ 0 ].incomingRoad ).toBe( 1 );
//         expect( straightConnections[ 0 ].outgoingRoad ).toBe( 1 );
//         expect( straightConnections[ 0 ].fromLane ).toBe( 1 );
//         expect( straightConnections[ 0 ].toLane ).toBe( 1 );
//         expect( straightConnections[ 0 ].point ).toBe( 'start' );

//         expect( straightConnections[ 1 ].incomingRoad ).toBe( 1 );
//         expect( straightConnections[ 1 ].outgoingRoad ).toBe( 1 );
//         expect( straightConnections[ 1 ].fromLane ).toBe( -1 );
//         expect( straightConnections[ 1 ].toLane ).toBe( -1 );
//         expect( straightConnections[ 1 ].point ).toBe( 'start' );

//         expect( straightConnections[ 2 ].incomingRoad ).toBe( 2 );
//         expect( straightConnections[ 2 ].outgoingRoad ).toBe( 2 );
//         expect( straightConnections[ 2 ].fromLane ).toBe( 1 );
//         expect( straightConnections[ 2 ].toLane ).toBe( 1 );
//         expect( straightConnections[ 2 ].point ).toBe( 'start' );

//         expect( straightConnections[ 3 ].incomingRoad ).toBe( 2 );
//         expect( straightConnections[ 3 ].outgoingRoad ).toBe( 2 );
//         expect( straightConnections[ 3 ].fromLane ).toBe( -1 );
//         expect( straightConnections[ 3 ].toLane ).toBe( -1 );
//         expect( straightConnections[ 3 ].point ).toBe( 'start' );

//         // below are not working

//         // expect( leftTurnConnections[ 0 ].entry.id ).toBe( 0 );
//         // expect( leftTurnConnections[ 0 ].exit.id ).toBe( 7 );
//         // expect( leftTurnConnections[ 0 ].incomingRoad ).toBe( 1 );
//         // expect( leftTurnConnections[ 0 ].outgoingRoad ).toBe( 2 );
//         // expect( leftTurnConnections[ 0 ].fromLane ).toBe( 1 );                  // forward
//         // expect( leftTurnConnections[ 0 ].toLane ).toBe( 1 );                    // forward
//         // expect( leftTurnConnections[ 0 ].point ).toBe( 'start' );

//         // expect( leftTurnConnections[ 1 ].entry.id ).toBe( 2 );
//         // expect( leftTurnConnections[ 1 ].exit.id ).toBe( 7 );
//         // expect( leftTurnConnections[ 1 ].incomingRoad ).toBe( 1 );
//         // expect( leftTurnConnections[ 1 ].outgoingRoad ).toBe( 2 );
//         // expect( leftTurnConnections[ 1 ].fromLane ).toBe( -1 );                  // backward
//         // expect( leftTurnConnections[ 1 ].toLane ).toBe( -1 );                    // backward
//         // expect( leftTurnConnections[ 1 ].point ).toBe( 'start' );

//         // expect( leftTurnConnections[ 2 ].entry.id ).toBe( 4 );
//         // expect( leftTurnConnections[ 2 ].exit.id ).toBe( 3 );
//         // expect( leftTurnConnections[ 2 ].incomingRoad ).toBe( 2 );
//         // expect( leftTurnConnections[ 2 ].outgoingRoad ).toBe( 1 );
//         // expect( leftTurnConnections[ 2 ].fromLane ).toBe( 1 );                  // forward
//         // expect( leftTurnConnections[ 2 ].toLane ).toBe( -1 );                   // backward
//         // expect( leftTurnConnections[ 2 ].point ).toBe( 'start' );

//         // expect( leftTurnConnections[ 3 ].entry.id ).toBe( 6 );
//         // expect( leftTurnConnections[ 3 ].exit.id ).toBe( 1 );
//         // expect( leftTurnConnections[ 3 ].incomingRoad ).toBe( 2 );
//         // expect( leftTurnConnections[ 3 ].outgoingRoad ).toBe( 1 );
//         // expect( leftTurnConnections[ 3 ].fromLane ).toBe( -1 );                 // backward
//         // expect( leftTurnConnections[ 3 ].toLane ).toBe( 1 );                    // forward
//         // expect( leftTurnConnections[ 3 ].point ).toBe( 'start' );

//     } );

//     it( 'should create 14 connections for 3x3 lane intersection', () => {

//         const roads = create3x3LaneRoadIntersection();

//         const intesections = tool.findIntersectionsSlow( roads );

//         const junctions = tool.createJunctionAreas( intesections );

//         expect( intesections.length ).toBe( 1 );
//         expect( junctions.length ).toBe( 1 );

//         const dots = tool.createDotsForJunction( junctions[ 0 ] );

//         const connections = tool.prepareJunctionConnections( junctions );

//         expect( dots.length ).toBe( 12 );

//         expect( connections.length ).toBe( 14 );

//     } );

//     it( 'should create 10 connections for 4 lane freeway intersection', () => {

//         // const roads = create4LaneFreewayIntersection();

//         // const intesections = tool.findIntersectionsSlow( roads );

//         // const junctions = ManeuverTool.createJunctionAreas( intesections );

//         // expect( intesections.length ).toBe( 1 );
//         // expect( junctions.length ).toBe( 1 );

//         // const dots = tool.createDotsForJunction( junctions[ 0 ] );

//         // const connections = tool.prepareJunctionConnections( junctions );

//         // expect( dots.length ).toBe( 16 );

//         // throwing error: 9 instead of 10
//         // expect( connections.length ).toBe( 10 );

//     } );

//     it( 'should not create junctions for same intersection again', () => {

//         const roads = create2x2LaneRoadIntersection();

//         const intesections = tool.findIntersectionsSlow( roads );

//         const junctions = tool.createJunctionAreas( intesections );

//         const connections = tool.prepareJunctionConnections( junctions );

//         // const straightConnections = connections.filter( c => c.type == 'straight' );
//         // const leftTurnConnections = connections.filter( c => c.type == "left-turn" );
//         // const rightTurnConnections = connections.filter( c => c.type == "right-turn" );

//     } );

//     it( 'should divide straight road correctly on intersection', () => {

//         // // TODO: this test it not working

//         // const sStart = 45;
//         // const sEnd = 55;

//         // const roads = create2x2LaneRoadIntersection( 100 );

//         // const spline = new AutoSpline();

//         // const connection: IJunctionConnection = {
//         //     entry: {
//         //         id: 0,
//         //         s: sStart,
//         //         roadId: 1,
//         //         laneId: 1,
//         //         type: 'start',
//         //         color: 345,
//         //         direction: 'forward',
//         //         position: OpenDriveQueries.getLanePosition( 1, 1, sStart, 0 ),
//         //         hdg: 0,
//         //     },
//         //     exit: {
//         //         id: 0,
//         //         s: 55,
//         //         roadId: 1,
//         //         laneId: 1,
//         //         type: 'end',
//         //         color: 345,
//         //         direction: 'forward',
//         //         position: OpenDriveQueries.getLanePosition( 1, 1, sEnd, 0 ),
//         //         hdg: 0,
//         //     },
//         //     spline: spline
//         // };

//         // spline.addControlPointAt( connection.entry.position );
//         // spline.addControlPointAt( connection.exit.position );
//         // spline.update();

//         // const result = tool.createStraightJunctionRoad( 1, connection );

//         // expect( result.incoming.length ).toBe( 45 );
//         // expect( result.incoming.geometries[ 0 ].x ).toBe( -50 );
//         // expect( result.incoming.geometries[ 0 ].y ).toBe( 0 );
//         // expect( result.incoming.geometries[ 0 ].hdg ).toBe( 0 );

//         // expect( result.connecting.length ).toBe( 10 );
//         // expect( result.connecting.geometries[ 0 ].x ).toBe( -5 );
//         // expect( result.connecting.geometries[ 0 ].y ).toBe( 0 );
//         // expect( result.connecting.geometries[ 0 ].hdg ).toBe( 0 );

//         // expect( result.outgoing.length ).toBe( 45 );
//         // expect( result.connecting.geometries[ 0 ].x ).toBe( 5 );
//         // expect( result.connecting.geometries[ 0 ].y ).toBe( 0 );
//         // expect( result.connecting.geometries[ 0 ].hdg ).toBe( 0 );

//     } );

//     it( 'should find the correct geometry at s', () => {

//         const road = new OdRoad( "1", 500, 6, -1 );

//         road.addGeometryLine( 0, 0, 0, 0, 100 );            // 100
//         road.addGeometryLine( 100, 100, 0, 0, 100 );        // 200
//         road.addGeometryLine( 200, 200, 0, 0, 100 );        // 300
//         road.addGeometryLine( 300, 300, 0, 0, 100 );
//         road.addGeometryLine( 400, 400, 0, 0, 100 );

//         const s = 250;
//         const result = road.getGeometryAt( s );

//         expect( result.s ).toBe( 200 );
//         expect( result.s2 ).toBe( 300 );

//     } )

//     it( 'should find the correct geometry at s', () => {

//         const road = new OdRoad( "1", 500, 6, -1 );

//         road.addLaneSection( 0, false );
//         road.addLaneSection( 100, false );
//         road.addLaneSection( 200, false );
//         road.addLaneSection( 300, false );
//         road.addLaneSection( 400, false );

//         const s = 250;
//         const result = road.getLaneSectionAt( s );

//         expect( result.s ).toBe( 200 );

//     } )

//     it( 'should show imported junctions correctly', () => {

//         // create simple two road intersection for testing
//         // ============|||==================
//         const openDrive = OdSourceFile.openDrive = new OpenDrive();

//         const roadA = openDrive.addRoad( "A", 90, 1, -1 );
//         const roadB = openDrive.addRoad( "B", 90, 2, -1 );

//         roadA.addGeometryLine( 0, -100, 0, 0, 90 );
//         roadB.addGeometryLine( 0, 10, 0, 0, 90 );

//         [ roadA, roadB ].forEach( road => {

//             road.addLaneSection( 0, false ); const laneSection = road.getLastAddedLaneSection();

//             let leftLane = laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );
//             let centerLane = laneSection.addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );
//             let rightLane = laneSection.addLane( LaneSide.RIGHT, -1, OdLaneType.driving, true, true );

//             [ leftLane, centerLane, rightLane ].forEach( lane => lane.addWidthRecord( 0, 2, 0, 0, 0 ) );

//         } )

//         roadA.setSuccessor( "junction", 1, null );
//         roadB.setPredecessor( "junction", 1, null );


//         // connecting roads for junction
//         const roadC = openDrive.addRoad( "C", 20, 3, 1 );
//         const roadD = openDrive.addRoad( "D", 20, 4, 1 );

//         roadC.setPredecessor( "road", 1, OdContactPoints.END );
//         roadC.setSuccessor( "road", 2, OdContactPoints.START );

//         roadD.setPredecessor( "road", 1, OdContactPoints.END );
//         roadD.setSuccessor( "road", 2, OdContactPoints.START );

//         roadC.addGeometryLine( 0, -10, 0, 0, 20 );
//         roadD.addGeometryLine( 0, -10, 0, 0, 20 );


//         roadC.addLaneSection( 0, false );
//         roadC.getLaneSectionAt( 0 )
//             .addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true )
//             .addWidthRecord( 0, 2, 0, 0, 0 );
//         roadC.getLaneSectionAt( 0 )
//             .addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );

//         roadD.addLaneSection( 0, false );
//         roadD.getLaneSectionAt( 0 )
//             .addLane( LaneSide.RIGHT, -1, OdLaneType.driving, true, true )
//             .addWidthRecord( 0, 2, 0, 0, 0 );
//         roadD.getLaneSectionAt( 0 )
//             .addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );

//         const junctionIndex = openDrive.addJunction( "J", 1 );
//         const junction = openDrive.getJunctionById( 1 );

//         // connections
//         junction.addJunctionConnection( 0, roadA.id, roadC.id, "start" ).addJunctionLaneLink( 1, 1 );
//         junction.addJunctionConnection( 1, roadB.id, roadD.id, "end" ).addJunctionLaneLink( -1, -1 );

//         // 
//         tool.init();
//         tool.enable();

//         const output = new OdWriter().getOutput( openDrive );

//     } );

//     function create2x2LaneRoadIntersection ( length = 100 ) {

//         OdSourceFile.openDrive = new OpenDrive();

//         const road1 = OdSourceFile.openDrive.addRoad( '1', length, 1, -1 ); road1.addPlanView()
//         const road2 = OdSourceFile.openDrive.addRoad( '2', length, 2, -1 ); road2.addPlanView();

//         road1.addGeometryLine( 0, -50, 0, 0, length );
//         road2.addGeometryLine( 0, 0, -50, 1.57, length );

//         const roads = [ road1, road2 ];

//         roads.forEach( road => {

//             road.addLaneSection( 0, false ); const laneSection = road.getLastAddedLaneSection();

//             let leftLane = laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );
//             let centerLane = laneSection.addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );
//             let rightLane = laneSection.addLane( LaneSide.RIGHT, -1, OdLaneType.driving, true, true );

//             [ leftLane, centerLane, rightLane ].forEach( lane => lane.addWidthRecord( 0, 2, 0, 0, 0 ) );

//         } );


//         return roads;
//     }

//     function create3x3LaneRoadIntersection () {

//         OdSourceFile.openDrive = new OpenDrive();

//         const road1 = OdSourceFile.openDrive.addRoad( '1', 100, 1, -1 ); road1.addPlanView()
//         const road2 = OdSourceFile.openDrive.addRoad( '2', 100, 2, -1 ); road2.addPlanView();

//         road1.addGeometryLine( 0, -50, 0, 0, 100 );
//         road2.addGeometryLine( 0, 0, -50, 1.57, 100 );

//         const roads = [ road1, road2 ];

//         roads.forEach( road => {

//             road.addLaneSection( 0, false ); const laneSection = road.getLastAddedLaneSection();

//             let left2 = laneSection.addLane( LaneSide.LEFT, 2, OdLaneType.driving, true, true );
//             let left1 = laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );
//             let center = laneSection.addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );
//             let right1 = laneSection.addLane( LaneSide.RIGHT, -1, OdLaneType.driving, true, true );

//             [ left2, left1, center, right1 ].forEach( lane => lane.addWidthRecord( 0, 2, 0, 0, 0 ) );

//         } );

//         return roads;
//     }

//     function create4LaneFreewayIntersection () {

//         OdSourceFile.openDrive = new OpenDrive();

//         const road1 = OdSourceFile.openDrive.addRoad( '1', 100, 1, -1 ); road1.addPlanView()
//         const road2 = OdSourceFile.openDrive.addRoad( '2', 100, 2, -1 ); road2.addPlanView();

//         road1.addGeometryLine( 0, -50, 0, 0, 100 );
//         road2.addGeometryLine( 0, 0, -50, 1.57, 100 );

//         const roads = [ road1, road2 ];

//         roads.forEach( road => {

//             road.addLaneSection( 0, false ); const laneSection = road.getLastAddedLaneSection();

//             let left4 = laneSection.addLane( LaneSide.LEFT, 4, OdLaneType.driving, true, true );
//             let left3 = laneSection.addLane( LaneSide.LEFT, 3, OdLaneType.driving, true, true );
//             let left2 = laneSection.addLane( LaneSide.LEFT, 2, OdLaneType.driving, true, true );
//             let left1 = laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );
//             let center = laneSection.addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );

//             [ left4, left3, left2, left1, center ].forEach( lane => lane.addWidthRecord( 0, 2, 0, 0, 0 ) );

//         } );

//         return roads;
//     }

// } );
