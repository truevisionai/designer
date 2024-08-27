/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from "../inspector";
import { StatusBarService } from "../../services/status-bar.service";
import { ObjectHandler } from "./object-handler";
import { PointerEventData } from "app/events/pointer-event-data";

export abstract class BaseObjectHandler<T> implements ObjectHandler<T> {

	protected selected = new Set<T>();

	abstract onAdded ( object: T ): void;

	abstract onUpdated ( object: T ): void;

	abstract onRemoved ( object: T ): void;

	abstract onDrag ( object: T, e: PointerEventData ): void;

	abstract onDragEnd ( object: T, e: PointerEventData ): void;

	isSelected ( object: T ): boolean {

		return this.selected.has( object );

	}

	getSelected (): T[] {

		return Array.from( this.selected );

	}

	select ( object: T ): void {

		this.selected.add( object );

		this.onSelected( object );

	}

	onSelected ( object: T ): void {

		// Do nothing by default

	}

	unselect ( object: T ): void {

		this.selected.delete( object );

		this.onUnselected( object );

	}

	onUnselected ( object: T ): void {

		// Do nothing by default

	}

	clearInspector (): void {

		AppInspector.clear();

	}

	setInspector ( data: any ): void {

		AppInspector.setDynamicInspector( data );

	}

	setHint ( msg: string ): void {

		StatusBarService.setHint( msg );

	}

}
