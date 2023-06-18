/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Maths } from 'app/utils/maths';
import { AbstractFieldComponent } from '../../../core/components/abstract-field.component';

@Component( {
	selector: 'app-double-field',
	templateUrl: './double-field.component.html',
	styleUrls: [ './double-field.component.css' ]
} )
export class DoubleFieldComponent extends AbstractFieldComponent implements OnInit {

	@Input() value: any;

	@Input() label: string;

	@Input() min: any = -Infinity;

	@Input() max: any = Infinity;

	@Input() step: number = 0.1;

	@Input() suffix: string;

	inFocus = false;

	sendTimeout: any;

	constructor () {

		super();

	}

	ngOnInit () {

		this.min = parseFloat( this.min );
		this.max = parseFloat( this.max );
		this.value = parseFloat( this.value );

	}

	onBlur () {

		this.inFocus = false;

	}

	onFocus () {

		this.inFocus = true;

	}

	onWheel ( $event: WheelEvent ) {

		if ( this.disabled ) return;

		if ( !this.inFocus ) return;

		// presvent default action to stop scrolling
		$event.preventDefault();
		$event.stopPropagation();

		// console.log( $event.deltaX, $event.deltaY );

		if ( $event.deltaY < 0 && this.value < this.max ) {
			this.value += this.step;
		} else if ( $event.deltaY < 0 && this.value >= this.max ) this.value = this.max;

		if ( $event.deltaY > 0 && this.value > this.min ) {
			this.value -= this.step;
		} else if ( $event.deltaY > 0 && this.value <= this.min ) this.value = this.min;

		this.value = +this.value.toFixed( 3 );

		if ( Number.isNaN( this.value ) ) this.value = 0;

		this.value = Maths.clamp( this.value, this.min, this.max );

		// this helps avoid sending update event in every scroll

		if ( this.sendTimeout ) {

			clearTimeout( this.sendTimeout );

		}

		this.sendTimeout = setTimeout( () => {

			this.valueChanged.emit( this.value );

			this.changed.emit( this.value );

		}, 300 );
	}

	onModelChanged ( $event: any ) {

		if ( this.disabled ) return;

		this.value = parseFloat( $event );

		if ( Number.isNaN( this.value ) ) this.value = 0;

		this.value = Maths.clamp( this.value, this.min, this.max );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}

}
