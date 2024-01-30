/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ToolType } from "../../tools/tool-types.enum";
import { HasSpline } from 'app/services/debug/data.service';
import { ToolHints } from "../interfaces/tool.hints";

@Injectable( {
	providedIn: 'root'
} )
export class ToolHintsProvider {

	constructor () {
	}

	createFromToolType ( type: ToolType ): ToolHints<any> {

		if ( type === ToolType.PropPolygon ) return this.createSplineToolHints( 'polygon', 3 );

		if ( type === ToolType.PropCurve ) return this.createSplineToolHints( 'curve', 2 );

		return {
			toolOpened: () => null,
			toolClosed: () => null,
			objectAdded: () => null,
			objectUpdated: () => null,
			objectRemoved: () => null,
			objectSelected: () => null,
			objectUnselected: () => null,
			pointAdded: () => null,
			pointUpdated: () => null,
			pointRemoved: () => null,
			pointSelected: () => null,
			pointUnselected: () => null,
			assetDropped: () => null,
		};

	}

	private createSplineToolHints ( name: string, min: number ): ToolHints<HasSpline> {

		return {
			toolOpened: () => 'Press LEFT CLICK to select a point. Press SHIFT + LEFT CLICK to create a point.',
			toolClosed: () => '',
			objectAdded: ( object ) => {
				if ( object.spline?.controlPoints?.length < min ) {
					return `Add at least ${ min } control points to create ${ name }.`
				} else {
					return `Drag control points to adjust the ${ name }.`
				}
			},
			objectUpdated: () => '',
			objectRemoved: () => 'Press CTRL + Z to undo the last action.',
			objectSelected: ( object ) => {
				if ( object.spline?.controlPoints?.length < min ) {
					return `Add at least ${ min } control points to create ${ name }.`
				} else {
					return `Drag points to modify the ${ name }, or adjust values in the inspector.`
				}
			},
			objectUnselected: () => 'Press LEFT CLICK to select a point. Press SHIFT + LEFT CLICK to create a point.',
			pointAdded: () => `Drag control points to adjust the ${ name }.`,
			pointUpdated: () => '',
			pointRemoved: () => 'Press CTRL + Z to undo the last action.',
			pointSelected: ( object ) => {
				if ( object.spline?.controlPoints?.length < min ) {
					return `Add at least ${ min } control points to create ${ name }.`
				} else {
					return `Drag points to modify the ${ name }, or adjust values in the inspector.`
				}
			},
			pointUnselected: () => 'Press LEFT CLICK again to deselect ${name}.',
			assetDropped: () => 'Click to place the asset.',
		};

	}

}
