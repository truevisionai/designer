/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';
import { Color } from 'three';

@Component( {
	selector: 'app-color-field',
	templateUrl: './color-field.component.html',
	styleUrls: [ './color-field.component.css' ]
} )
export class ColorFieldComponent extends AbstractFieldComponent<Color> implements OnInit {

	/**
	 * This is the toogle button elemenbt, look at HTML and see its defination
	 */
	@ViewChild( 'toggleButton' ) toggleButton: ElementRef;
	@ViewChild( 'colorPicker' ) colorPicker: ElementRef;

	@Input() isPickerOpen = false;

	@Input() value: Color;

	@Input() position = 'top';

	get hex () {
		return '#' + this.value.getHexString();
	}

	set hex ( value: string ) {

		this.value.setStyle( value );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}

	ngOnInit (): void {

		this.value = new Color( this.value ).copy( this.value );

	}

	onChange ( $event: any ): void {

		// do nothing

	}

	onChangeCompleted ( $event: any ): void {

		this.value.setStyle( $event.color.hex );

		this.valueChanged.emit( this.value );

		this.changed.emit( this.value );

	}

	togglePicker (): void {

		if ( !this.isPickerOpen ) {

			this.isPickerOpen = true;

		} else {

			this.isPickerOpen = false;

		}

	}

	@HostListener( 'window:mousedown', [ '$event' ] )
	onGlobalClick ( e: any ): void {

		if ( !this.colorPicker.nativeElement.contains( event.target ) ) {

			// clicked outside
			this.isPickerOpen = false;
		}

	}
}
