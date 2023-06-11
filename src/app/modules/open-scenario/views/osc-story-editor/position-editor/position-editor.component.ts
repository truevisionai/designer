/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { PositionType } from 'app/modules/open-scenario/models/osc-enums';
import { AbstractPosition } from '../../../models/osc-interfaces';
import { LanePosition } from '../../../models/positions/osc-lane-position';
import { RelativeObjectPosition } from '../../../models/positions/osc-relative-object-position';
import { WorldPosition } from '../../../models/positions/osc-world-position';
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
