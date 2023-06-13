/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TargetType } from '../osc-enums';

export abstract class AbstractTarget {

	abstract targetType: TargetType;

	protected absoluteTarget: number;

	get value () {

		return this.getTarget();

	}

	set value ( value ) {

		this.setTarget( value );

	}

	abstract getTarget (): any;

	abstract setTarget ( value );

	reset () {

		this.absoluteTarget = null;

	}
}
