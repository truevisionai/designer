/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from 'app/modules/tv-map/services/open-drive-parser.service';
import { File } from './tv-common';

export class TvProperties {

	public properties: TvProperty[];
	public files: File[];

}

export class TvProperty {
	clone (): any {
		throw new Error( 'Method not implemented.' );
	}

	constructor (
		public name: string,
		public value: string
	) { }

}
