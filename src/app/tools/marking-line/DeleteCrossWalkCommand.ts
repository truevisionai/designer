// import { SetInspectorCommand } from 'app/commands/set-inspector-command';
// import { SceneService } from 'app/services/scene.service';
// import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
// import { BaseCommand } from '../../commands/base-command';
// import { Crosswalk } from "../../modules/tv-map/models/objects/crosswalk";



// export class DeleteCrossWalkCommand extends BaseCommand {

// 	private inspector: SetInspectorCommand;
// 	private road: TvRoad;

// 	constructor ( private crosswalk: Crosswalk ) {

// 		super();

// 		this.road = crosswalk.road;
// 		this.inspector = new SetInspectorCommand( null, null );
// 	}

// 	execute (): void {

// 		this.road?.gameObject.remove( this.crosswalk );

// 		SceneService.removeFromMain( this.crosswalk );

// 		this.road?.removeRoadObjectById( this.crosswalk.attr_id );

// 		this.inspector.execute();

// 	}

// 	undo (): void {

// 		this.road?.gameObject.add( this.crosswalk );

// 		this.road?.addRoadObjectInstance( this.crosswalk );

// 		this.inspector.undo();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
