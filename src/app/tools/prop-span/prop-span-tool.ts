/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { BaseTool } from "../base-tool";
import { ToolType } from "../tool-types.enum";
import { PropSpanToolService } from "./prop-span-tool.service";
import { OnRoadMovingStrategy } from "app/core/strategies/move-strategies/on-road-moving.strategy";
import { RoadCoordStrategy } from "app/core/strategies/select-strategies/road-coord-strategy";
import { PropManager } from "app/managers/prop-manager";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { TvRoad } from "app/map/models/tv-road.model";
import { SelectRoadStrategy } from "app/core/strategies/select-strategies/select-road-strategy";
import { ControlPointStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { AppInspector } from "app/core/inspector";
import { TvObjectRepeat } from "app/map/models/objects/tv-object-repeat";
import { SerializedAction, SerializedField } from "app/core/components/serialization";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { RoadPosition } from "app/scenario/models/positions/tv-road-position";
import { SimpleControlPoint } from "../../objects/simple-control-point";

export class PropSpanTool extends BaseTool<any>{

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

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

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

		this.selectionService.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.road ) {

			this.setHint( 'Select a road/lane' );

			return;
		}

		if ( !this.prop ) {

			this.setHint( 'Select a prop from project browser' );

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

				repeat.sStart = roadObject.s = position.s;

				repeat.tStart = roadObject.t = position.t;

				repeat.segmentLength = this.road.length - position.s;

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

			this.setHint( 'Select a prop' );

		} else {

			this.setHint( 'use SHIFT + LEFT CLICK to create object' );

		}

	}

	onRoadUnselected ( road: TvRoad ) {

		this.tool.hideRoadLines( road );

		this.tool.hideRoad( road );

		this.road = null;

		this.setHint( 'use LEFT CLICK to select a road/lane' );

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
		this.repeat.sStart = value;
		this.updateLength();
	}

	@SerializedField( { 'type': 'float', label: 'Gap' } )
	get gap () {
		return this.repeat.gap;
	}

	set gap ( value ) {
		this.repeat.gap = value;
	}

	@SerializedField( { 'type': 'float', label: 'Segment Length' } )
	get length () {
		return this.repeat.segmentLength;
	}

	set length ( value ) {
		this.repeat.segmentLength = value;
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

	@SerializedAction( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.roadObject ) );

	}

	updateLength () {

		if ( this.repeat.sStart + this.repeat.segmentLength > this.roadObject.road.length ) {

			this.repeat.segmentLength = this.roadObject.road.length - this.repeat.sStart;

		}

	}

}
