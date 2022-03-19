/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// describe( 'blah test', () => {

//     it( 'should run', () => {


//         // taking example values for a,b,c,d
//         // <width sOffset="0" a="0" b="0" c="0.0299" d="-0.000199"/>
//         const p0 = new Vector3( 0, 0, 0 );          // first point
//         const p1 = new Vector3( 100, 0, 0 );        // first tangent
//         const p2 = new Vector3( 0, 100, 0 );        // second tangent
//         const p3 = new Vector3( 100, 100, 0 );      // second point

//         // const t1 = Math.atan2( p1.y, p1.x );
//         // const t2 = Math.atan2( p2.y, p2.x );

//         const s1 = 0;
//         const s2 = 300;

//         const length = s2 - s1;

//         const pp0 = 3.5;
//         const pp1 = 15;
//         const pd0 = 0;
//         const pd1 = 0;

//         let a = pp0;
//         let b = pd0;
//         let c = ( -3 * pp0 ) + ( 3 * pp1 ) + ( -2 * pd0 ) + ( -1 * pd1 );
//         let d = ( 2 * pp0 ) + ( -2 * pp1 ) + ( 1 * pd0 ) + ( 1 * pd1 );

//         b /= length;
//         c /= length * length;
//         d /= length * length * length;

//         console.log( a, b, c, d );

//         // console.log( t1, t2 );

//         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         // const B = new Matrix4().set(
//         //     1, 0, 0, 0,
//         //     1, 1, 1, 1,
//         //     0, 1, 0, 0,
//         //     0, 1, 2, 3
//         // );

//         // const B_inverse = new Matrix4().getInverse( B );

//         // console.log( B );
//         // console.log( B_inverse );

//         // // const A_coeffs = new Matrix4().set(
//         // //     0, 0, 0, 0,
//         // //     0, 0, 0, 0,
//         // //     0.01, 0, 0, 0,
//         // //     0, 0, 0, 0
//         // // );

//         // const G_x = new Matrix4().set(
//         //     100, 0, 0, 0,
//         //     0, 0, 0, 0,
//         //     1, 0, 0, 0,
//         //     0, 0, 0, 0,
//         // );

//         // const A = B_inverse.multiply( G_x );

//         // console.log( "====================================================" );
//         // console.log( B );
//         // console.log( B_inverse );
//         // console.log( G_x );
//         // console.log( "========= coeffs ===================================" );
//         // console.log( A );

//         // return;

//         ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//         // const B = new Matrix4().set(
//         //     0, 0, 0, 1,
//         //     0.125, 0.25, 0.5, 1,
//         //     0.75, 1, 1, 0,
//         //     1, 1, 1, 1
//         // );

//         // const B_inverse = new Matrix4().getInverse( B );

//         // const G_x = new Matrix4().set(
//         //     0, 0, 0, 0,
//         //     10, 0, 0, 0,
//         //     0, 0, 0, 0,
//         //     0, 0, 0, 0
//         // );

//         // const A = B_inverse.multiply( G_x )

//         // console.log( A );

//         // console.log( B.multiply( A ) );

//         // return;

//         // const p0 = new Vector3( 0, 0, 0 );
//         // const p1 = new Vector3( 50, 0, 0 );
//         // const p2 = new Vector3( 50, 100, 0 );
//         // const p3 = new Vector3( 100, 100, 0 );

//         // // const h1 = new Vector4( 2, -2, 1, 1 );
//         // // const h2 = new Vector4( -3, -3, -2, 1 );
//         // // const h3 = new Vector4( 0, 0, 1, 0 );
//         // // const h4 = new Vector4( 1, 0, 0, 0 );

//         // // const hh1 = new Vector4().set(2, -2, 1, 1).applyMatrix4();

//         // const m4 = new Matrix4();

//         // // hermite curve 
//         // // m4.set(
//         // //     2, -2, 1, 1,
//         // //     -3, 3, -2, 1,
//         // //     0, 0, 1, 0,
//         // //     1, 0, 0, 0
//         // // );

