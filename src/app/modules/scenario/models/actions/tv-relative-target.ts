/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { TargetType } from '../tv-enums';
import { Target } from './target';

export class RelativeTarget extends Target {

	public targetType = TargetType.relative;

	constructor ( public entityName: string, public target: number ) {

		super();

	}

	get entity () {

		return TvScenarioInstance.scenario.findEntityOrFail( this.entityName );

	}

	getTarget () {

		return this.target;

	}

	setTarget ( value ) {

		this.target = value;

	}

}