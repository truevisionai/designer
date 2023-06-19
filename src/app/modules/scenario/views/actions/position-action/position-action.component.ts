/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractPosition } from '../../../models/abstract-position';
import { PrivateAction } from '../../../models/private-action';
import { PositionAction } from '../../../models/actions/tv-position-action';
import { EntityObject } from '../../../models/tv-entities';

@Component( {
	selector: 'app-position-action',
	templateUrl: './position-action.component.html'
} )
export class PositionActionComponent implements OnInit {

	@Input() action: PrivateAction;
	@Input() entity: EntityObject;

	constructor () {

	}

	get positionAction () { return this.action as PositionAction }

	get position () { return this.positionAction?.position; }

	ngOnInit () {


	}

	onPositionChanged ( $event: AbstractPosition ) {

		this.positionAction?.setPosition( $event );

		if ( this.entity ) this.action.execute( this.entity );

	}

	onPositionModified ( $event: AbstractPosition ) {

		this.positionAction?.setPosition( $event );

		if ( this.entity ) this.action.execute( this.entity );

	}

}
