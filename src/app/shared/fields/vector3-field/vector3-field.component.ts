import { Component, Input, OnInit } from '@angular/core';
import { Vector3 } from 'three';
import { AbstractFieldComponent } from '../../../core/components/abstract-field.component';
import { Maths } from '../../../utils/maths';

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

	onZChanged ( $event: any ) {

		if ( this.disabled ) return;

		this.value.z = parseFloat( $event );

		if ( Number.isNaN( this.value ) ) this.value.z = 0;

		this.value.z = Maths.clamp( this.value.z, this.min, this.max );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}
}
