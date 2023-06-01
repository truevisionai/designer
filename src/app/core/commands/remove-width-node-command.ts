/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneWidthInspector } from 'app/views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';

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

		SceneService.remove( this.node );

		this.rebuild( this.node.road );

		( new SetInspectorCommand( LaneWidthInspector, { lane: this.node.lane } ) ).execute();
	}

	undo (): void {

		this.node.lane.addWidthRecordInstance( this.node.laneWidth );

		this.node.updateLaneWidthValues();

		SceneService.add( this.node );

		this.rebuild( this.node.road );

		( new SetInspectorCommand( LaneWidthInspector, { lane: this.node.lane, node: this.node } ) ).execute();

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		SceneService.removeWithChildren( road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		this.laneHelper.drawRoad( road, LineType.DASHED, true );
	}

}
