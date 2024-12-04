/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { RoadPosition } from '../../../models/positions/tv-road-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-road-position-editor',
	templateUrl: './road-position-editor.component.html'
} )
export class RoadPositionEditorComponent extends AbstractPositionEditor {

	get roadPosition () {
		return this.position as RoadPosition;
	}

	get max () {
		return this.roadPosition.getRoad().length;
	}

	onSValueChanged ( $value: number ): void {
		this.roadPosition.sValue = $value;
		this.positionModified.emit( this.position );
	}

	onTValueChanged ( $value: number ): void {
		this.roadPosition.tValue = $value;
		this.positionModified.emit( this.position );
	}

	onRoadIdChanged ( $roadId: number ): void {
		this.roadPosition.roadId = $roadId;
		this.positionModified.emit( this.position );
	}
}
