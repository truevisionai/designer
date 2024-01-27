/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { TextMarkingToolService } from "./text-marking-tool.service";
import { TvRoadSignal } from "app/map/models/tv-road-signal.model";
import { AppInspector } from "app/core/inspector";
import { ControlPointStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { OnRoadMovingStrategy } from "app/core/strategies/move-strategies/on-road-moving.strategy";
import { SimpleControlPoint } from "app/objects/dynamic-control-point";
import { RoadPosition } from "app/scenario/models/positions/tv-road-position";
import { TextMarkingInspector } from "./text-marking.inspector";
import { RoadCoordStrategy } from "app/core/strategies/select-strategies/road-coord-strategy";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";

export class TextMarkingTool extends BaseTool<any>{

	name: string = 'TextMarkingTool';

	toolType: ToolType = ToolType.TextMarkingTool;

	signal: TvRoadSignal;

	controlPoint: SimpleControlPoint<TvRoadSignal>;

	constructor (
		private tool: TextMarkingToolService
	) {
		super();
	}

	init (): void {

		super.init();

		this.setHint( 'Text Marking Tool is used for marking text on the road' );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );

		this.tool.base.selection.registerStrategy( 'point', new ControlPointStrategy() );

		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.showAllControlPoints();

	}

	disable (): void {

		super.disable();

		this.tool.hideAllControlPoints();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.handleCreation( e, ( position ) => {

			if ( position instanceof TvRoadCoord ) {

				const signal = this.tool.createTextRoadMarking( position, 'STOP' );

				this.executeAddObject( signal );

			}

		} );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.tool.base.highlight( pointerEventData );

		if ( !this.signal ) return;

		const road = this.tool.roadService.getRoad( this.signal.roadId );

		this.tool.base.handleTargetMovement( pointerEventData, road, ( position: any ) => {

			if ( position instanceof RoadPosition ) {

				// this.signal.s = position.s;
				// this.signal.t = position.t;

				// this.tool.updateSignalPosition( this.signal );

			}

		} );
	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.tool.addTextRoadMarking( object );

			this.onSignalSelected( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.tool.removeTextRoadMarking( object );

			this.onSignalUnselected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.tool.removeTextRoadMarking( object );

			this.tool.addTextRoadMarking( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.tool.removeTextRoadMarking( object.signal );

			this.tool.addTextRoadMarking( object.signal );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalSelected( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.onSignalSelected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalSelected( object.target );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalUnselected( object );

		} else if ( object instanceof TextMarkingInspector ) {

			this.onSignalUnselected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalUnselected( object.target );

		}

	}

	onSignalSelected ( signal: TvRoadSignal ) {

		this.signal = signal;

		AppInspector.setDynamicInspector( new TextMarkingInspector( signal ) );

	}

	onSignalUnselected ( signal: TvRoadSignal ) {

		this.signal = null;

		AppInspector.clear();

	}

}



