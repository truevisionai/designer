/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from "../importers/xml.element";

export function readXmlArray ( items: any, callbackFn: ( xml: XmlElement, count: number ) => void ): void {

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

export function readXmlElement ( xml: any, callbackFn: ( xml: XmlElement ) => void ): void {

	if ( xml != null ) {

		callbackFn( xml );

	}

}

export function toArray ( items: any ): Record<string, any>[] {

    if ( items != null ) {

        if ( Array.isArray( items ) ) {

            return items;

        } else {

            return [ items ];

        }

    }

    return [];

}
