/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SetToolCommand } from 'app/commands/set-tool-command';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from 'app/tools/base-tool';
import { ToolType } from 'app/tools/tool-types.enum';
import { ToolManager } from 'app/managers/tool-manager';
import { ToolFactory } from "../../../tools/tool.factory";

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

		this.setTool( tool );

	}

	private setTool ( tool: BaseTool<any> ) {

		CommandHistory.execute( new SetToolCommand( tool ) );

	}

	setToolbarHeight ( height: number ) {

		this.height = height;

	}

	getToolbarHeight (): number {

		return this.height;

	}

}
