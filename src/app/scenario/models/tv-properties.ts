/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { File } from './tv-common';

export class TvProperties {

	public properties: TvProperty[];
	public files: File[];

}

export class TvProperty {
	constructor (
		public name: string,
		public value: string
	) {
	}

	clone (): any {
		throw new Error( 'Method not implemented.' );
	}

}
