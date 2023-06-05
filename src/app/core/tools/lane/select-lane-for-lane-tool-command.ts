import { SelectMainObjectCommand } from 'app/core/commands/select-point-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { LaneTool } from './lane-tool';

export class SelectLaneForLaneToolCommand extends SelectMainObjectCommand {

	private setInspectorCommand: SetInspectorCommand;

	constructor ( tool: LaneTool, lane: TvLane, private laneDirectionHelper: OdLaneDirectionBuilder ) {

		super( tool, lane );

		this.setInspectorCommand = new SetInspectorCommand( LaneInspectorComponent, lane );

	}

	private get newLane () {

		return this.newMainObject as TvLane;

	}

	private get oldLane () {

		return this.oldMainObject as TvLane;

	}

	execute (): void {

		super.execute();

		this.setInspectorCommand.execute();

		if ( this.newLane ) {

			this.laneDirectionHelper?.clear();
			this.laneDirectionHelper?.drawSingleLane( this.newLane.laneSection.road, this.newLane );

		} else {

			this.laneDirectionHelper?.clear();

		}

	}

	undo (): void {

		super.undo();

		this.setInspectorCommand.undo();

		if ( this.oldLane ) {

			this.laneDirectionHelper?.clear();
			this.laneDirectionHelper?.drawSingleLane( this.oldLane.laneSection.road, this.oldLane );

		} else {

			this.laneDirectionHelper?.clear();

		}
	}

	redo (): void {

		super.redo();

	}

}
