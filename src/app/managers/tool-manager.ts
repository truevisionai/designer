/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { BaseTool } from '../tools/base-tool';

export class ToolManager {

	public static toolChanged = new EventEmitter<BaseTool<any>>();

	private static tool: BaseTool<any>;

	static get currentTool (): BaseTool<any> {

		return this.tool;

	}

	static set currentTool ( value: BaseTool<any> ) {

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

	static getTool<T extends BaseTool<any>> (): T {

		return this.tool as T;

	}

	static clear () {

		this.destroyPreviousState();

		this.toolChanged.emit( null );
	}

	static disable () {

		if ( this.tool != null ) this.tool.disable();

	}

	static enable () {

		if ( this.tool != null ) this.tool.enable();

	}

	private static destroyPreviousState () {

		this.disable();

		delete this.tool;
	}
}
