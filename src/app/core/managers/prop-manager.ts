/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicMeta } from 'app/core/models/metadata.model';
import { PropModel } from 'app/core/models/prop-model.model';

export class PropManager {

	private static prop?: DynamicMeta<PropModel>;

	static setProp ( prop: DynamicMeta<PropModel> ) {

		this.prop = prop;

	}

	static getProp (): DynamicMeta<PropModel> {

		return this.prop;

	}
}
