/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { Vector3 } from 'three';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../../views/inspectors/road-inspector/road-inspector.component';
import { SceneService } from '../../services/scene.service';
import { RoadTool } from './road-tool';
import { OdBaseCommand } from '../../commands/od-base-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';

export class AddRoadPointCommand extends OdBaseCommand {

	private readonly newPoint: RoadControlPoint;
	private readonly oldPoint: RoadControlPoint;

	private setInspectorCommand: SetInspectorCommand;

	constructor ( private tool: RoadTool, private road: TvRoad, private position: Vector3 ) {

		super();

		this.oldPoint = this.tool.controlPoint;

		this.newPoint = this.addControlPoint( this.road, this.position );

		this.setInspectorCommand = new SetInspectorCommand( RoadInspector, {
			road: road,
			controlPoint: this.newPoint
		} );

	}

	execute (): void {

		this.tool.controlPoint = this.newPoint;

		this.setInspectorCommand.execute();

	}

	undo (): void {

		this.tool.controlPoint = this.oldPoint;

		this.removeControlPoint( this.road, this.newPoint );

		this.setInspectorCommand.undo();
	}

	redo (): void {

		this.road.addControlPoint( this.newPoint );

		this.rebuildRoad( this.road );

		this.setInspectorCommand.execute();
	}

	addControlPoint ( road: TvRoad, position: Vector3 ): RoadControlPoint {

		const point = road.addControlPointAt( position );

		if ( road.spline.controlPoints.length > 1 ) {
			this.rebuildRoad( road );
		}

		return point;
	}

	removeControlPoint ( road: TvRoad, cp: RoadControlPoint ) {

		road.spline.removeControlPoint( cp );

		SceneService.remove( cp );

		if ( road.spline.controlPoints.length === 0 ) {

			this.map.gameObject.remove( road.gameObject );

			// nothing to update, will throw error
			// road.spline.update();

			road.spline.hideLines();

			road.clearGeometries();

			road.clearNodes();

		} else if ( road.spline.controlPoints.length === 1 ) {

			this.map.gameObject.remove( road.gameObject );

			road.spline.update();

			road.spline.hideLines();

			road.clearGeometries();

			road.clearNodes();

		} else if ( road.spline.controlPoints.length > 1 ) {

			road.updateGeometryFromSpline();

			this.rebuildRoad( road );

		}
	}

	rebuildRoad ( road: TvRoad ) {

		this.map.gameObject.remove( road.gameObject );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		if ( !road.isJunction ) road.updateRoadNodes();

	}
}
