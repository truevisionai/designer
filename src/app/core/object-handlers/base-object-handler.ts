/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from "../inspector";
import { StatusBarService } from "../../services/status-bar.service";
import { ObjectHandler } from "./object-handler";

export abstract class BaseObjectHandler<T> implements ObjectHandler<T> {

	protected selected = new Set<T>();

	abstract onSelected ( object: T ): void;

	abstract onUnselected ( object: T ): void;

	abstract onAdded ( object: T ): void;

	abstract onUpdated ( object: T ): void;

	abstract onRemoved ( object: T ): void;

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

	unselect ( object: T ): void {

		this.selected.delete( object );

		this.onUnselected( object );

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
