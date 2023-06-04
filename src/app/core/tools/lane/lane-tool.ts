/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithMainObject } from 'app/core/commands/select-point-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { CommandHistory } from 'app/services/command-history';
import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { OdLaneDirectionBuilder } from '../../../modules/tv-map/builders/od-lane-direction-builder';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { SelectLaneForLaneToolCommand } from './select-lane-for-lane-tool-command';

export class LaneTool extends BaseTool implements IToolWithMainObject {

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

	private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	private lane: TvLane;

	disable (): void {

		super.disable();

		this.laneDirectionHelper.clear();

	}

	setMainObject ( value: ISelectable ): void {

		this.lane = value as TvLane;

	}

	getMainObject (): ISelectable {

		return this.lane;

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.point == null || e.button !== MouseButton.LEFT ) return;

		if ( this.isLaneSelected( e ) ) return;

		if ( this.lane ) {

			CommandHistory.execute( new SelectLaneForLaneToolCommand( this, null, this.laneDirectionHelper ) );

		}
	}

	isLaneSelected ( e: PointerEventData ): boolean {

		const laneObject = this.findIntersection( ObjectTypes.LANE, e.intersections );

		if ( !laneObject ) return false;

		let lane = laneObject.userData.lane as TvLane;

		if ( lane == null ) return false;

		if ( !this.lane || this.lane.uuid != lane.uuid ) {

			CommandHistory.execute( new SelectLaneForLaneToolCommand( this, lane, this.laneDirectionHelper ) );

		}

		return true;
	}
}
