/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener } from '@angular/core';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-instance';

enum KEY_CODE {
	DELETE = 46
}

@Component( {
	selector: 'app-base-inspector',
	template: '',
} )
export abstract class BaseInspector {

	get map () {
		return TvMapInstance.map;
	}

	@HostListener( 'window:keydown', [ '$event' ] )
	baseOnKeyDown ( event: KeyboardEvent ) {

		if ( event.key === 'Delete' || ( event.key === 'Backspace' && event.metaKey ) ) {
			this.onDelete();
		}

	}


	onDelete () {

	}
}
