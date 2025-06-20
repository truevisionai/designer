/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunctionType } from "./tv-junction-type";
import { TvJunction } from "./tv-junction";

export class DefaultJunction extends TvJunction {

	constructor ( name: string, id: number ) {
		super( name, id );
		this.type = TvJunctionType.DEFAULT;
	}

}
