/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithMainObject, SelectMainObjectCommand } from 'app/core/commands/select-point-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { CommandHistory } from 'app/services/command-history';
import { PointerEventData } from '../../../events/pointer-event-data';
import { OdLaneDirectionBuilder } from '../../../modules/tv-map/builders/od-lane-direction-builder';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { OnLaneStrategy } from 'app/core/snapping/select-strategies/lane-tool-strategy';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';

export class LaneTool extends BaseTool implements IToolWithMainObject {

	public name: string = 'LaneTool';

	public toolType = ToolType.Lane;

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
