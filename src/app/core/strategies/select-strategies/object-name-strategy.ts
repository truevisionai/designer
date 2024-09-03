/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { Intersection, Object3D } from "three";
import { NewSelectionStrategy } from "./select-strategy";
import { LaneWidthLine } from "../../../tools/lane-width/objects/lane-width-line";

export class ObjectNameStrategy<T extends Object3D> extends NewSelectionStrategy<T> {

	constructor ( private objectName: string ) {

		super();

	}

	handleSelection ( e: PointerEventData ): T {

		return this.findByName( this.objectName, e.intersections );

	}

	private findByName ( objectName: string, intersections: Intersection[] ): T | undefined {

		return intersections.find( intersection => intersection?.object.constructor.name === objectName )?.object as T;

	}

}

export class LaneWidthLineSelectionStrategy extends ObjectNameStrategy<LaneWidthLine> {

	constructor () {

		super( LaneWidthLine.name );

	}

}
