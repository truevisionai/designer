/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LaneCoordStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { SceneService } from 'app/services/scene.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Log } from 'app/core/utils/log';
import { TvLaneType } from "../../map/models/tv-common";
import { RampToolHelper } from './road-ramp.helper';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Commands } from 'app/commands/commands';

export class RoadRampTool extends BaseTool<any> {

	name: string = 'RoadRampTool';

	toolType: ToolType = ToolType.RoadRampTool;

	private startCoord: TvLaneCoord | Vector3;

	private startLine: Line2;

	private referenceLine: Line2;

	private debug = false;

	constructor (
		private helper: RampToolHelper,
	) {
		super();
	}

	init (): void {

		this.helper.base.reset();

		this.helper.base.addCreationStrategy( new LaneCoordStrategy() );

		this.helper.base.addSelectionStrategy( new LaneCoordStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.helper.base.reset();

		if ( this.startLine ) {

			SceneService.removeFromTool( this.startLine );

			this.startLine = null;

		}

		if ( this.referenceLine ) {

			SceneService.removeFromTool( this.referenceLine );

			this.referenceLine = null;

		}
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.helper.base.handleCreation( e, ( position ) => {

			this.startCoord ? this.endCreation( position ) : this.initCreation( position );

		}, ( position: Vector3 ) => {

			this.startCoord ? this.endCreation( position ) : this.initCreation( position );

		} );

	}

	onPointerMoved ( e: PointerEventData ) {

		this.helper.base.handleCreation( e, position => {

			this.startCoord ? this.showRampLine( position ) : this.showStartLine( position );

			// this.updateCursorHints( position );

		}, ( position: Vector3 ) => {

			this.startCoord ? this.showRampLine( position ) : this.showStartLine( position );

			// this.updateCursorHints( position );

		} );

	}

	updateCursorHints ( position: TvLaneCoord | Vector3 ) {

		if ( !this.startCoord ) {
			this.helper.base.setCursor( 'auto' );
			return;
		}

		if ( position instanceof Vector3 ) {
			this.helper.base.setCursor( 'copy' );
			return;
		}

		const mainRoad = this.startCoord instanceof TvLaneCoord ? this.startCoord.road : null;

		if ( mainRoad === position.road ) {
			this.helper.base.setCursor( 'not-allowed' );
			return;
		}

		if ( position.lane.type !== TvLaneType.driving ) {
			this.helper.base.setCursor( 'not-allowed' );
			return;
		}

		this.helper.base.setCursor( 'copy' );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof AbstractSpline ) {

			this.addRampRoad( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof AbstractSpline ) {

			this.removeRampRoad( object );

		}

	}

	private initCreation ( position: TvLaneCoord | Vector3 ): void {

		// TODO: add support for vector3 for starting point
		if ( position instanceof Vector3 ) {
			this.setHint( 'Select a lane to start ramp' );
			return;
		}

		if ( position.lane?.type !== TvLaneType.driving ) {
			this.setHint( 'Select a driving lane to start ramp. Non driving lanes are not supported' );
			return;
		}

		this.startCoord = position;
	}

	private endCreation ( position: TvLaneCoord | Vector3 ): void {

		if ( position instanceof TvLaneCoord ) {

			const mainRoad = this.startCoord instanceof TvLaneCoord ? this.startCoord.road : null;

			if ( mainRoad === position.road ) {
				this.setHint( 'Select a point on different road to end ramp' );
				return;
			}

			if ( position.lane?.type !== TvLaneType.driving ) {
				this.setHint( 'Select a driving lane to end ramp. Non driving lanes are not supported' );
				return;
			}

		}

		this.createRampRoad( this.startCoord, position );

		this.startCoord = null;

	}

	private createRampRoad ( startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ) {

		if ( startCoord instanceof TvLaneCoord ) {

			const road = this.helper.createRampRoad( startCoord, endCoord );

			Commands.AddObject( road.spline );

		}

		if ( this.referenceLine ) this.referenceLine.visible = false;

		if ( this.startLine ) this.startLine.visible = false;

	}

	private showRampLine ( position: TvLaneCoord | Vector3 ) {

		const computeDistance = ( start: TvLaneCoord | Vector3, end: TvLaneCoord | Vector3 ) => {

			const v1 = start instanceof TvLaneCoord ? start.position : start;

			const v2 = end instanceof TvLaneCoord ? end.position : end;

			const distance = v1.distanceTo( v2 );

			if ( this.debug ) Log.info( 'distance', distance, v1, v2 );

			return distance;
		}

		const distance = computeDistance( this.startCoord, position );

		if ( distance < 5 ) return;

		if ( this.debug ) Log.info( distance, this.startCoord, position );

		if ( !this.referenceLine ) {

			this.referenceLine = this.helper.createReferenceLine( this.startCoord, position );

			SceneService.addToolObject( this.referenceLine );

		}

		this.referenceLine.visible = true;

		this.referenceLine = this.helper.updateReferenceLine( this.referenceLine, this.startCoord, position );

	}

	private showStartLine ( position: TvLaneCoord | Vector3 ) {

		if ( this.debug ) Log.info( 'show start line', position );

		// vector3 as start not supported
		if ( position instanceof Vector3 ) return;

		if ( this.startLine ) this.startLine.visible = false;

		if ( position.lane.type != TvLaneType.driving ) {
			return
		}

		if ( !this.startLine ) {

			this.startLine = this.helper.debug.createLaneWidthLine( null, position, COLOR.CYAN, 8 );

			SceneService.addToolObject( this.startLine );

		}

		this.startLine.visible = true;

		this.startLine = this.helper.debug.updateLaneWidthLine( this.startLine, position );


	}

	private addRampRoad ( spline: AbstractSpline ): void {

		if ( spline.segmentMap.length === 0 ) {

			throw new Error( 'Ramp road should have atleast one segment' );

		}

		this.helper.splineService.add( spline );

	}

	private removeRampRoad ( spline: AbstractSpline ): void {

		this.helper.splineService.remove( spline );

	}

}
