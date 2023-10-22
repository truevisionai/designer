/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvConsole } from '../utils/console';

export interface Copiable {
	copyProperties?(): Object;
}

export class PropertyCopyService {

	private static debug = false;

	private static copiedProperties: Object = {};

	public static copyProperties ( source: Copiable ): void {

		this.copiedProperties = source.copyProperties ? source.copyProperties() : {};

	}

	public static pasteProperties ( target: Copiable ): void {

		for ( const prop in this.copiedProperties ) {

			target[ prop ] = this.copiedProperties[ prop ];

			if ( this.debug ) {

				TvConsole.info( 'Copied ' + prop + ' = ' + this.copiedProperties[ prop ] );

			}
		}
	}
}
