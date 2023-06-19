/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { RelativeObjectPosition } from '../../../models/positions/tv-relative-object-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';
import { Position } from 'app/modules/scenario/models/position';

@Component( {
	selector: 'app-relative-object-position-editor',
	templateUrl: './relative-object-position-editor.component.html',
} )
export class RelativeObjectPositionEditorComponent extends AbstractPositionEditor {

	@Input() position: Position;

	get relativeObjectPosition () {
		return this.position as RelativeObjectPosition;
	}

	constructor () {
		super();
	}

	onEntityChanged ( $event: any ) {

		this.relativeObjectPosition.object = $event;

		this.positionModified.emit( this.position );

	}
}
