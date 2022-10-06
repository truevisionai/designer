/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export abstract class AbstractReader {

    public static readAsOptionalArray ( items: any, callbackFn: ( xml: any, count: number ) => void ) {

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

    public static readAsOptionalElement ( xml: any, callbackFn: ( xml: any ) => void ) {

        if ( xml != null ) {

            callbackFn( xml );

        }

    }

    public readAsOptionalArray ( items: any, callbackFn: ( xml: any, count: number ) => void ) {

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

    public readAsOptionalElement ( xml: any, callbackFn: ( xml: any ) => void ) {

        if ( xml != null ) {

            callbackFn( xml );

        }

    }
}
