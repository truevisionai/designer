/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectStrategy } from "./select-strategy";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Intersection, Object3D } from "three";

export class ObjectUserDataStrategy<T> extends SelectStrategy<T> {

	constructor ( private tag: string, private key: string ) {
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

	private getAttribute ( object: Object3D ): T {

		return this.key ? object.userData[ this.key ] : object;

	}

	dispose (): void {

		// do nothing

	}

}
