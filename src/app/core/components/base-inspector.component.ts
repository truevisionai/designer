/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener } from '@angular/core';

@Component( {
	selector: 'app-base-inspector',
	template: '',
} )
export abstract class BaseInspector {

	@HostListener( 'window:keydown', [ '$event' ] )
	baseOnKeyDown ( event: KeyboardEvent ) {

		if ( event.key === 'Delete' || ( event.key === 'Backspace' && event.metaKey ) ) {
			this.onDelete();
		}

	}

	onDelete () {

	}
}
