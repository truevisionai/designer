// import { SelectPointCommand } from 'app/commands/select-point-command';
import { TvRoadCoord } from '../../modules/tv-map/models/tv-lane-coord';
import { Crosswalk, TvCornerRoad } from '../../modules/tv-map/models/tv-road-object';
import { BaseCommand } from '../../commands/base-command';
// import { CrosswalkTool, getSelectPointCommand } from './crosswalk-tool';



export class AddCrosswalkPointCommand extends BaseCommand {

	// private selectPointCommand: SelectPointCommand;
	private point: TvCornerRoad;

	constructor ( private crosswalk: Crosswalk, private coord: TvRoadCoord ) {

		super();

		const id = this.crosswalk.outlines[ 0 ].cornerRoad.length;

		const point = this.point = new TvCornerRoad( id, coord.road, coord.s, coord.t );

		// const tool = this.getTool<CrosswalkTool>();

		// this.selectPointCommand = getSelectPointCommand( tool, point, crosswalk );
	}

	execute (): void {

		this.crosswalk.addCornerRoad( this.point );

		// this.selectPointCommand.execute();

	}

	undo (): void {

		this.crosswalk.removeCornerRoad( this.point );

		// this.selectPointCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}
