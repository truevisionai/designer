/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { RoadCoordStrategy } from 'app/core/snapping/select-strategies/road-coord-strategy';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { SceneService } from 'app/services/scene.service';
import { RoadPosition } from 'app/modules/scenario/models/positions/tv-road-position';
import { OnRoadMovingStrategy } from 'app/core/snapping/move-strategies/on-road-moving.strategy';
import { RoadDividerToolService } from './road-divider-tool.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { CommandHistory } from 'app/services/command-history';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { AddObjectCommand } from "../../commands/add-object-command";

export class RoadDividerTool extends BaseTool {

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

		this.tool.base.init();

		this.tool.base.addSelectionStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setHint( 'Use LEFT CLICK to divide a road' );

	}

	enable () {

		super.enable();

		this.tool.roadService.showAllRoadNodes();

	}

	disable () {

		super.disable();

		this.tool.roadService.hideAllRoadNodes();

		this.removeLine();
	}

	onPointerDownSelect ( e: PointerEventData ): void {

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

			this.tool.mapService.map.addRoad( object );

			MapEvents.roadCreated.emit( new RoadCreatedEvent( object, false ) );

		}

		this.tool.roadService.hideAllRoadNodes();

		this.tool.roadService.showAllRoadNodes();
	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.mapService.map.removeRoad( object );

			MapEvents.roadRemoved.emit( new RoadRemovedEvent( object ) );

		}

		this.tool.roadService.hideAllRoadNodes();

		this.tool.roadService.showAllRoadNodes();

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
