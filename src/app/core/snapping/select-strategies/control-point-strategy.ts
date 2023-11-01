/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Points } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { AbstractControlPoint } from "../../../modules/three-js/objects/abstract-control-point";

export class ControlPointStrategy<T extends AbstractControlPoint> extends SelectStrategy<T> {

	private current: T = null;
	private selected: T = null;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		this.selected?.unselect();

		this.selected = pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Points )?.object as any;

		this.selected?.select();

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		if ( !this.current?.isSelected ) this.current?.onMouseOut();

		this.current = pointerEventData.intersections
			.filter( i => i.object.visible )
			.find( i => i.object instanceof Points )?.object as any;

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


