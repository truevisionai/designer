/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { Vector3 } from 'three';
import { RelativeObjectPosition } from '../../../models/positions/tv-relative-object-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-relative-object-position-editor',
	templateUrl: './relative-object-position-editor.component.html',
} )
export class RelativeObjectPositionEditorComponent extends AbstractPositionEditor {

	get relativeObjectPosition () {
		return this.position as RelativeObjectPosition;
	}

	get delta (): Vector3 {
		return new Vector3(
			this.relativeObjectPosition.dx,
			this.relativeObjectPosition.dy,
			this.relativeObjectPosition.dz,
		);
	}

	onDeltaChanged ( $delta: any ) {

		this.relativeObjectPosition.dx = $delta.x;
		this.relativeObjectPosition.dy = $delta.y;
		this.relativeObjectPosition.dz = $delta.z;

		this.positionModified.emit( this.position );
	}

	onEntityChanged ( $entityRef: string ) {

		this.relativeObjectPosition.objectRef = $entityRef;

		this.positionModified.emit( this.position );
	}
}
