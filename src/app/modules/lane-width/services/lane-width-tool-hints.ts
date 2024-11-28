/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolHintConfig } from "app/core/interfaces/tool.hints";
import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";
import { LaneWidthLine } from "app/modules/lane-width/objects/lane-width-line";
import { LaneWidthPoint } from "app/modules/lane-width/objects/lane-width-point";

export const laneWidthToolHints: ToolHintConfig = {
	toolOpened: "Use LEFT CLICK to select a road",
	toolClosed: "",
	objects: {
		[ LaneWidthLine.name ]: {
			onSelected: "Drag line to modify distance location of width node",
		},
		[ LaneWidthPoint.name ]: {
			onSelected: "Drag control point modify lateral width of lane",
		},
		[ TvLane.name ]: {
			onSelected: "Use SHIFT + LEFT CLICK on desired position to insert new width node",
		},
		[ TvRoad.name ]: {
			onSelected: "Use LEFT CLICK to select a lane or Click on blue points/line to edit the lane width",
		}
	}
};
