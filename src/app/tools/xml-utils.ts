/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from '../modules/tv-map/services/open-drive-parser.service';

export function readXmlArray ( items: any, callbackFn: ( xml: XmlElement, count: number ) => void ) {

	if ( items != null ) {

		if ( Array.isArray( items ) ) {

			for ( const item of items ) {

				callbackFn( item, items.length );

			}

		} else {

			callbackFn( items, 1 );

		}

	}

}

export function readXmlElement ( xml: any, callbackFn: ( xml: XmlElement ) => void ) {

	if ( xml != null ) {

		callbackFn( xml );

	}

}
