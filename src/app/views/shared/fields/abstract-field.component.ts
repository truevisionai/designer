/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Maths } from 'app/utils/maths';

@Component( {
	selector: 'app-abstract-field-inspector',
	template: '',
} )
export abstract class AbstractFieldComponent<T> {

	@Output() clicked = new EventEmitter<void>();

	@Input() disabled: boolean = false;

	@Input() abstract value: T;

	@Input() label: string = '';

	/**
	 * @deprecated use changed event instead
	 */
	@Output() valueChanged = new EventEmitter<T>();

	@Output() changed = new EventEmitter<T>();

	get isParameter (): boolean {

		return typeof this.value === 'string' && this.value.indexOf( '$' ) !== -1;

	}

	get fieldValue () {

		if ( this.isParameter ) {

			// return SourceFile.scenario.findParameter( this.value ).value;

		}

		return this.value;
	}

	set fieldValue ( value ) {

		if ( this.isParameter ) {

			// SourceFile.scenario.findParameter( this.value ).value = value;

		} else {

			this.value = value;

		}

	}

	onModelChanged ( $event: any ) {

		this.value = $event;

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}

	onFieldValueChanged ( $event: any ) {

		this.fieldValue = $event;

		if ( !this.isParameter ) this.valueChanged.emit( this.fieldValue );

		if ( !this.isParameter ) this.changed.emit( this.fieldValue );

	}

	protected parseFloat ( value: any, min: number, max: number ): number {

		let parsedValue = parseFloat( value );

		if ( Number.isNaN( parsedValue ) ) parsedValue = 0;

		return Maths.clamp( parsedValue, min, max );

	}

	protected emitChanges ( value: any ): void {

		this.valueChanged.emit( value );

		this.changed.emit( value );
	}

}
