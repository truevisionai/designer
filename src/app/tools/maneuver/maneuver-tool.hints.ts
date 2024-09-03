/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolHintConfig } from "app/core/interfaces/tool.hints";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";
import { ManeuverMesh } from "app/services/junction/maneuver-mesh";

export const maneuverToolHints: ToolHintConfig = {
	toolOpened: "use LEFT CLICK to select a junction",
	toolClosed: "",
	objects: {
		[ TvJunction.name ]: {
			onSelected: "Click on two blue dots to connect and create a maneuver",
			onUnselected: "Use LEFT CLICK to select a junction",
		},
		[ ManeuverMesh.name ]: {
			onSelected: "Move control points to modify maneuver shape",
			onUnselected: "Use LEFT CLICK to select maneuver",
		},
		[ JunctionGatePoint.name ]: {
			onSelected: "Select another blue dot to connect and create a maneuver",
			onUnselected: "Click on two blue dots to connect and create a maneuver",
		}
	}
};
