/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { Vector3 } from 'three';
import { RelativeWorldPosition } from '../../../models/positions/tv-relative-world-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-relative-world',
	templateUrl: './relative-world.component.html',
	styleUrls: [ './relative-world.component.scss' ]
} )
export class RelativeWorldComponent extends AbstractPositionEditor {

	get relativeWorldPosition () {
		return this.position as RelativeWorldPosition;
	}

	get delta (): Vector3 {
		return this.relativeWorldPosition.delta;
	}

	onDeltaChanged ( $delta: Vector3 ) {

		this.relativeWorldPosition.delta = $delta;

		this.positionModified.emit( this.position );
	}

	onEntityChanged ( $entityRef: string ) {

		this.relativeWorldPosition.entityName = $entityRef;

		this.positionModified.emit( this.position );
	}
}
