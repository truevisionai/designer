/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { RoadPlanTool } from './road-plan-tool';
// import { Points } from 'three';
// import { OdAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/od-abstract-road-geometry';
// import { ControlPoint } from 'app/modules/three-js/objects/control-point';
// import { OdArcGeometry } from 'app/modules/tv-map/models/geometries/od-arc-geometry';
// import { Maths } from 'app/utils/maths';

// export class RoadPlanArcTool extends RoadPlanTool {

//     private cps: ControlPoint[] = [];

//     protected onControlPointSelected ( e: ControlPoint ) {

//         try {

//             const road = this.map.getRoadById( e.userData.roadId );

//             if ( road == null ) return;

//             this.selectRoad( road );

//             // this.cps.push( e );

//         } catch ( e ) {

//             // console.error( e );

//         }

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

//             this.addDefaultLanes( road );

//             this.helper.createArcGeometry( cp1, cp2, cp3, road );

//             this.selectRoad( road );

//             this.cps.splice( 0, this.cps.length );
//         }
//     }

//     protected onControlPointMoved ( e: ControlPoint ) {

//         try {

//             const road = this.map.getRoadById( e.userData.roadId );

//             if ( road == null ) return;

//             const geometry = e.userData.geometry as OdAbstractRoadGeometry;

//             const index = e.userData.index;

//             this.helper.updateRoadGeometry( e, road, geometry, index );

//             const arc = geometry as OdArcGeometry;

//         } catch ( e ) {

//             // console.error( e );

//         }

//     }
// }