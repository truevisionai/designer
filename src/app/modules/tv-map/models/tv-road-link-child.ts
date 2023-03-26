/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from './tv-common';

export class TvRoadLinkChild {

	public attr_elementType: string;
	public attr_elementId: number;
	public attr_contactPoint: TvContactPoint;

	constructor ( elementType: string, elementId: number, contactPoint: TvContactPoint ) {
		this.attr_elementType = elementType;
		this.attr_elementId = elementId;
		this.attr_contactPoint = contactPoint;
	}

	get elementType () {
		return this.attr_elementType;
	}

	set elementType ( value ) {
		this.attr_elementType = value;
	}

	get elementId () {
		return this.attr_elementId;
	}

	set elementId ( value ) {
		this.attr_elementId = value;
	}

	get contactPoint () {
		return this.attr_contactPoint;
	}

	set contactPoint ( value ) {
		this.attr_contactPoint = value;
	}
}
