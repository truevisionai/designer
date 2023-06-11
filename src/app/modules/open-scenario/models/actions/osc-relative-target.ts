/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TargetType } from '../osc-enums';
import { AbstractTarget } from './abstract-target';

export class RelativeTarget extends AbstractTarget {

	public targetType = TargetType.relative;

	constructor ( public object: string, public target: number ) {

		super();

	}

	getTarget () {

		return this.target;

	}

	setTarget ( value ) {

		this.target = value;

	}

}
