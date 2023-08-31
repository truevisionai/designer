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
		return this.relativeObjectPosition.delta;
	}

	onDeltaChanged ( $delta: any ) {

		this.relativeObjectPosition.delta = $delta;

		this.positionModified.emit( this.position );
	}

	onEntityChanged ( $entityName: string ) {

		this.relativeObjectPosition.entityRef.name = $entityName;

		this.positionModified.emit( this.position );
	}
}
