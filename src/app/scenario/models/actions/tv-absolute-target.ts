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

	getTarget (): number {

		return this.target;

	}

	setTarget ( value: any ): void {

		this.target = value;

	}

}
