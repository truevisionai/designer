/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';

export class EntityManager {

	private static entity?: ScenarioEntity;

	static setEntity ( entity: ScenarioEntity ) {

		this.entity = entity;

	}

	static getEntity<T extends ScenarioEntity> (): T {

		return this.entity as T;

	}
}
