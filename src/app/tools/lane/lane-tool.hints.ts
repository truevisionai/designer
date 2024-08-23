import { ToolHintConfig } from "app/core/interfaces/tool.hints";
import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";

export const laneToolHints: ToolHintConfig = {
	toolOpened: "use LEFT CLICK to select a road",
	toolClosed: "",
	objects: {
		[ TvRoad.name ]: {
			onSelected: "use LEFT CLICK to select a lane",
			onUnselected: "use LEFT CLICK to select a road",
		},
		[ TvLane.name ]: {
			onSelected: "Edit lane properties from the inspector",
			onUnselected: "use LEFT CLICK to select a lane",
		}
	}
};
