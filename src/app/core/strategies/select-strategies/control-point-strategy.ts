/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Points } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { AbstractControlPoint } from "../../../objects/abstract-control-point";

export interface StrategySettings {
	higlightOnHover?: boolean;
	higlightOnSelect?: boolean;
	tag?: string;
	returnParent?: boolean;
	returnTarget?: boolean;
}

export class ControlPointStrategy<T extends AbstractControlPoint> extends SelectStrategy<T> {

	private current: T = null;

	private selected: T = null;

	constructor ( private options?: StrategySettings ) {

		super();

		if ( !this.options ) {
			this.options = {
				higlightOnHover: true,
				higlightOnSelect: true,
				tag: null,
				returnParent: false
			}
		}

	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		if ( this.options?.higlightOnSelect ) {
			this.selected?.unselect();
		}

		const intersections = pointerEventData.intersections
			.filter( i => i.object.visible )
			.filter( i => i.object.type === 'Points' );

		const intersection = this.findNearestIntersection( pointerEventData.point, intersections );

		if ( !intersection ) return;

		this.selected = intersection.object as any;

		if ( this.options?.higlightOnSelect ) {
			this.selected?.select();
		}

		if ( this.options?.returnParent ) {
			return this.selected?.parent as any;
		}

		if ( this.options?.returnTarget ) {
			return this.selected?.target;
		}

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		if ( !this.current?.isSelected ) this.current?.onMouseOut();

		const intersections = pointerEventData.intersections
			.filter( i => i.object.visible )
			.filter( i => i.object.type === 'Points' );

		const intersection = this.findNearestIntersection( pointerEventData.point, intersections );

		if ( !intersection ) return;

		this.current = intersection.object as any;

		if ( !this.current?.isSelected ) this.current?.onMouseOver();

		return this.current;
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		return pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Points )?.object as any;

	}

	dispose (): void {

		// this.current?.onMouseOut();

		// this.selected?.unselect();

	}

}


