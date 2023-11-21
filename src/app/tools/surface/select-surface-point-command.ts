// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
// import { TvSurface } from '../../modules/tv-map/models/tv-surface.model';
// import { BaseCommand } from '../../commands/base-command';
// import { SurfaceTool } from './surface-tool';

// export class SelectSurfacePointCommand extends BaseCommand {

// 	private readonly oldPoint: DynamicControlPoint<TvSurface>;

// 	constructor ( private tool: SurfaceTool, private newPoint: DynamicControlPoint<TvSurface> ) {

// 		super();

// 		this.oldPoint = this.tool.point;

// 	}

// 	execute () {

// 		this.oldPoint?.unselect();

// 		this.tool.point = this.newPoint;

// 		this.newPoint?.select();

// 	}

// 	undo (): void {

// 		this.newPoint?.unselect();

// 		this.tool.point = this.oldPoint;

// 		this.oldPoint?.select();

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
