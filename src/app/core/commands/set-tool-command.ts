/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from 'app/core/tools/base-tool';
import { ToolManager } from 'app/core/tools/tool-manager';
import { BaseCommand } from './base-command';

export class SetToolCommand extends BaseCommand {

	private oldTool: BaseTool;

	constructor ( private newTool: BaseTool ) {

		super();

		this.oldTool = ToolManager.currentTool;

	}

	execute (): void {

		ToolManager.currentTool = this.newTool;

	}

	undo (): void {

		ToolManager.currentTool = this.oldTool;

	}

	redo (): void {

		ToolManager.currentTool = this.newTool;

	}

}
