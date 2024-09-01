/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectionStrategy } from './select-strategy';
import { DebugLine } from 'app/objects/debug-line';
import { StrategySettings } from './control-point-strategy';

/**
 * @deprecated
 */
export class DepSelectLineStrategy<T extends DebugLine<any>> extends SelectionStrategy<T> {

	private current: T = null;
	private selected: T = null;
	private options: StrategySettings = {};

	constructor ( options?: StrategySettings ) {

		super();

		this.options.higlightOnHover = options?.higlightOnHover ?? true;
		this.options.higlightOnSelect = options?.higlightOnSelect ?? true;
		this.options.tag = options?.tag ?? null;
		this.options.returnParent = options?.returnParent ?? false;
		this.options.returnTarget = options?.returnTarget ?? false;

	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		if ( this.options?.higlightOnSelect ) {
			this.selected?.unselect();
		}

		this.selected = this.findByType( pointerEventData.intersections, DebugLine ) as any;

		if ( this.options?.higlightOnSelect ) {
			this.selected?.select();
		}

		if ( this.options?.returnParent ) {
			return this.selected?.parent as any;
		}

		if ( this.options?.returnTarget ) {
			return this.selected?.target as T;
		}

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		if ( !this.current?.isSelected ) this.current?.onMouseOut();

		this.current = this.findByType( pointerEventData.intersections, DebugLine ) as any;

		if ( !this.current ) return;

		if ( !this.current.isSelected ) this.current.onMouseOver();

		return this.current;
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		const object = this.findByType( pointerEventData.intersections, DebugLine ) as any;

		if ( !object ) return;

		if ( this.options.returnParent ) {
			return object.parent as any;
		}

		if ( this.options.returnTarget ) {
			return object.target as T;
		}

		return object;
	}

	dispose (): void {
		// this.current?.onMouseOut();
		// this.selected?.unselect();
	}

}

export class SelectLineStrategy<T extends DebugLine<any>> extends SelectionStrategy<T> {

	private options: StrategySettings = {};

	constructor ( options?: StrategySettings ) {

		super();

		this.options.tag = options?.tag ?? null;
		this.options.returnParent = options?.returnParent ?? false;
		this.options.returnTarget = options?.returnTarget ?? false;

	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		const line = this.findByType( pointerEventData.intersections, DebugLine ) as any;

		if ( !line ) return;

		if ( this.options.returnParent ) {
			return line.parent as any;
		}

		if ( this.options.returnTarget ) {
			return line?.target as T;
		}

		return line;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		return this.onPointerDown( pointerEventData );

	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		return this.onPointerDown( pointerEventData );
	}

	dispose (): void {

		// not needed

	}

}
