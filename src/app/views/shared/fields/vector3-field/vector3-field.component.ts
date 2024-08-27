/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Vector3 } from 'three';
import { AbstractFieldComponent } from '../abstract-field.component';
import { Maths } from '../../../../utils/maths';

@Component( {
	selector: 'app-vector3-field',
	templateUrl: './vector3-field.component.html',
	styleUrls: [ './vector3-field.component.scss' ]
} )
export class Vector3FieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: Vector3;

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

	onXChanged ( $value: any ): void {

		this.onAxisChanged( $value, 'x' );

	}

	onYChanged ( $value: any ): void {

		this.onAxisChanged( $value, 'y' );
	}

	onZChanged ( $value: any ): void {

		if ( !this.z ) return;

		this.onAxisChanged( $value, 'z' );

	}

	private onAxisChanged ( value: any, axis: 'x' | 'y' | 'z' ): void {

		if ( this.disabled ) return;

		const newValue = this.parseAndClampValue( value );

		this.updateAxisValue( axis, newValue );

		this.emitChanges();

	}

	private parseAndClampValue ( value: any ): number {

		let parsedValue = parseFloat( value );

		if ( Number.isNaN( parsedValue ) ) parsedValue = 0;

		return Maths.clamp( parsedValue, this.min, this.max );

	}

	private updateAxisValue ( axis: 'x' | 'y' | 'z', newValue: number ): void {

		this.value[ axis ] = newValue;

	}

	private emitChanges (): void {

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );
	}

}
