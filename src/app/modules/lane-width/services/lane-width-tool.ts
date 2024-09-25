/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../../map/models/tv-lane';
import { ToolType } from '../../../tools/tool-types.enum';
import { LaneWidthToolService } from './lane-width-tool.service';
import { LaneWidthPointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { TvRoad } from "../../../map/models/tv-road.model";
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { ToolWithHandler } from '../../../tools/base-tool-v2';
import { SelectLaneOverlayStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { LaneWidthInspector } from './lane-width-node-inspector';
import { LaneWidthLineSelectionStrategy } from 'app/core/strategies/select-strategies/object-name-strategy';
import { LaneWidthLineController } from "../controllers/lane-width-line-controller";
import { LaneWidthLineVisualizer } from "../visualizers/lane-width-line-visualizer";
import { LaneWidthPointController } from "../controllers/lane-width-point-controller";
import { LaneWidthPointVisualizer } from "../visualizers/lane-width-point-visualizer";
import { LaneWidthLine } from "../objects/lane-width-line";
import { LaneWidthPoint } from "../objects/lane-width-point";
import { LaneWidthLaneController } from '../controllers/lane-width-lane-controller';
import { LaneWidthRoadController } from '../controllers/lane-width-road-controller';
import { laneWidthToolHints } from './lane-width-tool-hints';
import { LaneWidthRoadVisualizer } from "../visualizers/lane-width-road-visualizer";
import { LaneWidthPointDragHandler } from '../controllers/lane-width-point-drag-handler';
import { LaneWidthLineDragHandler } from '../controllers/lane-width-line-drag-handler';
import { LaneWidthCreationStrategy } from './lane-width-creation-strategy';
import { LaneWidthNode } from '../objects/lane-width-node';
import { LaneWidthNodeController } from '../controllers/lane-width-node-controller';
import { LaneWidthNodeVisualizer } from '../visualizers/lane-width-node-visualizer';
import { EmptyVisualizer } from 'app/core/visualizers/empty-visualizer';
import { EmptyController } from 'app/core/controllers/empty-controller';
import { Injectable } from '@angular/core';

@Injectable()
export class LaneWidthTool extends ToolWithHandler {

	public name: string = 'LaneWidth';

	public toolType = ToolType.LaneWidth;

	constructor ( private tool: LaneWidthToolService ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.addStrategies();

		this.addControllers();

		this.addVisualizers();

		this.setHintConfig( laneWidthToolHints );

		this.addCreationStrategy( this.tool.base.injector.get( LaneWidthCreationStrategy ) );

		super.init();

	}

	addStrategies (): void {

		this.addSelectionStrategy( LaneWidthLine, new LaneWidthLineSelectionStrategy() );
		this.addSelectionStrategy( LaneWidthPoint, new LaneWidthPointSelectionStrategy() );
		this.addSelectionStrategy( TvLane, new SelectLaneOverlayStrategy() );
		this.addSelectionStrategy( TvRoad, new RoadSelectionStrategy() );

	}

	addVisualizers (): void {

		this.addVisualizer( LaneWidthLine, this.tool.base.injector.get( LaneWidthLineVisualizer ) );
		this.addVisualizer( LaneWidthPoint, this.tool.base.injector.get( LaneWidthPointVisualizer ) );
		this.addVisualizer( LaneWidthNode, this.tool.base.injector.get( LaneWidthNodeVisualizer ) );
		this.addVisualizer( TvLane, this.tool.base.injector.get( EmptyVisualizer ) );
		this.addVisualizer( TvRoad, this.tool.base.injector.get( LaneWidthRoadVisualizer ) );

	}

	addControllers (): void {

		this.addController( LaneWidthLine, this.tool.base.injector.get( LaneWidthLineController ) );
		this.addController( LaneWidthPoint, this.tool.base.injector.get( LaneWidthPointController ) );
		this.addController( LaneWidthNode, this.tool.base.injector.get( LaneWidthNodeController ) );
		this.addController( TvLane, this.tool.base.injector.get( EmptyController ) );
		this.addController( TvRoad, this.tool.base.injector.get( LaneWidthRoadController ) );

		this.addDragHandler( LaneWidthPoint, this.tool.base.injector.get( LaneWidthPointDragHandler ) );
		this.addDragHandler( LaneWidthLine, this.tool.base.injector.get( LaneWidthLineDragHandler ) );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onObjectUpdated ( object: Object ): void {

		if ( object instanceof LaneWidthInspector ) {

			super.onObjectUpdated( object.node );

		} else {

			super.onObjectUpdated( object );

		}

	}

}
