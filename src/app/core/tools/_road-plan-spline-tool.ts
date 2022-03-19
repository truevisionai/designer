/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { RoadPlanTool } from './road-plan-tool';
// import { Points, Vector3, Vector2, Line, Line3, ArrowHelper } from 'three';
// import { OdAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/od-abstract-road-geometry';
// import { ControlPoint } from 'app/modules/three-js/objects/control-point';
// import { OdArcGeometry } from 'app/modules/tv-map/models/geometries/od-arc-geometry';
// import { Maths } from 'app/utils/maths';
// import { SplineCurveEditor } from '../editors/spline-curve-editor';
// import { OdRoadReferenceLineBuilder } from 'app/modules/tv-map/builders/od-road-reference-line-builder';
// import { OdSides } from 'app/modules/tv-map/models/od-common.model';
// import { GameObject } from '../game-object';
// import { OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
// import { SceneService } from '../services/scene.service';
// import { OdLineGeometry } from 'app/modules/tv-map/models/geometries/od-line-geometry';
// import { OdRoad } from 'app/modules/tv-map/models/od-road.model';
// import { OdPosTheta } from 'app/modules/tv-map/models/od-pos-theta';

// export class RoadPlanSplineTool extends RoadPlanTool {

//     private cps: ControlPoint[] = [];

//     private builder: OdRoadReferenceLineBuilder;
//     private laneBuilder: OdLaneReferenceLineBuilder;

//     init () {

//         super.init();

//         // this.shapeEditor = new LineEditor(10);
//         this.shapeEditor = new SplineCurveEditor();
//         // this.shapeEditor = new CubicBezierCurveEditor();
//         // this.shapeEditor = new PolygonEditor();

//         this.helper.createRoadControlPoints( this.openDrive );

//         this.builder = new OdRoadReferenceLineBuilder( null );
//         this.laneBuilder = new OdLaneReferenceLineBuilder( null );

//     }

//     protected onControlPointSelected ( e: ControlPoint ) {

//         // try {

//         //     const road = this.openDrive.getRoadById( e.userData.roadId );

//         //     if ( road == null ) return;

//         //     this.selectRoad( road );

//         //     // this.cps.push( e );

//         // } catch ( e ) {

//         //     // console.error( e );

//         // }

//     }

//     protected onControlPointAdded ( e: ControlPoint ) {

//         this.cps.push( e );

//         if ( this.cps.length % 3 === 0 ) {

//             const count = this.cps.length;
//             const points = this.cps;
//             const cp1 = points[ count - 3 ];
//             const cp2 = points[ count - 2 ];
//             const cp3 = points[ count - 1 ];

//             const road = this.createRoad();

//             road.gameObject = new GameObject();

//             SceneService.add( road.gameObject );

//             this.addDefaultLanes( road );

//             this.helper.createArcGeometry( cp1, cp2, cp3, road );

//             // this.selectRoad( road );

//             // this.cps.splice( 0, this.cps.length );
//         }
//     }

//     protected onControlPointMoved ( e: ControlPoint ) {

//         this.printAngles();

//         // try {

//         //     const road = this.openDrive.getRoadById( e.userData.roadId );

//         //     if ( road == null ) return;

//         //     const geometry = e.userData.geometry as OdAbstractRoadGeometry;

//         //     const index = e.userData.index;

//         //     this.helper.updateRoadGeometry( e, road, geometry, index );

//         //     this.printAngles();

//         // } catch ( e ) {

//         //     console.error( e );

//         // }

//     }

//     private printAngles () {

//         if ( this.cps.length != 3 ) return;

//         const road = this.openDrive.getRoadById( 1 );

//         // remove previous geometries
//         road.geometries.splice( 0, road.geometries.length );

//         const p1 = this.cps[ 0 ].position;
//         const p2 = this.cps[ 1 ].position;
//         const p3 = this.cps[ 2 ].position;

//         const x = p1.x;
//         const y = p1.y;

//         // const a = Maths.angle( p1, p2, p3 ) * Maths.Rad2Deg;
//         // const b = Maths.angle( p2, p3, p1 ) * Maths.Rad2Deg;         /// actual angle of interest
//         // const c = Maths.angle( p3, p1, p2 ) * Maths.Rad2Deg;

//         const firstLineLength = p1.distanceTo( p2 );
//         const secondLineLength = p2.distanceTo( p3 );

//         // hdg of first line segment
//         const hdg = Math.atan2( p2.y - p1.y, p2.x - p1.x );

//         // hdg of second line segment
//         const hdg2 = Math.atan2( p3.y - p2.y, p3.x - p2.x );


//         let arcStartingPosition: Vector3;

//         // line + arc
//         if ( firstLineLength >= secondLineLength ) {

//             const t = ( firstLineLength - secondLineLength ) / firstLineLength;

//             const lineLength = firstLineLength - secondLineLength;

//             arcStartingPosition = Maths.linearInterpolationVector3( p1, p2, t );

