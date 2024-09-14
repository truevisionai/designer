/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolHintConfig } from "app/core/interfaces/tool.hints";
import { TvRoad } from "app/map/models/tv-road.model";
import { PointMarkingControlPoint } from "./objects/point-marking-object";

export const PointMarkingToolHintConfiguration: ToolHintConfig = {
	toolOpened: "use LEFT CLICK to select a road",
	toolClosed: "",
	objects: {
		[ TvRoad.name ]: {
			onSelected: "Use SHIFT + LEFT CLICK create a point marking on selcted road",
		},
		[ PointMarkingControlPoint.name ]: {
			onSelected: "Drag control point or edit properties from the inspector",
		}
	}
};
