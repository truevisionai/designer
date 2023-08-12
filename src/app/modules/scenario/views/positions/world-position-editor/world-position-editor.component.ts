/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { WorldPosition } from 'app/modules/scenario/models/positions/tv-world-position';
import { MathUtils, Vector3 } from 'three';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-world-position-editor',
	templateUrl: './world-position-editor.component.html'
} )
export class WorldPositionEditorComponent extends AbstractPositionEditor {

	@Input() position: WorldPosition;

	onPositionChanged ( $event: Vector3 ) {

		this.position.vector3.x = $event.x;
		this.position.vector3.y = $event.y;
		this.position.vector3.z = $event.z;

		this.positionModified.emit( this.position );

	}

	onRotationChanged ( $event: Vector3 ) {

		this.position.orientation.h = $event.x;
		this.position.orientation.p = $event.y;
		this.position.orientation.r = $event.z;

		this.positionModified.emit( this.position );

	}
}
