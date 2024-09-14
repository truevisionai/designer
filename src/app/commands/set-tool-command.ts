/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolManager } from 'app/managers/tool-manager';
import { BaseCommand } from './base-command';
import { Tool } from "../tools/tool";

export class SetToolCommand extends BaseCommand {

	private oldTool: Tool;

	constructor ( private newTool: Tool ) {

		super();

		this.oldTool = ToolManager.getCurrentTool();

	}

	execute (): void {

		ToolManager.setCurrentTool( this.newTool );

	}

	undo (): void {

		ToolManager.setCurrentTool( this.oldTool );

	}

	redo (): void {

		ToolManager.setCurrentTool( this.newTool );

	}

}