//         // // // hermite curve 
//         // // m4.set(
//         // //     2, -2, 1, 1,
//         // //     -3, 3, -2, 1,
//         // //     0, 0, 1, 0,
//         // //     1, 0, 0, 0
//         // // );

//         // // m4.set(
//         // //     0, 0, 0, 1,
//         // //     1, 1, 1, 1,
//         // //     0, 0, 1, 0,
//         // //     3, 2, 1, 0
//         // // );

//         // // curve with midpoint
//         // m4.set(
//         //     -4, 0, -4, 4,
//         //     8, -4, 6, -4,
//         //     -5, 4, -2, 1,
//         //     1, 0, 0, 0
//         // );

//         // const m5 = new Matrix4().set(
//         //     0, 0, 0, 0,
//         //     1, 0, 0, 0,
//         //     0, 0, 0, 0,
//         //     0, 0, 0, 0
//         // );

//         // const m6 = new Matrix4().set(
//         //     1, 0, 0, 0,
//         //     0, 0, 0, 0,
//         //     0, 0, 0, 0,
//         //     0, 0, 0, 0
//         // );


//         // console.log( m4.multiply( m5 ) );

//         // const points = [ p0, p1, p2, p3 ];

//         // const curve = ( new ParametricPolynomial( points ) );

//         // curve.update();

//         // console.log( curve.getCoefficents() );
//         // console.log( curve.getCoefficent() );

//     } );

// } )

// // describe( 'AutoSpline test', () => {

// //     let curve: AutoSpline;

// //     beforeEach( () => TestBed.configureTestingModule( {} ) );

// //     beforeEach( () => {
// //         curve = new AutoSpline();
// //     } );

// //     interface DOT {
// //         id: number,
// //         roadId: number,
// //         laneId: number,
// //         direction: 'forward' | 'backward',
// //         type: 'start' | 'end',
// //         position: Vector3
// //     };

// //     interface CONNECTION {
// //         id: number,
// //         incomingRoad: number,
// //         outgoingRoad: number,
// //         point: 'start' | 'end',
// //         links: LINK[]
// //     }

// //     interface LINK {
// //         from: number,
// //         to: number,
// //     }

// //     // TODO:
// //     // 1. it should give correct lines, arc based points

// //     // 2. it should give correct points based on lines, arcs
// //     // it( 'it should give correct points based on lines', () => {

// //     //     const road = new OdRoad( 'road', 10, 1, 0 );

// //     //     road.addPlanView();

// //     //     // road.addGeometryLine( 0, 0, 0, 1, 10 );
// //     //     road.addGeometryArc( 0, 0, 0, 0, 10, 0.001 );

// //     //     // road.getGeometryCoords(0, o)

// //     //     const odPosTheta = new OdPosTheta();

// //     //     const points: Vector2[] = [];

// //     //     for ( let s = 0; s < road.length; s++ ) {

// //     //         road.getGeometryCoords( s, odPosTheta );

// //     //         // console.log( odPosTheta );

// //     //         points.push( odPosTheta.toVector2() );
// //     //     }

// //     //     const planView = new OdPlaneView();

// //     //     let prevHdg = null;
// //     //     let prevCurvature = null;

// //     //     for ( let i = 2; i < points.length; i++ ) {

// //     //         const p0 = points[ i - 2 ];
// //     //         const p1 = points[ i - 1 ];
// //     //         const p2 = points[ i ];

// //     //         const d = p0.distanceTo( p1 );

// //     //         const hdg = new THREE.Vector2().subVectors( p1, p0 ).angle();
// //     //         const hdg2 = new THREE.Vector2().subVectors( p2, p1 ).angle();

// //     //         const curvature = Math.fround( hdg - prevHdg );
// //     //         const curvature2 = Math.fround( hdg2 - hdg );

// //     //         // same hdg, same curvature == line
// //     //         // diff hdg, same curvature == arc

// //     //         // line
// //     //         if ( Maths.approxEquals( hdg, hdg2 ) ) {

// //     //             // continue adding to the road
// //     //             console.log( 'is line', hdg, hdg2 );

// //     //         } else {

// //     //             // create new road
// //     //             console.log( 'is curved', curvature, hdg, hdg2 );

