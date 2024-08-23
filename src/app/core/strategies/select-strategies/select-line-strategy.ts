/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { DebugLine } from 'app/objects/debug-line';
import { StrategySettings } from './control-point-strategy';

export class SelectLineStrategy<T extends DebugLine<any>> extends SelectStrategy<T> {

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

		console.log( this.current );

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
