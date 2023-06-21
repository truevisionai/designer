/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler } from 'three';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { EnumOrientationType } from './tv-enums';

export class Orientation {

	constructor (
		public h: number = 0,
		public p: number = 0,
		public r: number = 0,
		public type: EnumOrientationType = EnumOrientationType.absolute
	) {
	}

	toXML (): XmlElement {
		return {
			attr_h: this.h ?? 0,
			attr_p: this.p ?? 0,
			attr_r: this.r ?? 0,
			attr_type: this.type
		};
	}

	toEuler (): Euler {
		return new Euler( this.h, this.p, this.r );
	}
}

