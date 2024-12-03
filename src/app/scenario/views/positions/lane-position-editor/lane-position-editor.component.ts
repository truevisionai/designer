/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { LanePosition } from '../../../models/positions/tv-lane-position';
import { AbstractPositionEditor } from '../../position-editor/AbstractPositionEditor';

@Component( {
	selector: 'app-lane-position-editor',
	templateUrl: './lane-position-editor.component.html'
} )
export class LanePositionEditorComponent extends AbstractPositionEditor {

	get lanePosition () {
		return this.position as LanePosition;
	}

	get laneIdOptions (): number[] {
		return this.lanePosition.getLaneArray().map( lane => lane.id );
	}

	onRoadIdChanged ( $event: any ): void {
		this.lanePosition.roadId = parseFloat( $event );
		this.positionModified.emit( this.position );
	}

	onSValueChanged ( $event: any ): void {
		this.lanePosition.sCoordinate = parseFloat( $event );
		this.positionModified.emit( this.position );
	}

	onLaneIdChanged ( $event: any ): void {
		this.lanePosition.laneId = parseFloat( $event );
		this.positionModified.emit( this.position );
	}

	onOffsetChanged ( $event: any ): void {
		this.lanePosition.offset = parseFloat( $event );
		this.positionModified.emit( this.position );
	}
}
