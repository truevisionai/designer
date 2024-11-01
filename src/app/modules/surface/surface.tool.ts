/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Surface } from 'app/map/surface/surface.model';
import { ToolType } from '../../tools/tool-types.enum';
import { SurfaceToolService } from './surface-tool.service';
import { ToolWithHandler } from '../../tools/base-tool-v2';
import { SurfaceController } from './controllers/surface-controller';
import { SurfaceControlPointController } from './controllers/surface-point-controller';
import { SurfaceCreationStrategy, SurfacePointCreationStrategy } from './services/surface-creation-strategy';
import { SurfacePointDragHandler, SurfacePointSelectionStrategy, SurfaceSelectionStrategy } from './services/surface-strategies';
import { SurfaceVisualizer } from './visualizers/surface-visualizer';
import { SimpleControlPoint } from 'app/objects/simple-control-point';
import { SurfaceToolTextureAssetHandler } from './services/surface-tool-texture-asset-handler';
import { TvSurfaceInspector } from './inspectors/surface.inspector';
import { SurfacePointVisualizer } from "./visualizers/surface-point-visualizer";

export class SurfaceTool extends ToolWithHandler {

	name: string = 'Surface Tool';

	toolType: ToolType = ToolType.Surface;

	constructor ( private tool: SurfaceToolService ) {

		super();

	}

	init (): void {

		this.addSelectionStrategy( SimpleControlPoint, new SurfacePointSelectionStrategy() );
		this.addSelectionStrategy( Surface, new SurfaceSelectionStrategy() );

		this.addCreationStrategy( this.tool.base.injector.get( SurfacePointCreationStrategy ) );
		this.addCreationStrategy( this.tool.base.injector.get( SurfaceCreationStrategy ) );

		this.addController( SimpleControlPoint, this.tool.base.injector.get( SurfaceControlPointController ) );
		this.addController( Surface, this.tool.base.injector.get( SurfaceController ) );

		this.addVisualizer( SimpleControlPoint, this.tool.base.injector.get( SurfacePointVisualizer ) );
		this.addVisualizer( Surface, this.tool.base.injector.get( SurfaceVisualizer ) );

		this.addDragHandler( SimpleControlPoint, this.tool.base.injector.get( SurfacePointDragHandler ) );

		this.addAssetHandler( this.tool.base.injector.get( SurfaceToolTextureAssetHandler ) );

		super.init();

	}

	onObjectUpdated ( object: Object ): void {

		if ( object instanceof TvSurfaceInspector ) {

			super.onObjectUpdated( object.surface );

		} else {

			super.onObjectUpdated( object );

		}

	}

}

