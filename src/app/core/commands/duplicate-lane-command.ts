/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { BaseCommand } from './base-command';
import { TvConsole } from '../utils/console';
import { SnackBar } from 'app/services/snack-bar.service';
import { RoadFactory } from '../factories/road-factory.service';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';

export class DuplicateLaneCommand extends BaseCommand {

	private laneSection: TvLaneSection;

	private newLane: TvLane;

	private setInspectorCommand: SetInspectorCommand;

	constructor ( oldLane: TvLane ) {

		super();

		const newId = oldLane.isLeft ? oldLane.id + 1 : oldLane.id - 1;

		this.newLane = oldLane.clone( newId );

		this.laneSection = oldLane.laneSection;

		this.setInspectorCommand = new SetInspectorCommand( LaneInspectorComponent, this.newLane );
	}

	execute (): void {

		this.laneSection?.addLaneInstance( this.newLane, true );

		this.rebuild();

		this.setInspectorCommand.execute();
	}

	undo (): void {

		this.laneSection?.removeLaneById( this.newLane.id );

		this.rebuild();

		this.setInspectorCommand.undo();
	}

	redo (): void {

		this.laneSection?.addLaneInstance( this.newLane, true );

		this.rebuild();

		this.setInspectorCommand.redo();
	}

	rebuild (): void {

		if ( this.laneSection ) {

			RoadFactory.rebuildRoad( this.laneSection.road );

			this.laneSection.road?.hideHelpers();

		} else {

			TvConsole.error( 'Lane section not found' );

			SnackBar.error( 'Lane section not found' );
		}
	}

}
