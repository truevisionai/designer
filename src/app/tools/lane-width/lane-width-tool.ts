/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { LaneWidthToolService } from './lane-width-tool.service';
import { LaneWidthPointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { ToolWithHandler } from '../base-tool-v2';
import { SelectLaneOverlayStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { EmptyVisualizer } from 'app/core/visualizers/empty-visualizer';
import { LaneWidthInspector } from './lane-width-node-inspector';
import { LaneWidthLineSelectionStrategy } from 'app/core/strategies/select-strategies/object-name-strategy';
import { LaneWidthLineController } from "./controllers/lane-width-line-controller";
import { LaneWidthLineVisualizer } from "./visualizers/lane-width-line-visualizer";
import { LaneWidthPointController } from "./controllers/lane-width-point-controller";
import { LaneWidthPointVisualizer } from "./visualizers/lane-width-point-visualizer";
import { LaneWidthLine } from "./objects/lane-width-line";
import { LaneWidthPoint } from "./objects/lane-width-point";
import { LaneWidthLaneController } from './controllers/lane-width-lane-controller';
import { LaneWidthRoadController } from './controllers/lane-width-road-controller';
import { laneWidthToolHints } from './lane-width-tool-hints';
import { LaneWidthRoadVisualizer } from "./visualizers/lane-width-road-visualizer";

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

		super.init();

	}

	addStrategies (): void {

		this.addSelectionStrategy( LaneWidthLine.name, new LaneWidthLineSelectionStrategy() );
		this.addSelectionStrategy( LaneWidthPoint.name, new LaneWidthPointSelectionStrategy() );
		this.addSelectionStrategy( TvLane.name, new SelectLaneOverlayStrategy() );
		this.addSelectionStrategy( TvRoad.name, new RoadSelectionStrategy() );

	}

	addVisualizers (): void {

		this.addVisualizer( LaneWidthLine.name, this.tool.base.injector.get( LaneWidthLineVisualizer ) );
		this.addVisualizer( LaneWidthPoint.name, this.tool.base.injector.get( LaneWidthPointVisualizer ) );
		this.addVisualizer( TvLane.name, this.tool.base.injector.get( EmptyVisualizer ) );
		this.addVisualizer( TvRoad.name, this.tool.base.injector.get( LaneWidthRoadVisualizer ) );

	}

	addControllers (): void {

		this.addController( LaneWidthLine.name, this.tool.base.injector.get( LaneWidthLineController ) );
		this.addController( LaneWidthPoint.name, this.tool.base.injector.get( LaneWidthPointController ) );
		this.addController( TvLane.name, this.tool.base.injector.get( LaneWidthLaneController ) );
		this.addController( TvRoad.name, this.tool.base.injector.get( LaneWidthRoadController ) );

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
