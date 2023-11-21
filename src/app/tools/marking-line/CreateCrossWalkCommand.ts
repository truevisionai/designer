// // import { SelectPointCommand } from 'app/commands/select-point-command';
// import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
// import { BaseCommand } from '../../commands/base-command';
// import { Crosswalk } from "../../modules/tv-map/models/objects/crosswalk";
// import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";
// // import { CrosswalkTool, getSelectPointCommand } from './crosswalk-tool';



// export class CreateCrossWalkCommand extends BaseCommand {

// 	private readonly crosswalk: Crosswalk;
// 	// private readonly selectPointCommand: SelectPointCommand;

// 	constructor ( private roadCoord: TvRoadCoord ) {

// 		super();

// 		const point = new TvCornerRoad( 0, roadCoord.road, roadCoord.s, roadCoord.t, roadCoord.z );

// 		this.crosswalk = new Crosswalk( roadCoord.s, roadCoord.t );

// 		this.crosswalk.addCornerRoad( point );

// 		// const tool = this.getTool<CrosswalkTool>();

// 		// this.selectPointCommand = getSelectPointCommand( tool, point, this.crosswalk );

// 	}

// 	execute (): void {

// 		this.roadCoord.road.gameObject.add( this.crosswalk );

// 		this.roadCoord.road.addRoadObjectInstance( this.crosswalk );

// 		// this.selectPointCommand.execute();

// 	}

// 	undo (): void {

// 		this.roadCoord.road.gameObject.remove( this.crosswalk );

// 		this.roadCoord.road.removeRoadObjectById( this.crosswalk.attr_id );

// 		// this.selectPointCommand.undo();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
