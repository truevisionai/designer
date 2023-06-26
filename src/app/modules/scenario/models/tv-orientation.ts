/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler } from 'three';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { OpenScenarioVersion, OrientationType } from './tv-enums';

export class Orientation {

	constructor (
		public h: number = 0,
		public p: number = 0,
		public r: number = 0,
		public type: OrientationType = OrientationType.absolute
	) {
	}

	toXML ( version?: OpenScenarioVersion ) {
		return {
			attr_h: this.h ?? 0,
			attr_p: this.p ?? 0,
			attr_r: this.r ?? 0,
			attr_type: this.type
		};
	}

	static fromXML ( xml: XmlElement ): Orientation {

		const h: number = parseFloat( xml?.attr_h || 0 );
		const p: number = parseFloat( xml?.attr_p || 0 );
		const r: number = parseFloat( xml?.attr_r || 0 );

		let type: OrientationType = OrientationType.absolute;

		if ( xml?.attr_type && xml?.attr_type === OrientationType.relative ) {
			type = OrientationType.relative;
		}

		return new Orientation( h, p, r, type );
	}

	toEuler (): Euler {
		return new Euler( this.h, this.p, this.r );
	}

	getRelativeOrientation ( orientation: Orientation ): Orientation {

		return new Orientation(
			this.h + orientation.h,
			this.p + orientation.p,
			this.r + orientation.r,
			OrientationType.relative
		);
	}
}

