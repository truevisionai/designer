/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { COLOR } from 'app/shared/utils/colors.service';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { BaseTool } from './base-tool';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { CallFunctionCommand } from '../commands/call-function-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { AddLaneCommand } from '../commands/add-lane-command';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { GameObject } from '../game-object';
import { Line } from 'three';

export class LaneAddTool extends BaseTool {

	public name: string = 'AddLane';

	public lane: TvLane;

	private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.BLUE, false );

	constructor () {

		super();

	}

	disable (): void {

		super.disable();

		this.laneHelper.clear();

		this.removeHighlight();
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

		if ( KeyboardInput.isShiftKeyDown && this.isReferenceLineSelected( e ) ) return;

		this.isLaneSelected( e );

	}

	public onPointerMoved ( e: PointerEventData ) {

		this.removeHighlight();

		if ( !this.lane ) return;

		if ( this.hasInteratedReferenceLine( e ) ) return;

	}

	// hasInteractedLane ( e: PointerEventData ): boolean {

	// 	const road = this.map.getRoadById( this.lane.roadId );

	// 	const object = PickingHelper.findByTag( ObjectTypes.LANE, e, road.gameObject.children )[ 0 ];

	// 	if ( !object ) return false;

	// 	this.highlight( object as GameObject );

	// 	return true;
	// }

	hasInteratedReferenceLine ( e: PointerEventData ): boolean {

		const road = this.map.getRoadById( this.lane.roadId );

		if ( !road ) throw new Error( 'Road not found');

		if ( !road ) return false;

		const results = PickingHelper.findByTag( this.laneHelper.tag, e, road.gameObject.children );

		if ( !results || results.length == 0 ) return false;

		this.highlightLine( results[ 0 ] as Line );

		return true;
	}

	public isLaneSelected ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( this.shouldClearLane( newLane ) ) {

			this.clearLane();

		} else if ( this.shouldSelectNewLane( newLane ) ) {

			this.selectNewLane( newLane );

		} else if ( this.shouldClearInspector( newLane ) ) {

			// do nothing
			// AppInspector.clear();

		}

		return newLane != null;
	}

	public shouldClearLane ( newLane: TvLane ): boolean {

		return this.lane && newLane == null;

	}

	public shouldSelectNewLane ( newLane: TvLane ): boolean {

		if ( !newLane ) return false;

		if ( !this.lane ) return true;

		return this.lane.gameObject.id !== newLane.gameObject.id;

	}

	public shouldClearInspector ( newLane: TvLane ): boolean {

		return !this.lane && newLane == null;

	}

	public clearLane (): void {

		CommandHistory.executeMany(

			new SetValueCommand( this, 'lane', null ),

			new CallFunctionCommand( this.laneHelper, this.laneHelper.clear, [], this.laneHelper.clear, [] ),

			new SetInspectorCommand( null, null ),

		);

	}

	public selectNewLane ( lane: TvLane ): void {

		const road = this.map.getRoadById( lane.roadId );

		CommandHistory.executeMany(

			new SetValueCommand( this, 'lane', lane ),

			new CallFunctionCommand( this.laneHelper, this.laneHelper.drawRoad, [ road, LineType.SOLID ], this.laneHelper.clear ),

			new SetInspectorCommand( LaneInspectorComponent, lane ),

		);

	}

	public isReferenceLineSelected ( e: PointerEventData ) {

		const referenceLine = this.findIntersection( this.laneHelper.tag, e.intersections );

		if ( !referenceLine ) return false;

		if ( !referenceLine.userData.lane ) return false;

		this.cloneLane( referenceLine.userData.lane as TvLane );

		return true;
	}

	public cloneLane ( lane: TvLane ): void {

		CommandHistory.execute( new AddLaneCommand( lane, this.laneHelper ) );

	}
}
