/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "../tool-types.enum";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { LaneHeightInspector } from "../../map/lane-height/lane-height.inspector";
import { TvLaneHeight } from "app/map/lane-height/lane-height.model";
import { BaseLaneTool } from "../base-lane.tool";

export class LaneHeightTool extends BaseLaneTool<TvLaneHeight> {

	public typeName: string = TvLaneHeight.name;

	public name: string = 'LaneHeight';

	public toolType: ToolType = ToolType.LaneHeight;

	onObjectUpdated ( object: any ) {

		if ( object instanceof LaneHeightInspector ) {

			this.data.update( object.lane, object.laneHeight );

		} else {

			super.onObjectUpdated( object );

		}

	}

	protected onShowInspector ( object: any, controlPoint?: AbstractControlPoint ) {

		if ( object instanceof TvLaneHeight && controlPoint ) {

			this.setInspector( new LaneHeightInspector( this.selectedLane, controlPoint.mainObject ) );

		}

	}

}
