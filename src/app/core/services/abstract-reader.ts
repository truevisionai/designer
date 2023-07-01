/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from '../../modules/tv-map/services/open-drive-parser.service';

export abstract class AbstractReader {

	public static readAsOptionalArray ( items: any, callbackFn: ( xml: XmlElement, count: number ) => void ) {

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

	public static readAsOptionalElement ( xml: any, callbackFn: ( xml: XmlElement ) => void ) {

		if ( xml != null ) {

			callbackFn( xml );

		}

	}

	public readAsOptionalArray ( items: any, callbackFn: ( xml: XmlElement, count: number ) => void ) {

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

	public readAsOptionalElement ( xml: XmlElement, callbackFn: ( xml: XmlElement ) => void ) {

		if ( xml != null ) {

			callbackFn( xml );

		}

	}
}
