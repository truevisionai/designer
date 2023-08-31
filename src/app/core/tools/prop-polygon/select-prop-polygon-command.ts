/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectMainObjectCommand } from 'app/core/commands/select-point-command';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { PropPolygonTool } from './prop-polygon-tool';

export class SelectPropPolygonCommand extends SelectMainObjectCommand {

	constructor ( tool: PropPolygonTool, propPolygon: PropPolygon ) {
		super( tool, propPolygon );
	}

}
