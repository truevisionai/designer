/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { MapEvents } from 'app/events/map-events';

export class AddWidthNodeCommand extends BaseCommand {

	constructor (
		private node: LaneWidthNode,
		private laneHelper: OdLaneReferenceLineBuilder
	) {

		super();

	}

	execute (): void {

		this.node.updateLaneWidthValues();

		SceneService.addToolObject( this.node );

		this.rebuild( this.node.road );

	}

	undo (): void {

		const index = this.node.lane.width.findIndex( laneWidth => laneWidth.uuid === this.node.laneWidth.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return;

		this.node.lane.width.splice( index, 1 );

		this.node.updateLaneWidthValues();

		SceneService.removeToolObject( this.node );

		this.rebuild( this.node.road );

	}

	redo (): void {

		this.node.lane.addWidthRecordInstance( this.node.laneWidth );

		this.node.updateLaneWidthValues();

		SceneService.addToolObject( this.node );

		this.rebuild( this.node.road );

	}

	rebuild ( road: TvRoad ): void {

		MapEvents.laneUpdated.emit( this.node.lane );

		// not sure which is better
		// this.laneHelper.redraw();
		this.laneHelper.drawRoad( road, LineType.SOLID, true );
	}

}
