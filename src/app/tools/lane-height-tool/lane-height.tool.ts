/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "../tool-types.enum";
import { LaneHeightInspector } from "../../map/lane-height/lane-height.inspector";
import { TvLaneHeight } from "app/map/lane-height/lane-height.model";
import { BaseLaneTool } from "../base-lane.tool";

import { LaneNode } from "../../objects/lane-node";

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

	protected onShowInspector ( node: LaneNode<TvLaneHeight> ) {

		this.setInspector( new LaneHeightInspector( node ) );

	}

}
