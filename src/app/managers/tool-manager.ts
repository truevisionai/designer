/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { Tool } from "../tools/tool";
import { ToolType } from 'app/tools/tool-types.enum';

export class ToolManager {

	public static toolChanged = new EventEmitter<Tool>();

	private static tool: Tool;

	static get currentTool (): Tool {

		return this.tool;

	}

	static set currentTool ( value: Tool ) {

		if ( !value ) {

			this.clear();

		} else {

			// dont do anything if the same tool is already being used
			if ( this.tool && this.tool.name === value.name ) return;

			this.destroyPreviousState();

			this.tool = value;

			this.tool.init();

			this.tool.enable();

			this.toolChanged.emit( value );

		}

	}

	static getTool<T extends Tool> (): T {

		return this.tool as T;

	}

	static getToolType (): ToolType | undefined {

		return this.tool?.toolType;

	}

	static clear (): void {

		this.destroyPreviousState();

		this.toolChanged.emit( null );
	}

	static disable (): void {

		this.tool?.disable();

	}

	static enable (): void {

		this.tool?.enable();

	}

	private static destroyPreviousState (): void {

		this.disable();

		delete this.tool;
	}
}
