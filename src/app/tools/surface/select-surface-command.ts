// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
// import { TvSurface } from '../../modules/tv-map/models/tv-surface.model';
// import { BaseCommand } from '../../commands/base-command';
// import { SurfaceTool } from './surface-tool';

// export class SelectSurfaceCommand extends BaseCommand {

// 	private readonly oldPoint: DynamicControlPoint<TvSurface>;
// 	private readonly oldSurface: TvSurface;

// 	constructor ( private tool: SurfaceTool, private newSurface: TvSurface ) {

// 		super();

// 		this.oldSurface = this.tool.surface;
// 		this.oldPoint = this.tool.point;

// 	}

// 	execute () {

// 		this.oldPoint?.unselect();

// 		this.tool.surface = this.newSurface;

// 		this.tool.point = null;

// 	}

// 	undo (): void {

// 		this.oldPoint?.select();

// 		this.tool.point = this.oldPoint;

// 		this.tool.surface = this.oldSurface;

// 	}

// 	redo (): void {

// 		this.execute();

// 	}

// }