//             const lineGeometry = road.planView.addGeometryLine( 0, x, y, hdg, lineLength ) as OdLineGeometry;

//             const end = lineGeometry.end;

//             this.createArcGeometryRight( lineGeometry.s2, end.x, end.y, arcStartingPosition, hdg, p3, hdg2, p2, road );

//         }
//         // only arc is required
//         else if ( secondLineLength > firstLineLength ) {

//             const t = firstLineLength / secondLineLength;

//             const lineLength = secondLineLength - firstLineLength;

//             const lineStartingPosition = Maths.linearInterpolationVector3( p2, p3, t );

//             const arcGeometry = this.createArcGeometryRight( 0, x, y, p1, hdg, lineStartingPosition, hdg2, p2, road );

//             const lineS = arcGeometry.s2;
//             const pos = new OdPosTheta();

//             arcGeometry.getCoords( lineS, pos );

//             const lineGeometry = road.planView.addGeometryLine( lineS, pos.x, pos.y, pos.hdg, lineLength );

//         }

//         // const geometry = road.geometries[ 0 ] as OdArcGeometry;


//         // const height = Maths.heightOfTriangle( p2, p3, p1 );
//         // const base = p2.distanceTo( p1 );
//         // const radius = ( height / 2 ) + ( ( base * base ) / ( 8 * height ) );
//         // let curvature = 1 / radius;
//         // make the curvature negative for right side i.e. for clockwise
//         // if ( Maths.direction( p2, p3, p1 ) === OdSides.RIGHT ) curvature *= -1;

//         // console.log( 180 - b, radius, curvature, firstHalfDistance, secondHalfDistance, d );

//         // geometry.curvature = curvature;

//         this.builder.clear( this.openDrive.getRoadById( 1 ) );
//         this.builder.buildRoad( this.openDrive.getRoadById( 1 ) );
//     }

//     private createArcGeometryRight (
//         s: number, x: number, y: number, p1: Vector3, hdg: number, p3: Vector3, hdg2: number, p2: Vector3, road: OdRoad ) {

//         const res = this.getRadius( p1, hdg, p3, hdg2 );
//         const radius = res.radius;
//         const center = res.center;

//         let curvature = 1 / radius;

//         const doCurvature = Maths.angle( center, p1, p3 );

//         const arcLength = doCurvature * radius;

//         // make the curvature negative for right side i.e. for clockwise
//         if ( Maths.direction( p2, p3, p1 ) === OdSides.RIGHT )
//             curvature *= -1;

//         const geometry = road.planView.addGeometryArc( s, x, y, hdg, arcLength, curvature );

//         road.length = s + arcLength;

//         return geometry;
//     }

//     private createArcGeometryLeft ( s: number, x: number, y: number, end: Vector3, hdg: number, p3: Vector3, hdg2: number, p2: Vector3, road: OdRoad ) {

//         const res = this.getRadius( end, hdg, p3, hdg2 );
//         const radius = res.radius;
//         const center = res.center;

//         let curvature = 1 / radius;

//         const doCurvature = Maths.angle( center, end, p3 );

//         const arcLength = doCurvature * radius;

//         // make the curvature negative for right side i.e. for clockwise
//         if ( Maths.direction( p2, p3, end ) === OdSides.RIGHT )
//             curvature *= -1;

//         const geometry = road.planView.addGeometryArc( s, x, y, hdg, arcLength, curvature );

//         road.length = s + arcLength;

//         return geometry;
//     }
//     private getRadius ( A: Vector3, line1Hdg: number, C: Vector3, line2Hdg: number ) {

//         // refPos.hdg - Maths.M_PI_2
//         // obj.gameObject.rotation.set( 0, 0, refPos.hdg - Maths.M_PI_2 );

//         const B = new Vector3(
//             A.x + Math.cos( line1Hdg + Maths.M_PI_2 ) * 1,
//             A.y + Math.sin( line1Hdg + Maths.M_PI_2 ) * 1
//         );

//         // const dir1 = new Vector3();
//         // this.createArrow( dir1.subVectors( line1P2, line1P1 ).normalize(), line1P1 );


//         const D = new Vector3(
//             C.x + Math.cos( line2Hdg + Maths.M_PI_2 ) * 1,
//             C.y + Math.sin( line2Hdg + Maths.M_PI_2 ) * 1
//         );

//         // const dir2 = new Vector3();
//         // this.createArrow( dir2.subVectors( line2P2, line2P1 ).normalize(), line2P2 );
//         // console.log( line1P1, line1P2, line1Hdg, line2P1, line2P2, line2Hdg );


//         const center = Maths.lineLineIntersection( A, B, C, D );

//         const radius = A.distanceTo( center );

//         // console.log( center, radius );

//         return {
//             radius,
//             center
//         };

//     }

//     private createArrow ( dir, origin ) {
//         // SceneService.add( new ArrowHelper( dir, origin, 10, 0xffff00 ) );
//     }
// }
