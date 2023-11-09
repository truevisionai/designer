// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
// import { Vector3 } from 'three';
// import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
// import { BaseCommand } from '../../commands/base-command';
// import { SceneService } from '../../services/scene.service';
// import { SurfaceTool } from './surface-tool';

// export class AddSurfacePointCommand extends BaseCommand {

// 	private readonly oldPoint?: DynamicControlPoint<TvSurface>;
// 	private readonly newPoint: DynamicControlPoint<TvSurface>;

// 	constructor ( private tool: SurfaceTool, private surface: TvSurface, private position: Vector3 ) {

// 		super();

// 		this.oldPoint = this.tool.point;

// 		this.newPoint = new DynamicControlPoint( surface, position );
// 	}

// 	execute () {

// 		this.oldPoint?.unselect();

// 		this.tool.point = this.newPoint;

// 		this.newPoint?.select();

// 		this.surface.addControlPoint( this.newPoint );

// 		SceneService.addToMain( this.newPoint );
// 	}

// 	undo (): void {

// 		this.oldPoint?.select();

// 		this.tool.point = this.oldPoint;

// 		this.newPoint?.unselect();

// 		this.surface.removeControlPoint( this.newPoint );

// 		SceneService.removeFromMain( this.newPoint );
// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }

