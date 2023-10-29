/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { CommandHistory } from 'app/services/command-history';
import { AddRoadCommand } from '../road/add-road-command';
import { RoadCutterService } from 'app/services/road/road-cutter.service';

export class RoadCuttingTool extends BaseTool {

	public name: string = 'RoadCuttingTool';

	public toolType = ToolType.RoadCuttingTool;

	private selectStrategy: SelectStrategy<TvRoadCoord>;

	private roadCuttingService = new RoadCutterService;

	constructor () {

		super();

	}

	init () {

		super.init();

		this.selectStrategy = new OnRoadStrategy();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const roadCoord = this.selectStrategy.onPointerDown( e );

		console.log( roadCoord );

		if ( !roadCoord ) return;

		const newRoad = new RoadCutterService().cutRoad( roadCoord.road, roadCoord );

		CommandHistory.execute( new AddRoadCommand( [ newRoad ], true ) );

		console.log( roadCoord.road.planView );
		console.log( newRoad.planView );

	}

	onPointerMoved ( e: PointerEventData ): void {

		const roadCoord = this.selectStrategy.onPointerMoved( e );

		console.log( roadCoord );

	}

}
