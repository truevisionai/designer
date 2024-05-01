/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, MathUtils } from "three";

export class TvGeometry extends BufferGeometry {

	constructor ( public guid: string = MathUtils.generateUUID() ) {
		super();
	}

}
