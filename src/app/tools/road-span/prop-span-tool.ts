import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { PropSpanToolService } from "./prop-span-tool.service";
import { OnRoadMovingStrategy } from "app/core/snapping/move-strategies/on-road-moving.strategy";
import { RoadCoordStrategy } from "app/core/snapping/select-strategies/road-coord-strategy";
import { PropManager } from "app/managers/prop-manager";
import { TvRoadCoord } from "app/modules/tv-map/models/TvRoadCoord";
import { TvRoadObject } from "app/modules/tv-map/models/objects/tv-road-object";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { SelectRoadStrategy } from "app/core/snapping/select-strategies/select-road-strategy";
import { SimpleControlPoint } from "app/modules/three-js/objects/dynamic-control-point";
import { ControlPointStrategy } from "app/core/snapping/select-strategies/control-point-strategy";
import { AppInspector } from "app/core/inspector";
import { TvObjectRepeat } from "app/modules/tv-map/models/objects/tv-object-repeat";
import { Action, SerializedField } from "app/core/components/serialization";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { RoadPosition } from "app/modules/scenario/models/positions/tv-road-position";

export class PropSpanTool extends BaseTool {

	name: string = 'Prop Span Tool';

	toolType: ToolType = ToolType.PropSpanTool;

	road: TvRoad;

	point: SimpleControlPoint<TvObjectRepeat>;

	pointMoved: boolean;

	get prop () { return PropManager.getAssetNode(); }

	constructor ( private tool: PropSpanToolService ) {

		super();

	}

	init (): void {

		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.tool.base.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.hideRoads();

		this.tool.clearControlPoints();

		this.tool.base.reset();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.road ) {

			this.tool.base.setHint( 'Select a road/lane' );

			return;
		}

		if ( !this.prop ) {

			this.tool.base.setHint( 'Select a prop from project browser' );

			return;
		}

		this.tool.base.handleCreation( e, ( position ) => {

			if ( position instanceof TvRoadCoord ) {

				const roadSpanObject = this.tool.createRoadSpanObject( this.prop.guid, position );

				this.executeAddObject( roadSpanObject );

			}

		} );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		if ( !this.road ) return;

		if ( !this.point ) return;

		if ( !this.point.isSelected ) return;

		this.tool.base.handleMovement( pointerEventData, ( position ) => {

			if ( position instanceof RoadPosition ) {

				const roadObject = this.tool.roadObjectService.findRoadObjectByRepeat( this.point.target );

				if ( !roadObject ) return;

				const repeat = this.point.target as TvObjectRepeat;

				repeat.s = roadObject.s = position.s;

				repeat.tStart = roadObject.t = position.t;

				repeat.length = this.road.length - position.s;

				this.point.position.copy( position.position );

				this.pointMoved = true;

			}

		} );

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( !this.point ) return;

		if ( !this.pointMoved ) return;

		const roadObject = this.tool.roadObjectService.findRoadObjectByRepeat( this.point.target );

		if ( !roadObject ) return;

		this.tool.updateRoadSpanObject( roadObject, this.point.target );

		this.pointMoved = false;

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onRoadSelected ( road: TvRoad ) {

		// if ( this.point ) this.onControlPointUnselected( this.point );

		// if ( this.road ) this.onRoadUnselected( this.road );

		this.road = road;

		this.tool.showRoadLines( road );

		this.tool.showRoad( road );

		if ( !this.prop ) {

			this.tool.base.setHint( 'Select a prop' );

		} else {

			this.tool.base.setHint( 'use SHIFT + LEFT CLICK to create object' );

		}

	}

	onRoadUnselected ( road: TvRoad ) {

		this.tool.hideRoadLines( road );

		this.tool.hideRoad( road );

		this.road = null;

		this.tool.base.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	onControlPointUnselected ( point: SimpleControlPoint<TvObjectRepeat> ) {

		this.point = null;

		point.unselect();

		AppInspector.clear();

	}

	onControlPointSelected ( point: SimpleControlPoint<TvObjectRepeat> ) {

		const roadObject = this.tool.roadObjectService.findRoadObjectByRepeat( point.target );

		if ( !roadObject ) return;

		this.point = point;

		AppInspector.setDynamicInspector( new RoadSpanObject( roadObject, point.target ) );

		point.select();

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointUnselected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof RoadSpanObject ) {

			this.tool.updateRoadSpanObject( object.roadObject, object.repeat );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.addRoadSpanObject( object.road, object );

			this.tool.showControls( object.road, object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.tool.removeRoadSpanObject( object.road, object );

			this.tool.hideControls( object.road, object );

		}

	}

}


class RoadSpanObject {

	constructor (
		public roadObject: TvRoadObject,
		public repeat: TvObjectRepeat
	) {
	}

	@SerializedField( { 'type': 'float', label: 'Object Width' } )
	get objectWidth () {
		return this.roadObject.width;
	}

	set objectWidth ( value ) {
		this.roadObject.width = value;
	}

	@SerializedField( { 'type': 'float', label: 'Start Position' } )
	get s () {
		return this.roadObject.s;
	}

	set s ( value ) {
		this.roadObject.s = value;
		this.repeat.s = value;
		this.updateLength();
	}

	@SerializedField( { 'type': 'float', label: 'Gap' } )
	get distance () {
		return this.repeat.distance;
	}

	set distance ( value ) {
		this.repeat.distance = value;
	}

	@SerializedField( { 'type': 'float', label: 'Segment Length' } )
	get length () {
		return this.repeat.length;
	}

	set length ( value ) {
		this.repeat.length = value;
	}

	@SerializedField( { 'type': 'float', label: 'Laterl Offset Start' } )
	get t () {
		return this.roadObject.t;
	}

	set t ( value ) {
		this.roadObject.t = value;
		this.repeat.tStart = value;
	}

	@SerializedField( { 'type': 'float', label: 'Lateral Offset End' } )
	get tEnd () {
		return this.repeat.tEnd || this.roadObject.t;
	}

	set tEnd ( value ) {
		this.repeat.tEnd = value;
	}

	@SerializedField( { 'type': 'float' } )
	get zOffsetStart () {
		return this.repeat.zOffsetStart || this.roadObject.zOffset;
	}

	set zOffsetStart ( value ) {
		this.repeat.zOffsetStart = value;
	}

	@SerializedField( { 'type': 'float' } )
	get zOffsetEnd () {
		return this.repeat.zOffsetEnd || this.roadObject.zOffset;
	}

	set zOffsetEnd ( value ) {
		this.repeat.zOffsetEnd = value;
	}

	@Action( { label: 'Delete' } )
	update () {

		CommandHistory.execute( new RemoveObjectCommand( this.roadObject ) );

	}

	updateLength () {

		if ( this.repeat.s + this.repeat.length > this.roadObject.road.length ) {

			this.repeat.length = this.roadObject.road.length - this.repeat.s;

		}

	}

}
