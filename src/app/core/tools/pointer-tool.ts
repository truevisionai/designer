/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../models/tool-types.enum';
import { BaseTool } from './base-tool';

export class PointerTool extends BaseTool {

	public name: string = 'PointerTool';
	public toolType = ToolType.Pointer;

	constructor () {

		super();

		this.setHint('Pointer Tool is used to browse and move through the scene');

	}

}
