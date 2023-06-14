/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { PositionType } from 'app/modules/scenario/models/tv-enums';
import { AbstractPosition } from '../../models/tv-interfaces';
import { LanePosition } from '../../models/positions/tv-lane-position';
import { RelativeObjectPosition } from '../../models/positions/tv-relative-object-position';
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

	get worldPosition() { return this.position as WorldPosition }

	onChange ( e: number ) {

		switch ( e ) {

			case this.types.World:
				this.position = new WorldPosition();
				break;

			// case this.types.Road:
			//     this.position = new RoadPosition();
			//     break;

			case this.types.Lane:
				this.position = new LanePosition();
				break;

			case this.types.RelativeObject:
				this.position = new RelativeObjectPosition();
				break;

			default:
				break;

		}


		this.positionChanged.emit( this.position );

	}

	onPositionModified ( $event: AbstractPosition ) {

		this.positionModified.emit( $event );

	}
}
