/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { BaseTool } from '../base-tool';
import { CommandHistory } from 'app/services/command-history';
import { ToolType } from '../../models/tool-types.enum';
import { SelectMainObjectCommand } from 'app/core/commands/select-point-command';
import { OnLaneStrategy } from 'app/core/snapping/select-strategies/lane-tool-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';

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
