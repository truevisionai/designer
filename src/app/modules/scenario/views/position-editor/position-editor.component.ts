/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { PositionType } from 'app/modules/scenario/models/tv-enums';
import { PositionFactory } from '../../builders/position-factory';
import { Position } from '../../models/position';
import { WorldPosition } from '../../models/positions/tv-world-position';
import { AbstractPositionEditor } from './AbstractPositionEditor';

@Component( {
	selector: 'app-position-editor',
	templateUrl: './position-editor.component.html'
} )
export class PositionEditorComponent extends AbstractPositionEditor implements OnInit {

	constructor () {
		super();
	}

	get types () {
		return PositionType;
	}

	ngOnInit () {


	}

	get worldPosition () {
		return this.position as WorldPosition;
	}

	onPositionTypeChanged ( $type: number ) {

		this.position = PositionFactory.createPosition( $type );

		this.positionChanged.emit( this.position );

	}

	onPositionModified ( $event: Position ) {

		this.positionModified.emit( $event );

	}
}