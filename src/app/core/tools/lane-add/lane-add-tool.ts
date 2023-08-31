/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectMainObjectCommand } from 'app/core/commands/select-point-command';
import { OnLaneStrategy } from 'app/core/snapping/select-strategies/lane-tool-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { CommandHistory } from 'app/services/command-history';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';

export class LaneAddTool extends BaseTool {

	public name: string = 'AddLane';
	public toolType = ToolType.LaneAdd;

	private lane: TvLane;

	private pointerStrategy: SelectStrategy<TvLane>;

	init (): void {

		this.pointerStrategy = new OnLaneStrategy();

	}

	disable (): void {

		super.disable();

		this.pointerStrategy?.dispose();

	}

	setMainObject ( value: ISelectable ): void {

		this.lane = value as TvLane;

	}

	getMainObject (): ISelectable {

		return this.lane;

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		const lane = this.pointerStrategy?.onPointerDown( e );

		if ( !lane ) {

			CommandHistory.execute( new SelectMainObjectCommand( this, null ) );

		} else if ( !this.lane || this.lane.uuid != lane.uuid ) {

			CommandHistory.execute( new SelectMainObjectCommand( this, lane, LaneInspectorComponent, lane ) );

		}
	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		const lane = this.pointerStrategy?.onPointerMoved( pointerEventData );

	}
}
