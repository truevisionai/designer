/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TargetType } from '../tv-enums';
import { Target } from './target';

export class AbsoluteTarget extends Target {

	public targetType = TargetType.absolute;

	private target: number;

	constructor ( target: number ) {

		super();

		this.target = target;

	}

	getTarget () {

		return this.target;

	}

	setTarget ( value ): void {

		this.target = value;

	}

}
