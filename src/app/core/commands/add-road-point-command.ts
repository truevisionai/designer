/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from 'app/core/inspector';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { OdBaseCommand } from './od-base-command';
import { RoadTool } from '../tools/road-tool';
import { Vector3 } from 'three';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';

export class AddRoadPointCommand extends OdBaseCommand {

	private newPoint: RoadControlPoint;

	private oldPoint: RoadControlPoint;;

	constructor ( private tool: RoadTool, private road: TvRoad, private position: Vector3 ) {

		super();

		this.oldPoint = this.tool.controlPoint;

		this.newPoint = this.tool.controlPoint = this.addControlPoint( this.road, this.position )

	}

	execute (): void {

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.newPoint
		} );

	}

	undo (): void {

		this.removeControlPoint( this.road, this.newPoint );

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.oldPoint
		} );

	}

	redo (): void {

		this.road.addControlPoint( this.newPoint );

		this.rebuildRoad( this.road );

		AppInspector.setInspector( RoadInspector, {
			road: this.road,
			controlPoint: this.newPoint
		} );
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

			road.updateGeometryFromSpline()

			this.rebuildRoad( road );

		}
	}

	rebuildRoad ( road: TvRoad ) {

		this.map.gameObject.remove( road.gameObject );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		if ( !road.isJunction ) road.updateRoadNodes();

	}
}
