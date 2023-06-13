/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { PositionAction } from '../../../../../models/actions/osc-position-action';
import { EntityObject } from '../../../../../models/osc-entities';
import { AbstractPosition, AbstractPrivateAction } from '../../../../../models/osc-interfaces';

@Component( {
	selector: 'app-position-action-editor',
	templateUrl: './position-action-editor.component.html'
} )
export class PositionActionEditorComponent implements OnInit {

	@Input() action: AbstractPrivateAction;
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
