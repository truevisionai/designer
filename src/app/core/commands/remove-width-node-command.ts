/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneWidthInspector } from 'app/views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';
import { MapEvents } from 'app/events/map-events';

export class RemoveWidthNodeCommand extends BaseCommand {

	constructor (
		private node: LaneWidthNode,
		private laneHelper?: OdLaneReferenceLineBuilder
	) {

		super();

		if ( !laneHelper ) {

			this.laneHelper = new OdLaneReferenceLineBuilder();

		}

	}

	execute (): void {

		const index = this.node.lane.width.findIndex( laneWidth => laneWidth.uuid === this.node.laneWidth.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return;

		this.node.lane.width.splice( index, 1 );

		this.node.updateLaneWidthValues();

		SceneService.removeToolObject( this.node );

		this.rebuild( this.node.road );

		( new SetInspectorCommand( LaneWidthInspector, this.node.laneWidth ) ).execute();
	}

	undo (): void {

		this.node.lane.addWidthRecordInstance( this.node.laneWidth );

		this.node.updateLaneWidthValues();

		SceneService.addToolObject( this.node );

		this.rebuild( this.node.road );

		( new SetInspectorCommand( LaneWidthInspector, this.node.laneWidth ) ).execute();

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		MapEvents.laneUpdated.emit( this.node.lane );

		this.laneHelper.drawRoad( road, LineType.SOLID, true );
	}

}
