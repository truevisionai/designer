/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { PointerEventData } from '../../events/pointer-event-data';
import { SignalFactory } from '../../modules/tv-map/builders/signal-factory';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { StaticSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { ToolType } from '../models/tool-types.enum';
import { BaseTool } from './base-tool';

export class RoadSignalTool extends BaseTool {

	public name: string = 'RoadSignalTool';

	public toolType = ToolType.RoadSignalTool;

	onPointerDown ( e: PointerEventData ) {

		const posTheta = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( e.point?.x, e.point?.y, posTheta );

		if ( !road ) return;

		const signal = new StaticSignal( posTheta.s, posTheta.t );

		signal.height = 1.5;

		SignalFactory.createSignal( road, signal );

	}

}
