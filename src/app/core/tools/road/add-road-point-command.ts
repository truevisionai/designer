/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { Vector3 } from 'three';
import { TvRoad } from '../../../modules/tv-map/models/tv-road.model';
import { RoadInspector } from '../../../views/inspectors/road-inspector/road-inspector.component';
import { RoadTool } from './road-tool';
import { OdBaseCommand } from '../../commands/od-base-command';
import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { RoadFactory } from 'app/core/factories/road-factory.service';

export class AddRoadPointCommand extends OdBaseCommand {

	private point: RoadControlPoint;
	private selectPointCommand: SelectPointCommand;

	constructor ( tool: RoadTool, private road: TvRoad, position: Vector3 ) {

		super();

		this.point = RoadFactory.createRoadControlPoint( road, position );

		this.selectPointCommand = new SelectPointCommand( tool, this.point, RoadInspector, {
			road: road,
			controlPoint: this.point
		} )
	}

	execute (): void {

		this.selectPointCommand.execute();

		this.road.addControlPoint( this.point );

		this.rebuildRoad( this.road );
	}

	undo (): void {

		this.selectPointCommand.undo();

		this.road.removeControlPoint( this.point );

		this.rebuildRoad( this.road );

	}

	redo (): void {

		this.execute();

	}

	rebuildRoad ( road: TvRoad ) {

		this.map.gameObject.remove( road.gameObject );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		if ( !road.isJunction ) road.updateRoadNodes();

	}
}
