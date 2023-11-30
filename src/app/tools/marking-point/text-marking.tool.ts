import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { TextMarkingToolService } from "./text-marking-tool.service";
import { LaneCoordStrategy } from "app/core/snapping/select-strategies/on-lane-strategy";
import { TvLaneCoord } from "app/modules/tv-map/models/tv-lane-coord";
import { TvRoadSignal } from "app/modules/tv-map/models/tv-road-signal.model";
import { AppInspector } from "app/core/inspector";
import { DynamicInspectorComponent } from "app/views/inspectors/dynamic-inspector/dynamic-inspector.component";
import { Action, SerializedField } from "app/core/components/serialization";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { ControlPointStrategy } from "app/core/snapping/select-strategies/control-point-strategy";
import { IHasUpdate } from "app/commands/set-value-command";
import { MidLaneMovingStrategy } from "app/core/snapping/move-strategies/end-lane.moving.strategy";
import { OnRoadMovingStrategy } from "app/core/snapping/move-strategies/on-road-moving.strategy";
import { DynamicControlPoint, SimpleControlPoint } from "app/modules/three-js/objects/dynamic-control-point";
import { RoadPosition } from "app/modules/scenario/models/positions/tv-road-position";

export class TextMarkingTool extends BaseTool {

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

		this.tool.base.addCreationStrategy( new LaneCoordStrategy() );

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

			if ( position instanceof TvLaneCoord ) {

				let t = position.lane.laneSection.getWidthUptoCenter( position.lane, position.s );

				if ( position.lane.id < 0 ) t *= -1;

				const signal = this.tool.createTextRoadMarking( position.road, position.lane, position.s, t, 'STOP' );

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

				this.signal.s = position.s;
				this.signal.t = position.t;

				this.tool.updateSignalPosition( this.signal );

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

		} else if ( object instanceof TextRoadMarking ) {

			this.tool.removeTextRoadMarking( object.signal );

			this.tool.addTextRoadMarking( object.signal );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalSelected( object );

		} else if ( object instanceof TextRoadMarking ) {

			this.onSignalSelected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalSelected( object.target );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			this.onSignalUnselected( object );

		} else if ( object instanceof TextRoadMarking ) {

			this.onSignalUnselected( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onSignalUnselected( object.target );

		}

	}

	onSignalSelected ( signal: TvRoadSignal ) {

		this.signal = signal;

		AppInspector.setInspector( DynamicInspectorComponent, new TextRoadMarking( signal ) );

	}

	onSignalUnselected ( signal: TvRoadSignal ) {

		this.signal = null;

		AppInspector.clear();

	}

}


class TextRoadMarking implements IHasUpdate {

	constructor ( public signal: TvRoadSignal ) { }

	update (): void {

		throw new Error( "Method not implemented." );

	}

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s () {
		return this.signal.s;
	}

	set s ( value ) {
		this.signal.s = value;
	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t () {
		return this.signal.t;
	}

	set t ( value ) {
		this.signal.t = value;
	}

	@SerializedField( { 'type': 'float', label: 'Heading' } )
	get hdg () {
		return this.signal.hOffset;
	}

	set hdg ( value ) {
		this.signal.hOffset = value;
	}

	@SerializedField( { 'type': 'string' } )
	get text (): string {
		return this.signal.text;
	}

	set text ( value: string ) {
		this.signal.text = value;
	}

	@SerializedField( { 'type': 'int', label: 'Font Size' } )
	get value (): number {
		return this.signal.value;
	}

	set value ( value: number ) {
		this.signal.value = value;
	}

	// @SerializedField( { 'type': 'enum', enum: TvUnit } )
	// get unit () {
	// 	return this.signal.unit;
	// }

	// set unit ( value ) {
	// 	this.signal.unit = value;
	// }

	@SerializedField( { 'type': 'float' } )
	get width () {
		return this.signal.width;
	}

	set width ( value ) {
		this.signal.width = value;
	}

	@Action( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.signal ) );

	}

}
