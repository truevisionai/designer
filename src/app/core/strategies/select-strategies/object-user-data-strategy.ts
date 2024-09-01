/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectionStrategy } from "./select-strategy";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Intersection, Object3D } from "three";
import { TvLane } from "app/map/models/tv-lane";
import { JunctionOverlay } from "app/services/junction/junction-overlay";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { ManeuverMesh } from "app/services/junction/maneuver-mesh";

export class ObjectUserDataStrategy<T> extends SelectionStrategy<T> {

	constructor ( private tag: string, private key?: string ) {
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

export class SelectLaneOverlayStrategy extends ObjectUserDataStrategy<TvLane> {

	constructor () {
		super( 'lane-overlay', 'lane' );
	}

}

export class JunctionOverlaySelectionStrategy extends ObjectUserDataStrategy<JunctionOverlay> {

	constructor () {
		super( JunctionOverlay.tag );
	}

}

export class JunctionSelectionStrategy extends ObjectUserDataStrategy<TvJunction> {

	constructor () {
		super( JunctionOverlay.tag, 'junction' );
	}

}

export class ManeuverMeshSelectionStrategy extends ObjectUserDataStrategy<ManeuverMesh> {

	constructor () {
		super( ManeuverMesh.tag );
	}

}
