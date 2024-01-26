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

	constructor ( private options?: StrategySettings ) {

		super();

		if ( !this.options ) {
			this.options = {
				higlightOnHover: true,
				higlightOnSelect: true,
				tag: null,
				returnParent: false,
				returnTarget: false,
			};
		}

	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		if ( this.options?.higlightOnSelect ) {
			this.selected?.unselect();
		}

		this.selected = pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Line2 )?.object as any;

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

		this.current = pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Line2 )?.object as any;

		if ( !this.current?.isSelected ) this.current?.onMouseOver();

		return this.current;
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		const object = pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Line2 )?.object as any;

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
