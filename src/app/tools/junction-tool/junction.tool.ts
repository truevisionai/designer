/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { SceneService } from 'app/services/scene.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { JunctionService } from 'app/services/junction/junction.service';

export class JunctionTool extends BaseTool {

	public name: string = 'JunctionTool';

	public toolType = ToolType.Junction;

	private roadStrategy: SelectStrategy<TvRoadCoord>;

	private coords: TvRoadCoord[] = [];

	private debugDrawService = new DebugDrawService();

	private debugLine: Line2;

	private junctionService = new JunctionService();

	constructor () {

		super();

		this.roadStrategy = new OnRoadStrategy();

	}

	init () {

		this.setHint( 'Click on a road to create a junction' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		const roadCoord = this.roadStrategy.onPointerDown( e );

		if ( roadCoord ) {

			SceneService.addToolObject( this.debugDrawService.createRoadWidthLine( roadCoord ) );

			this.coords.push( roadCoord );

		}

		if ( this.coords.length === 2 ) {

			const junction = this.junctionService.createJunctionFromCoords( this.coords );

			// SceneService.addToolObject( junction );

			this.coords.splice( 0, this.coords.length );

		}

	}

	onPointerMoved ( e: PointerEventData ): void {

		const roadCoord = this.roadStrategy.onPointerMoved( e );

		if ( this.debugLine ) this.debugLine.visible = false;

		if ( !roadCoord ) return;

		if ( !this.debugLine ) {

			this.debugLine = this.debugDrawService.createRoadWidthLine( roadCoord );

			SceneService.addToolObject( this.debugLine );

		}

		this.debugLine.visible = true;

		this.debugLine = this.debugDrawService.updateRoadWidthLine( this.debugLine, roadCoord );

	}

}
