// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
// import { BaseCommand } from '../../commands/base-command';
// import { MarkingPointTool } from './marking-point-tool';
// import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

// export class CreateMarkingPointCommand extends BaseCommand {

// 	private marking: TvRoadMarking;

// 	constructor ( private tool: MarkingPointTool, marking: TvRoadMarking, private point: AbstractControlPoint ) {

// 		super();

// 		this.marking = point.mainObject = marking.clone();

// 		this.marking.mesh.position.copy( point.position );

// 	}

// 	execute () {

// 		this.map.gameObject.add( this.marking.mesh );

// 	}

// 	undo () {

// 		this.map.gameObject.remove( this.marking.mesh );

// 		this.tool.shapeEditor.removeControlPoint( this.point );

// 	}

// 	redo (): void {

// 		this.tool.shapeEditor.pushControlPoint( this.point );

// 		this.map.gameObject.add( this.marking.mesh );

// 	}

// }
