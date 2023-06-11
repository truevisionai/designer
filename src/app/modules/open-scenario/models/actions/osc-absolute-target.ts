/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TargetType } from '../osc-enums';
import { AbstractTarget } from './abstract-target';

export class AbsoluteTarget extends AbstractTarget {

	public targetType = TargetType.absolute;

	private target: number;

	constructor ( target: number ) {

		super();

		this.target = target;

	}

	getTarget () {

		return this.target;

	}

	setTarget ( value ) {

		this.target = value;

	}

}
