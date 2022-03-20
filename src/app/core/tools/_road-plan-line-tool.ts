/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

// import { RoadPlanTool } from './road-plan-tool';
// import { Points } from 'three';
// import { OdAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/od-abstract-road-geometry';
// import { MultiCmdsCommand } from 'app/modules/tv-map/commands/multi-cmds-command';
// import { AddRoadCommand } from 'app/modules/tv-map/commands/add-road-command';
// import { AddRoadGeometryCommand } from 'app/modules/tv-map/commands/add-road-geometry-command';
// import { Geometry } from 'ngx-perfect-scrollbar';
// import { CommandHistory } from 'app/services/command-history';
// import { OdBuilder } from 'app/modules/tv-map/builders/od-builder.service';

// export class RoadPlanLineTool extends RoadPlanTool {

//     private cps: Points[] = [];

//     protected onControlPointSelected ( e: any ) {

//         try {

//             const road = this.map.getRoadById( e.userData.roadId );

//             if ( road == null ) return;

//             this.selectRoad( road );

//         } catch ( e ) {

//             // console.error( e );

//         }

//     }

//     protected onControlPointAdded ( e: Points ) {

//         this.cps.push( e );

//         // if ( this.cps.length % 2 === 0 ) {

//         //     const count = this.cps.length;
//         //     const points = this.cps;
//         //     const cp1 = points[ count - 2 ];
//         //     const cp2 = points[ count - 1 ];

//         //     const road = this.createRoad();

//         //     this.addDefaultLanes( road );

//         //     const geometry = this.helper.createLineGeometry( cp1, cp2, road );

//         //     const addRoad = new AddRoadCommand( road );
//         //     const addRoadGeom = new AddRoadGeometryCommand( road, geometry );

//         //     const multiCmd = new MultiCmdsCommand( [ addRoad, addRoadGeom ] );

//         //     CommandHistory.execute( multiCmd );

//         //     this.selectRoad( road );

//         //     this.cps.splice( 0, count );
//         // }

//         // if ( this.shapeEditor.controlPointCount % 3 === 0 ) {
//         //
//         //     const count = this.shapeEditor.controlPointCount;
//         //     const points = this.shapeEditor.controlPoints;
//         //     const cp1 = points[ count - 3 ];
//         //     const cp2 = points[ count - 2 ];
//         //     const cp3 = points[ count - 1 ];
//         //
//         //     const road = this.createRoad();
//         //
//         //     this.addDefaultLanes( road );
//         //
//         //     this.helper.createArcGeometry( cp1, cp2, cp3, road );
//         //
//         //     this.selectRoad( road );
//         //
//         // }
//     }

//     protected onControlPointMoved ( e: Points ) {

//         try {

//             const road = this.map.getRoadById( e.userData.roadId );

//             if ( road == null ) return;

//             const geometry = e.userData.geometry as OdAbstractRoadGeometry;

//             const index = e.userData.index;

//             this.helper.updateRoadGeometry( e, road, geometry, index );

//         } catch ( e ) {

//             // console.error( e );

//         }

//     }
// }