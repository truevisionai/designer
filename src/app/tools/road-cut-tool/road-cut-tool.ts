/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { CommandHistory } from 'app/services/command-history';
import { AddRoadCommand } from '../road/add-road-command';
import { RoadCutterService } from 'app/services/road/road-cutter.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { SceneService } from 'app/services/scene.service';
import { RemoveRoadCommand } from '../road/remove-road-command';
import { SplitRoadCommand } from 'app/commands/split-road-command';

export class RoadCuttingTool extends BaseTool {

	public name: string = 'RoadCuttingTool';

	public toolType = ToolType.RoadCuttingTool;

	private selectStrategy: SelectStrategy<TvRoadCoord>;

	private debugLine: Line2;

	private debugDrawService = new DebugDrawService();

	constructor () {

		super();

	}

	init () {

		super.init();

		this.selectStrategy = new OnRoadStrategy();

		this.setHint( 'Use LEFT CLICK to split a road' );

	}

	enable () {

		super.enable();

		// this.roadService.showAllRoadNodes();

	}

	disable () {

		super.disable();

		// this.roadService.hideAllRoadNodes();

		// this.clearToolObjects();

		// delete this.debugLine;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		// const roadCoord = this.selectStrategy.onPointerDown( e );

		// if ( !roadCoord ) return;

		// const roads = new RoadCutterService().splitRoad( roadCoord.road, roadCoord );

		// const removeCommand = new RemoveRoadCommand( roadCoord.road );

		// const addCommand = new AddRoadCommand( roads );

		// CommandHistory.execute( new SplitRoadCommand( removeCommand, addCommand ) );

		// this.setHint( 'Use RoadTool to modify the roads' );

	}

	onPointerMoved ( e: PointerEventData ): void {

		// const roadCoord = this.selectStrategy.onPointerMoved( e );

		// if ( this.debugLine ) this.debugLine.visible = false;

		// if ( !roadCoord ) return;

		// if ( !this.debugLine ) {

		// 	this.debugLine = this.debugDrawService.createRoadWidthLine( roadCoord );

		// 	SceneService.addToolObject( this.debugLine );

		// }

		// this.debugLine.visible = true;

		// this.debugLine = this.debugDrawService.updateRoadWidthLine( this.debugLine, roadCoord );

	}

	onRoadCreated ( road: TvRoad ): void {

		// if ( road ) this.roadService.showRoadNodes( road );

	}

}
