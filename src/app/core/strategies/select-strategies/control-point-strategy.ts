/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Points } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectionStrategy } from './select-strategy';
import { AbstractControlPoint } from "../../../objects/abstract-control-point";
import { LaneWidthNode } from 'app/tools/lane-width/objects/lane-width-node';

export interface StrategySettings {
	higlightOnHover?: boolean;
	higlightOnSelect?: boolean;
	tag?: string;
	returnParent?: boolean;
	returnTarget?: boolean;
}

/**
 * @deprecated
 */
export class DepPointStrategy<T extends AbstractControlPoint> extends SelectionStrategy<T> {

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

		const nearest = this.findNearestObject( pointerEventData.point, intersections );

		if ( !nearest ) return;

		this.selected = nearest as any;

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

		const nearest = this.findNearestObject( pointerEventData.point, intersections );

		if ( !nearest ) return;

		this.current = nearest as any;

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

export class PointSelectionStrategy extends DepPointStrategy<AbstractControlPoint> {

	constructor ( options?: StrategySettings ) {

		super( {
			higlightOnHover: options?.higlightOnHover || false,
			higlightOnSelect: options?.higlightOnSelect || false,
			tag: options?.tag || null,
			returnParent: options?.returnParent || false,
		} );

	}

}

export class LaneWidthPointSelectionStrategy extends PointSelectionStrategy {

	constructor () {

		super( {
			higlightOnHover: false,
			higlightOnSelect: false,
			tag: LaneWidthNode.pointTag,
			returnParent: false,
		} );

	}

}
