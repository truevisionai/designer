/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SelectLaneStrategy } from "../../core/strategies/select-strategies/on-lane-strategy";
import { SelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { DebugLine } from 'app/objects/debug-line';
import { CommandHistory } from 'app/services/command-history';
import { Action, SerializedField } from 'app/core/components/serialization';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { TvLaneType, TravelDirection } from 'app/map/models/tv-common';
import { LaneToolService } from './lane-tool.service';
import { LaneService } from 'app/services/lane/lane.service';

export class LaneTool extends BaseTool<any>{

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

	get selectedLane () {
		return this.tool.base.selection.getLastSelected<TvLane>( TvLane.name );
	}

	constructor (
		private tool: LaneToolService
	) {
		super();
	}

	init (): void {

		this.tool.base.reset();

		this.selectionService.registerStrategy( DebugLine.name, new SelectLineStrategy() );

		this.selectionService.registerStrategy( TvLane.name, new SelectLaneStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.tool.laneDebug.clear();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvLane ) {

				// object.duplicate();

			}

		} );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.laneDebug.removeHighlight();

		this.tool.base.selection.handleHighlight( e, ( object ) => {

			if ( object instanceof TvLane ) {

				this.tool.laneDebug.higlightLane( object );

			}

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneAdded( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.tool.updateLane( object );

		} else if ( object instanceof TvLaneObject ) {

			this.tool.updateLane( object.lane );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneRemoved( object );

		}

	}

	onLaneRemoved ( lane: TvLane ) {

		this.tool.removeLane( lane );

	}

	onLaneAdded ( lane: TvLane ) {

		this.tool.addLane( lane );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		}

	}

	onLaneSelected ( object: TvLane ) {

		this.tool.laneDebug.selectLane( object );

		const inspector = new TvLaneObject( object, this.tool.laneService );

		AppInspector.setInspector( DynamicInspectorComponent, inspector );

		this.setHint( 'use SHIFT + LEFT CLICK to duplicate a lane' );

	}

	onLaneUnselected ( object: TvLane ) {

		this.tool.laneDebug.unselectLane( object );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a road/lane' );
	}
}



export class TvLaneObject {

	constructor ( public lane: TvLane, private laneService: LaneService ) { }

	@SerializedField( { label: 'Lane Id', type: 'int', disabled: true } )
	get laneId (): number {
		return Number( this.lane.id );
	}

	set laneId ( value: number ) {
		this.lane.id = value;
	}

	@SerializedField( { type: 'enum', enum: TvLaneType } )
	get type (): TvLaneType {
		return this.lane.type;
	}

	set type ( value: TvLaneType ) {
		this.laneService.setLaneType( this.lane, value );
	}

	@SerializedField( { type: 'boolean' } )
	get level (): boolean {
		return this.lane.level;
	}

	set level ( value ) {
		this.lane.level = value;
	}

	@SerializedField( { type: 'enum', enum: TravelDirection } )
	get direction () {
		return this.lane.direction;
	}

	set direction ( value: TravelDirection ) {
		this.lane.direction = value;
	}

	@Action()
	duplicate () {

		const newId = this.lane.isLeft ? this.lane.id + 1 : this.lane.id - 1;

		const newLane = this.lane.clone( newId );

		const command = new AddObjectCommand( newLane );

		CommandHistory.execute( command );

	}

	@Action()
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.lane ) );

	}

}
