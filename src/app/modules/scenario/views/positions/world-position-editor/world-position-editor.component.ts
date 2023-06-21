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

		this.position.x = $event.x;
		this.position.y = $event.y;
		this.position.z = $event.z;

		this.positionModified.emit( this.position );

	}

	onRotationChanged ( $event: Vector3 ) {

		this.position.h = $event.x * MathUtils.DEG2RAD;
		this.position.p = $event.y * MathUtils.DEG2RAD;
		this.position.r = $event.z * MathUtils.DEG2RAD;

		this.positionModified.emit( this.position );

	}
}
