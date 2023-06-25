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

	constructor ( public name: string, public value: string ) { }

	static fromXML ( xml: XmlElement ): TvProperty {

		const name = xml.attr_name;
		const value = xml.attr_value;

		return new TvProperty( name, value );

	}

}
