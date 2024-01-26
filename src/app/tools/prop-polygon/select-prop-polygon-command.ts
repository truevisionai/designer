/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropPolygon } from 'app/map/models/prop-polygons';
import { PropPolygonTool } from './prop-polygon-tool';
import { SelectMainObjectCommand } from "../../commands/select-main-object-command";

export class SelectPropPolygonCommand extends SelectMainObjectCommand {

	constructor ( tool: PropPolygonTool, propPolygon: PropPolygon ) {
		super( tool, propPolygon );
	}

}
