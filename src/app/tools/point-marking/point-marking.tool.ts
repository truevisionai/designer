/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { PointMarkingToolService } from './point-marking-tool.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { PointMarkingControlPoint } from './objects/point-marking-object';
import { ToolWithHandler } from '../base-tool-v2';
import { PointMarkingToolRoadVisualizer } from './visualizers/point-marking-tool-road-visualizer';
import { PointMarkingToolRoadController } from './controllers/point-marking-tool-road-controller';
import { PointMarkingCreationStrategy } from './point-marking-creation-strategy';
import { RoadPointDragHandler } from 'app/core/drag-handlers/road-point-drag-handler';
import { PointMarkingToolHintConfiguration } from './point-marking-tool-hints';
import { PointMarkingController } from './controllers/point-marking-point-controller';
import { PointMarkingVisualizer } from './visualizers/point-marking-point-visualizer';
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';


export class PointMarkingTool extends ToolWithHandler {

	public name: string = 'Point Marking Tool';

	public toolType = ToolType.PointMarkingTool;

	constructor ( private tool: PointMarkingToolService ) {

		super();

	}

	init (): void {

		this.addControllers();

		this.addVisualizers();

		this.addSelectors();

		this.addCreationStrategy( this.tool.base.injector.get( PointMarkingCreationStrategy ) );

		this.addDragHandler( PointMarkingControlPoint, this.tool.base.injector.get( RoadPointDragHandler ) );

		this.addAssetHandler( this.tool.base.injector.get( PointMarkingCreationStrategy ) );

		this.setHintConfig( PointMarkingToolHintConfiguration );

		super.init();

	}

	addSelectors (): void {

		// this.addSelectionStrategy( PointMarkingControlPoint, new PointMarkingSelector() );
		this.addSelectionStrategy( TvRoad, new RoadSelectionStrategy() );

	}

	addControllers (): void {

		this.addController( PointMarkingControlPoint, this.tool.base.injector.get( PointMarkingController ) );
		this.addController( TvRoad, this.tool.base.injector.get( PointMarkingToolRoadController ) );

	}

	addVisualizers (): void {

		this.addVisualizer( PointMarkingControlPoint, this.tool.base.injector.get( PointMarkingVisualizer ) );
		this.addVisualizer( TvRoad, this.tool.base.injector.get( PointMarkingToolRoadVisualizer ) );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

}
