/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TargetType } from '../tv-enums';

export abstract class Target {

	abstract targetType: TargetType;

	types = TargetType;

	get value () {

		return this.getTarget();

	}

	set value ( value ) {

		this.setTarget( value );

	}

	abstract getTarget (): any;

	abstract setTarget ( value: any ): any;

	reset (): void {


	}
}
