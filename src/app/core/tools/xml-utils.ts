export function readXmlArray ( items: any, callbackFn: ( xml: any, count: number ) => void ) {

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

export function readXmlElement ( xml: any, callbackFn: ( xml: any ) => void ) {

	if ( xml != null ) {

		callbackFn( xml );

	}

}
