/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { EnumOrientationType } from './tv-enums';

export class Orientation {

	public h: number;
	public p: number;
	public r: number;

	public type?: EnumOrientationType;

	toXML (): XmlElement {
		return {
			attr_h: this.h ?? 0,
			attr_p: this.p ?? 0,
			attr_r: this.r ?? 0,
			attr_type: this.type
		};
	}
}

