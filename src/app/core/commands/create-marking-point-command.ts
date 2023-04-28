/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { BaseCommand } from './base-command';
import { MarkingPointTool } from '../tools/marking-point-tool';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';

export class CreateMarkingPointCommand extends BaseCommand {

	private marking: TvRoadMarking;

	constructor ( private tool: MarkingPointTool, marking: TvRoadMarking, private point: BaseControlPoint ) {

		super();

		this.marking = point.mainObject = marking.clone();

		this.marking.mesh.position.copy( point.position );

	}

	execute () {

		this.map.gameObject.add( this.marking.mesh );

	}

	undo () {

		this.map.gameObject.remove( this.marking.mesh );

		this.tool.shapeEditor.removeControlPoint( this.point );

	}

	redo (): void {

		this.tool.shapeEditor.pushControlPoint( this.point )

		this.map.gameObject.add( this.marking.mesh );

	}

}
