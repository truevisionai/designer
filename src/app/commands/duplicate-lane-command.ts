/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SnackBar } from 'app/services/snack-bar.service';
// import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { TvLane } from '../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../modules/tv-map/models/tv-lane-section';
import { TvConsole } from '../core/utils/console';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';
import { MapEvents } from 'app/events/map-events';

export class DuplicateLaneCommand extends BaseCommand {

	private laneSection: TvLaneSection;

	private newLane: TvLane;

	// private setInspectorCommand: SetInspectorCommand;

	constructor ( oldLane: TvLane ) {

		super();

		const newId = oldLane.isLeft ? oldLane.id + 1 : oldLane.id - 1;

		this.newLane = oldLane.clone( newId );

		this.laneSection = oldLane.laneSection;

		// this.setInspectorCommand = new SetInspectorCommand( LaneInspectorComponent, this.newLane );
	}

	execute (): void {

		this.laneSection?.addLaneInstance( this.newLane, true );

		MapEvents.laneCreated.emit( this.newLane );

		// this.rebuild();

		// this.setInspectorCommand.execute();
	}

	undo (): void {

		this.laneSection?.removeLane( this.newLane );

		MapEvents.laneRemoved.emit( this.newLane );

		// this.rebuild();

		// this.setInspectorCommand.undo();
	}

	redo (): void {

		this.execute();

		// this.rebuild();

		// this.setInspectorCommand.redo();
	}

	rebuild (): void {

		if ( this.laneSection ) {

			this.laneSection.road?.hideHelpers();

		} else {

			TvConsole.error( 'Lane section not found' );

			SnackBar.error( 'Lane section not found' );
		}
	}

}
