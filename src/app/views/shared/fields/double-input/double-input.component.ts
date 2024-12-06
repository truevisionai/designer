/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Log } from 'app/core/utils/log';
import { Maths } from 'app/utils/maths';

@Component( {
	selector: 'app-double-input',
	templateUrl: './double-input.component.html',
	styleUrls: [ './double-input.component.scss' ]
} )
export class DoubleInputComponent implements OnInit {

	@Output() changed = new EventEmitter<number>();

	@Input() value: any;

	@Input() disabled: boolean = false;

	@Input() label: string;

	@Input() min: any = -Infinity;

	@Input() max: any = Infinity;

	@Input() step: number = 0.1;

	inFocus = false;

	sendTimeout: any;

	lastValue: number;

	constructor () { }

	static isNumeric ( value: string ): boolean {

		// Allow for a trailing decimal point
		return /^-?\d*\.?\d*\.?$/.test( value );

	}

	ngOnInit (): void {

		this.min = parseFloat( this.min );
		this.max = parseFloat( this.max );
		this.value = parseFloat( this.value );

	}

	onBlur (): void {

		this.inFocus = false;

		this.fireChangedEvent();

	}

	onFocus (): void {

		this.inFocus = true;

	}

	onWheel ( $event: WheelEvent ): void {

		// presvent default action to stop scrolling
		$event.preventDefault();
		$event.stopPropagation();

		if ( this.disabled ) return;

		if ( !this.inFocus ) return;

		try {

			if ( $event.deltaY < 0 && this.value < this.max ) {

				this.value += this.step;

			} else if ( $event.deltaY < 0 && this.value >= this.max ) {

				this.value = this.max;
			}

			if ( $event.deltaY > 0 && this.value > this.min ) {

				this.value -= this.step;

			} else if ( $event.deltaY > 0 && this.value <= this.min ) {

				this.value = this.min;

			}

			this.value = +this.value.toFixed( 3 );

			if ( Number.isNaN( this.value ) ) this.value = 0;

			this.value = Maths.clamp( this.value, this.min, this.max );

		} catch ( error ) {

			Log.error( error );

		}

	}

	onModelChanged ( $value: any ): void {

		if ( this.disabled ) return;

		const value = parseFloat( $value )

		if ( Number.isNaN( value ) ) {

			this.value = 0;

		} else {

			this.value = Maths.clamp( value, this.min, this.max );

		}
	}

	@HostListener( 'keydown', [ '$event' ] )
	onKeydown ( $event: KeyboardEvent ): void {

		if ( this.disabled ) return;

		if ( !this.inFocus ) return;

		if ( $event.key === 'Enter' ) {

			this.fireChangedEvent();

		}

	}

	fireChangedEvent (): void {

		let value = parseFloat( this.value );

		if ( Number.isNaN( value ) ) {

			value = 0;

		}

		value = Maths.clamp( value, this.min, this.max );

		if ( value == this.lastValue ) return;

		this.changed.emit( value );

		this.lastValue = value;

	}

	onInput ( $event: any ): void {


	}

}
