/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EntityRef } from '../entity-ref';
import { TargetType } from '../tv-enums';
import { Target } from './target';

export class RelativeTarget extends Target {

	public targetType = TargetType.relative;

	constructor ( public entityRef: EntityRef, public target: number ) {

		super();

	}

	getTarget (): number {

		return this.target;

	}

	setTarget ( value: any ): void {

		this.target = value;

	}

}
