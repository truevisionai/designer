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
import { SnackBar } from 'app/services/snack-bar.service';
import { ToolType } from '../models/tool-types.enum';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';

export class LaneCreateTool extends BaseTool {

	public name: string = 'LaneCreate';
	public toolType = ToolType.LaneCreate;

	public lane: TvLane;

	private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.BLUE, false );

	private dragging: boolean;
	startPosTheta: TvPosTheta;
	endPosTheta: TvPosTheta;

	constructor () {

		super();

	}

	get road () {

		return this.lane ? this.map.getRoadById( this.lane.roadId ) : null;

	}

	disable (): void {

		super.disable();

		this.laneHelper.clear();

		this.removeHighlight();
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

		this.isPointerDown = true;

		if ( this.isInteractingWithReferenceLine( e ) ) return;

		this.isLaneSelected( e );

	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.isPointerDown && this.dragging && this.road ) {

			const posTheta = new TvPosTheta();

			TvMapQueries.getRoadByCoords( e.point.x, e.point.y, posTheta );

			// const laneSection = this.road.getLaneSectionAt( posTheta.s );

			this.endPosTheta = posTheta;

			console.log( 'clone lane updating at ', posTheta );

		}

		// this.removeHighlight();

		// if ( !this.lane ) this.setHint( 'Use LEFT CLICK to select road' );
		// if ( !this.lane ) return;

		// this.setHint( 'Move pointer over reference line of the lane you want to duplicate' );

		// if ( this.hasInteratedReferenceLine( e ) ) return;

	}

	public onPointerUp ( e: PointerEventData ) {

		if ( this.isPointerDown && this.dragging && this.road ) {

			console.log( 'clone lane ended at ', this.endPosTheta );

			this.createNewLane( this.lane, this.road, this.startPosTheta, this.endPosTheta );

		}

		this.dragging = false;

		this.isPointerDown = false
	}

	createNewLane ( lane: TvLane, road: TvRoad, startPosTheta: TvPosTheta, endPosTheta: TvPosTheta ) {

		const currentLaneSection = road.getLaneSectionAt( startPosTheta.s );

		const newLaneSection = currentLaneSection.cloneAtS( currentLaneSection.id + 1, startPosTheta.s );

		road.addLaneSectionInstance( newLaneSection );

		const newLane = lane.clone();

		newLane.clearLaneWidth();

		newLane.addWidthRecord( 0, 0, 0, 0, 0 );

		newLane.addWidthRecord( 20, lane.getWidthValue(0), 0, 0, 0 );

		newLaneSection.updateLaneWidthValues( newLane );

		newLaneSection.addLaneInstance( newLane, true );

		console.log( this.road.laneSections )

		SceneService.removeWithChildren( this.road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, this.road );

		this.laneHelper.redraw( LineType.SOLID );

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

		if ( !road ) console.error( 'Road not found' );

		if ( !road ) return false;

		const results = PickingHelper.findAllByTag( this.laneHelper.tag, e, road.gameObject.children );

		if ( !results || results.length == 0 ) return false;

		this.setHint( 'Use SHIFT + LEFT CLICK to duplicate lane' );

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

	public isInteractingWithReferenceLine ( e: PointerEventData ) {

		const referenceLine = this.findIntersection( this.laneHelper.tag, e.intersections );

		if ( !referenceLine ) return false;

		if ( !referenceLine.userData.lane ) return false;

		const lane = referenceLine.userData.lane as TvLane;

		const road = this.map.getRoadById( lane.roadId );

		const posTheta = new TvPosTheta();

		TvMapQueries.getRoadByCoords( e.point.x, e.point.y, posTheta );

		const laneSection = road.getLaneSectionAt( posTheta.s );

		console.log( 'clone lane start at ', posTheta, laneSection );

		this.dragging = true;

		this.startPosTheta = posTheta;

		// this.cloneLane( referenceLine.userData.lane as TvLane );

		return true;
	}

	public cloneLane ( lane: TvLane ): void {

		CommandHistory.execute( new AddLaneCommand( lane, this.laneHelper ) );

		this.setHint( 'Lane Added. Use CTRL Z to undo' );

	}
}
