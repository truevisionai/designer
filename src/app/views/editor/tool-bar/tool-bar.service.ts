/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from 'app/tools/tool-types.enum';
import { ToolManager } from 'app/managers/tool-manager';
import { ToolFactory } from "../../../tools/tool.factory";
import { Tool } from "../../../tools/tool";
import { TvConsole } from 'app/core/utils/console';
import { Commands } from 'app/commands/commands';

@Injectable( {
	providedIn: 'root'
} )
export class ToolBarService {

	private height: number;

	constructor (
		private toolFactory: ToolFactory,
	) {
	}

	setToolByType ( type: ToolType ) {

		if ( ToolManager.currentTool?.toolType === type ) return;

		const tool = this.toolFactory.createTool( type );

		if ( !tool ) {
			TvConsole.error( `Tool not found for type: ${ type }` );
			return
		}

		this.setTool( tool );

	}

	private setTool ( tool: Tool ) {

		Commands.SetTool( tool );

	}

	setToolbarHeight ( height: number ) {

		this.height = height;

	}

	getToolbarHeight (): number {

		return this.height;

	}

}
