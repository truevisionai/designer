import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { ICommand } from '../../commands/i-command';
import { PropPolygonTool } from './prop-polygon-tool';
import { BaseCommand } from 'app/core/commands/base-command';
import { SelectMainObjectCommand } from 'app/core/commands/select-point-command';

export class SelectPropPolygonCommand extends SelectMainObjectCommand {

	constructor ( tool: PropPolygonTool, propPolygon: PropPolygon ) {
		super( tool, propPolygon );
	}

}
