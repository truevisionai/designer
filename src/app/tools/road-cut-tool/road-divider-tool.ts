/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { RoadCoordStrategy } from 'app/core/strategies/select-strategies/road-coord-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { SceneService } from 'app/services/scene.service';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { RoadDividerToolService } from './road-divider-tool.service';
import { CommandHistory } from 'app/services/command-history';
import { AddObjectCommand } from "../../commands/add-object-command";


export class RoadDividerTool extends BaseTool<any>{

	public name: string = 'RoadDividerTool';

	public toolType = ToolType.RoadDividerTool;

	private debugLine: Line2;

	constructor (
		private tool: RoadDividerToolService
	) {

		super();

	}

	init () {

		super.init();

		this.tool.base.reset();

		this.tool.base.addSelectionStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setHint( 'Use SHIFT + LEFT CLICK to divide a road' );

	}

	enable () {

		super.enable();

		this.tool.roadDebug.showNodes();

	}

	disable () {

		super.disable();

		this.tool.base.reset();

		this.tool.roadDebug.hideNodes();

		this.removeLine();
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.handleSelection( e, ( object ) => {

			if ( object instanceof TvRoadCoord ) {

				this.divideRoadAt( object );

			}

		} );

	}

	divideRoadAt ( roadCoord: TvRoadCoord ) {

		const clone = this.tool.dividerService.divideRoadAt( roadCoord.road, roadCoord.s );

		const addCommand = new AddObjectCommand( clone );

		CommandHistory.executeMany( addCommand );

		this.setHint( "Modify the new road from Road Tool" );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.base.handleMovement( e, position => {

			if ( position instanceof RoadPosition ) {

				this.drawLine( position );

			} else {

				throw new Error( 'Invalid position type' );

			}

		}, () => {

			if ( this.debugLine ) this.debugLine.visible = false;

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.roadService.add( object );

		}

		this.tool.roadDebug.hideNodes();

		this.tool.roadDebug.showNodes();
	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.roadService.remove( object );

		}

		this.tool.roadDebug.hideNodes();

		this.tool.roadDebug.showNodes();

	}

	private drawLine ( position: RoadPosition ) {

		if ( !this.debugLine ) {

			this.debugLine = this.tool.debugService.createRoadWidthLinev2( position.road, position.s );

			SceneService.addToolObject( this.debugLine );

		}

		this.debugLine.visible = true;

		this.debugLine = this.tool.debugService.updateRoadWidthLinev2( this.debugLine, position.road, position.s );

	}

	private removeLine () {

		if ( !this.debugLine ) return;

		this.debugLine.visible = false;

		SceneService.removeFromTool( this.debugLine );

		this.debugLine = null;

	}

}
