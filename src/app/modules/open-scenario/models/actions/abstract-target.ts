/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscTargetType } from '../osc-enums';

export abstract class AbstractTarget {

	abstract targetType: OscTargetType;

	get value () {

		return this.getTarget();

	}

	set value ( value ) {

		this.setTarget( value );

	}

	abstract getTarget (): any;

	abstract setTarget ( value );

}
