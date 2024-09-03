/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Intersection } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectionStrategy } from './select-strategy';
import { JunctionNode } from 'app/services/junction/junction-node';
import { JunctionGateLine } from 'app/services/junction/junction-gate-line';
import { JunctionGatePoint } from 'app/objects/junctions/junction-gate-point';

export class ObjectTagStrategy<T> extends SelectionStrategy<T> {

	constructor ( private tag: string, private attributeName?: keyof T ) {

		super();

	}

	onPointerDown ( pointerEventData: PointerEventData ): T {

		return this.processIntersections( pointerEventData.intersections );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): T {

		return this.processIntersections( pointerEventData.intersections );

	}

	onPointerUp ( pointerEventData: PointerEventData ): T {

		return this.processIntersections( pointerEventData.intersections );

	}

	private processIntersections ( intersections: Intersection[] ): T {

		const object = this.findByTag( this.tag, intersections );

		return object ? this.getAttribute( object ) : null;

	}

	private getAttribute ( object: any ): T {

		return this.attributeName ? object[ this.attributeName ] : object;

	}

	dispose (): void {

		// do nothing

	}

}

export class JunctionNodeSelectionStrategy extends ObjectTagStrategy<JunctionNode> {

	constructor () {
		super( JunctionNode.tag );
	}
}

export class JunctionGateLineSelectionStrategy extends ObjectTagStrategy<JunctionGateLine> {

	constructor () {
		super( JunctionGateLine.tag );
	}
}

export class JunctionGatePointSelectionStrategy extends ObjectTagStrategy<JunctionGatePoint> {

	constructor () {
		super( JunctionGatePoint.tag );
	}
}
