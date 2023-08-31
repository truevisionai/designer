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

		this.position.setPosition( $event );

		this.positionModified.emit( this.position );

	}

	onRotationChanged ( $event: Vector3 ) {

		this.position.orientation?.copyFromVector3( $event );

		this.positionModified.emit( this.position );

	}
}
