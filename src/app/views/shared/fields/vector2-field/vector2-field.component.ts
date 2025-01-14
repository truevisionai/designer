/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Vector2 } from 'app/core/maths';
import { AbstractFieldComponent } from '../abstract-field.component';

@Component( {
	selector: 'app-vector2-field',
	templateUrl: './vector2-field.component.html',
	styleUrls: [ './vector2-field.component.scss' ]
} )
export class Vector2FieldComponent extends AbstractFieldComponent<Vector2> implements OnInit {

	@Input() value: Vector2;

	@Input() label: string;

	@Input() min: any = -Infinity;

	@Input() max: any = Infinity;

	@Input() step: number = 0.1;

	constructor () {
		super();
	}

	ngOnInit (): void {
	}

	onXChanged ( $value: any ): void {

		this.onAxisChanged( $value, 'x' );

	}

	onYChanged ( $value: any ): void {

		this.onAxisChanged( $value, 'y' );

	}

	private onAxisChanged ( value: any, axis: 'x' | 'y' ): void {

		if ( this.disabled ) return;

		const newValue = this.parseFloat( value, this.min, this.max );

		this.updateAxisValue( axis, newValue );

		this.emitChanges( this.value );

	}

	private updateAxisValue ( axis: 'x' | 'y', newValue: number ): void {

		this.value[ axis ] = newValue;

	}

}