// //     //         }

// //     //         console.log( d, hdg );

// //     //         prevHdg = hdg;
// //     //         prevCurvature = curvature;
// //     //     }

// //     // } );

// //     // it( 'it should give correct connection count for 2x2 lane road intersection', () => {

// //     //     const roads = [];

// //     //     const road1 = new OdRoad( 'road1', 100, 1, -1 );
// //     //     const road2 = new OdRoad( 'road1', 100, 2, -1 );

// //     //     roads.push( road1 );
// //     //     roads.push( road2 );

// //     //     const dots: DOT[] = []

// //     //     let id = 1;

// //     //     roads.forEach( road => {

// //     //         // add 2 lanes on each road
// //     //         road.addLaneSection( 0, false );

// //     //         const laneSection = road.getLastAddedLaneSection();

// //     //         laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );
// //     //         laneSection.addLane( LaneSide.CENTER, 0, OdLaneType.driving, true, true );
// //     //         laneSection.addLane( LaneSide.RIGHT, -1, OdLaneType.driving, true, true );

// //     //         road1.laneSections[ 0 ].getRightLanes().forEach( lane => {
// //     //             dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'start', direction: 'backward', position: null } )
// //     //             dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'end', direction: 'backward', position: null } )
// //     //         } )

// //     //         road1.laneSections[ 0 ].getLeftLanes().forEach( lane => {
// //     //             dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'start', direction: 'forward', position: null } )
// //     //             dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'end', direction: 'forward', position: null } )
// //     //         } )

// //     //     } );

// //     //     const connections = getConnections( dots );

// //     //     expect( connections.length ).toBe( 12 );

// //     // } )

// //     it( 'it should give correct connection count for 4x4 highway lane road intersection', () => {

// //         const roads = [];

// //         const road1 = new OdRoad( 'road1', 100, 1, -1 );
// //         const road2 = new OdRoad( 'road1', 100, 2, -1 );

// //         roads.push( road1 );
// //         roads.push( road2 );

// //         const dots: DOT[] = []

// //         let id = 1;

// //         roads.forEach( road => {

// //             // add 2 lanes on each road
// //             road.addLaneSection( 0, false );

// //             const laneSection = road.getLastAddedLaneSection();

// //             laneSection.addLane( LaneSide.LEFT, 3, OdLaneType.driving, true, true );
// //             laneSection.addLane( LaneSide.LEFT, 4, OdLaneType.driving, true, true );
// //             laneSection.addLane( LaneSide.LEFT, 2, OdLaneType.driving, true, true );
// //             laneSection.addLane( LaneSide.LEFT, 1, OdLaneType.driving, true, true );

// //             // road1.laneSections[ 0 ].getRightLanes().forEach( lane => {
// //             //     dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'start', direction: 'backward', position: null } )
// //             //     dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'end', direction: 'backward', position: null } )
// //             // } )

// //             road.laneSections[ 0 ].getLeftLanes().forEach( lane => {
// //                 dots.push( { id: id++, roadId: road.id, laneId: lane.id, type: 'start', direction: 'forward', position: null } )
// //                 dots.push( { id: id++, roadId: road.id + 2, laneId: lane.id, type: 'end', direction: 'forward', position: null } )
// //             } )

// //         } );

// //         roads.push( new OdRoad( 'road3', 100, 3, -1 ) );
// //         roads.push( new OdRoad( 'road4', 100, 4, -1 ) );

// //         const connections = getConnections( dots, roads );



// //         expect( connections.length ).toBe( 10 );

// //     } )

// //     function getConnections ( points: DOT[], roads: OdRoad[] ) {

// //         const connections: CONNECTION[] = [];

// //         const startPoints = points.filter( d => d.type === 'start' );
// //         const endPoints = points.filter( d => d.type === 'end' );


// //         const blah: [][] = [];

// //         // left turn
// //         roads.forEach( road => {

// //             const roadStartPoints = points.filter( d => d.type == 'start' && d.roadId == road.id );

// //             // start connections
// //             roadStartPoints.forEach( roadStartPoint => {

