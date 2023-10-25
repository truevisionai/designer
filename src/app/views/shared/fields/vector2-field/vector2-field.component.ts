/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Vector2 } from 'three';
import { AbstractFieldComponent } from '../../../../core/components/abstract-field.component';
import { Maths } from '../../../../utils/maths';

@Component( {
	selector: 'app-vector2-field',
	templateUrl: './vector2-field.component.html',
	styleUrls: [ './vector2-field.component.scss' ]
} )
export class Vector2FieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: Vector2;

	@Input() label: string;

	@Input() min: any = -Infinity;

	@Input() max: any = Infinity;

	@Input() step: number = 0.1;

	@Input() z: boolean = true;

	constructor () {
		super();
	}

	ngOnInit () {
	}

	onXChanged ( $event: any ) {

		if ( this.disabled ) return;

		this.value.x = parseFloat( $event );

		if ( Number.isNaN( this.value ) ) this.value.x = 0;

		this.value.x = Maths.clamp( this.value.x, this.min, this.max );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}

	onYChanged ( $event: any ) {

		if ( this.disabled ) return;

		this.value.y = parseFloat( $event );

		if ( Number.isNaN( this.value ) ) this.value.y = 0;

		this.value.y = Maths.clamp( this.value.y, this.min, this.max );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );
	}

}
