/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { Tool } from "../tools/tool";
import { ToolType } from 'app/tools/tool-types.enum';
import { Asset } from 'app/assets/asset.model';
import { PointerEventData } from 'app/events/pointer-event-data';

export class ToolManager {

	public static toolChanged = new EventEmitter<Tool>();

	private static tool: Tool;

	static getCurrentTool (): Tool {

		return this.tool;

	}

	static setCurrentTool ( value: Tool ): void {

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

	static isCurrentTool ( type: ToolType ): boolean {

		return this.tool?.toolType === type;

	}

	static updateVisuals ( object: object ): void {

		this.tool?.updateVisuals( object );

	}

	static onObjectUpdated ( object: object ): void {

		this.tool?.onObjectUpdated( object );

	}

	static onObjectRemoved ( object: object ): void {

		this.tool?.onObjectRemoved( object );

	}

	static onObjectAdded ( object: object ): void {

		this.tool?.onObjectAdded( object );

	}

	static onObjectUnselected ( object: object ): void {

		this.tool?.onObjectUnselected( object );

	}

	static onObjectSelected ( object: object ): void {

		this.tool?.onObjectSelected( object );

	}

	static onAssetDropped ( asset: Asset, event: PointerEventData ): void {

		this.tool?.onAssetDroppedEvent( asset, event );

	}

	static onAssetDragOver ( asset: Asset, event: PointerEventData ): void {

		this.tool?.onAssetDragOverEvent( asset, event );

	}

	static shouldShowGraphViewport (): boolean {

		return this.tool?.toolType == ToolType.RoadElevation;

	}

	private static destroyPreviousState (): void {

		this.disable();

		delete this.tool;
	}
}