// //                 // straight connection
// //                 // 1 connection for same lane and road to 
// //                 const pointOnSameLaneRoad = points.find( other => {
// //                     return other.roadId === roadStartPoint.roadId + 2 &&    // + 2 because continusing road is at + 2
// //                         other.laneId == roadStartPoint.laneId &&
// //                         other.id != roadStartPoint.id &&
// //                         other.type != roadStartPoint.type
// //                 } )

// //                 if ( pointOnSameLaneRoad ) {

// //                     const links: LINK[] = []

// //                     connections.push( {
// //                         id: 0,
// //                         incomingRoad: roadStartPoint.roadId,
// //                         outgoingRoad: pointOnSameLaneRoad.roadId,
// //                         point: 'start',
// //                         links: []
// //                     } );
// //                 }

// //             } );

// //             // console.log( road.id );

// //             // // find lane with highest id
// //             // const leftMostPoint = startPoints.filter( p => p.roadId == road.id ).reduce( ( x, y ) => {
// //             //     return x.laneId > y.laneId ? x : y;
// //             // } )

// //             // const leftMostPointOnNextRoad = endPoints.filter( p => p.roadId != road.id ).reduce( ( x, y ) => {
// //             //     return x.laneId > y.laneId ? x : y;
// //             // } )

// //             // find lane with lowest id
// //             // const rightMostPoint = startPoints.filter( p => p.roadId == road.id ).reduce( ( x, y ) => {
// //             //     return x.laneId < y.laneId ? x : y;
// //             // } )

// //             // console.log( 'left', leftMostPoint, leftMostPointOnNextRoad );
// //             // console.log( 'right', rightMostPoint );

// //         } );

// //         // startPoints.forEach( point => {

// //         //     // left turn
// //         //     const pointForLeftTurn = dots.find( other => {
// //         //         return other.direction == point.direction &&
// //         //             other.roadId != point.roadId &&
// //         //             other.laneId == point.laneId &&
// //         //             other.type != point.type
// //         //     } )

// //         //     connections.push( {
// //         //         incomingRoad: pointForLeftTurn.roadId,
// //         //         outgoingRoad: pointForLeftTurn.laneId,
// //         //         point: pointForLeftTurn.type,
// //         //     } );

// //         // } )

// //         // for ( let i = 0; i < startPoints.length; i++ ) {

// //         //     const startingDot = startPoints[ i ];

// //         //     // console.log( dot, sameDot )

// //         //     // if direction 
// //         //     // match start with end; ignore end
// //         //     // start from right
// //         //     // total dots are lanes * 2
// //         //     // not from same road

// //         //     // dots from other roads
// //         //     const otherDots = dots.filter( d => d.roadId != startingDot.roadId );

// //         //     otherDots.forEach( other => {

// //         //         const laneConnectExits = connections.find( connection => {
// //         //             return connection.road == startingDot.roadId &&
// //         //                 connection.lane == startingDot.laneId
// //         //         } );

// //         //         if (
// //         //             other.type != startingDot.type &&
// //         //         ) {
// //         //             connections.push( {
// //         //                 road: other.roadId,
// //         //                 lane: other.laneId,
// //         //                 type: other.type,
// //         //             } );
// //         //         }

// //         //     } );

// //         // }

// //         return connections;
// //     }


// // } );

// /////////////////////////////////////////
// // PSE

// // // left road 1
// // 4F S
// // 3F S
// // 2F S
// // 1F S

// // // right road 3
// // 4F E
// // 3F E
// // 2F E
// // 1F E

// // // top road 4
// // 4F E
// // 3F E
// // 2F E
// // 1F E

// // // bottom road 2
// // 4F S
// // 3F S
// // 2F S
// // 1F S

// // ===========================================================

// // in auto : 
// // max 1 left turn 
// // and 
// // max 1 right turn per road
// // for outgoing traffic

// // left turns 
// // ---------
// // left most (highest id) lane of current road
// // with left most (highest) lane of next road
// // start point with endpoint


// // right turns
// // -----------
// // right most lane (lowest id) of current road
// // with right most (lowest id) lane of next road
// // start point with endpoint
