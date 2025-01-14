/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input } from '@angular/core';
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { Vector3 } from 'app/core/maths';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-world-position-editor',
	templateUrl: './world-position-editor.component.html'
} )
export class WorldPositionEditorComponent extends AbstractPositionEditor {

	@Input() position: WorldPosition;

	onPositionChanged ( $event: Vector3 ): void {

		this.position.setPosition( $event );

		this.positionModified.emit( this.position );

	}

	onRotationChanged ( $event: Vector3 ): void {

		this.position.orientation?.copyFromVector3( $event );

		this.positionModified.emit( this.position );

	}
}
