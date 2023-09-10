/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { INode } from 'app/modules/three-js/objects/i-selectable';
import { Points } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { BaseControlPoint } from '../../../modules/three-js/objects/control-point';
import { SelectStrategy } from './select-strategy';

export class ControlPointStrategy<T extends BaseControlPoint> extends SelectStrategy<T> {

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


export class NodeStrategy<T extends INode> extends SelectStrategy<T> {

	private current: T = null;
	private selected: T = null;

	/**
	 *
	 * @param tag tag of the node to be selected
	 * @param returnParent if true, returns the parent of the node, else returns the node itself
	 */
	constructor ( private tag: string, private returnParent: boolean = false ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		this.selected?.unselect();

		const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

		if ( node && this.returnParent ) {

			this.selected = node.parent as any;

		} else {

			this.selected = node as any;

		}

		this.selected?.select();

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		if ( !this.current?.isSelected ) this.current?.onMouseOut();

		const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

		if ( node && this.returnParent ) {

			this.current = node.parent as any;

		} else {

			this.current = node as any;

		}

		if ( !this.current?.isSelected ) this.current?.onMouseOver();

		return this.current;
	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		const node = pointerEventData.intersections.find( i => i.object[ 'tag' ] == this.tag )?.object;

		if ( node && this.returnParent ) {

			return node.parent as any;

		} else {

			return node as any;

		}

	}

	dispose (): void {

		// this.current?.onMouseOut();

		// this.selected?.unselect();

	}

}


