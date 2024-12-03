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
import { Commands } from 'app/commands/commands';


export class RoadDividerTool extends BaseTool<any> {

	public name: string = 'RoadDividerTool';

	public toolType = ToolType.RoadDividerTool;

	private debugLine: Line2;

	constructor (
		private tool: RoadDividerToolService
	) {

		super();

	}

	init (): void {

		super.init();

		this.tool.base.reset();

		this.tool.base.addSelectionStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setHint( 'Use SHIFT + LEFT CLICK to divide a road' );

	}

	enable (): void {

		super.enable();

		this.tool.roadDebug.showNodes();

	}

	disable (): void {

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

		Commands.AddObject( clone );

		this.setHint( "Modify the new road from Road Tool" );

		return clone;

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.base.handleMovement( e, position => {

			if ( position instanceof RoadPosition ) {

				this.drawLine( position );

			}

		}, () => {

			if ( this.debugLine ) this.debugLine.visible = false;

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.splineService.update( object.spline );

		}

		this.tool.roadDebug.hideNodes();

		this.tool.roadDebug.showNodes();
	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.segmentService.removeSegment( object.spline, object );

			this.tool.splineService.update( object.spline );

		}

		this.tool.roadDebug.hideNodes();

		this.tool.roadDebug.showNodes();

	}

	private drawLine ( position: RoadPosition ): void {

		if ( !this.debugLine ) {

			this.debugLine = this.tool.roadDebug.createRoadWidthLinev2( position.road, position.s );

			SceneService.addToolObject( this.debugLine );

		}

		this.debugLine.visible = true;

		this.debugLine = this.tool.roadDebug.updateRoadWidthLinev2( this.debugLine, position.road, position.s );

	}

	private removeLine (): void {

		if ( !this.debugLine ) return;

		this.debugLine.visible = false;

		SceneService.removeFromTool( this.debugLine );

		this.debugLine = null;

	}

}
