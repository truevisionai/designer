/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, HostListener } from '@angular/core';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';

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

		if ( event.keyCode === KEY_CODE.DELETE ) {

			this.onDelete();

		}

	}


	onDelete () {

	}
}
