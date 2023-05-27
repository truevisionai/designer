/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';

export class PointerTool extends BaseTool {

	public name: string = 'PointerTool';

	constructor () {

		super();

		this.setHint('Pointer Tool is used to browse and move through the scene');

	}

}
