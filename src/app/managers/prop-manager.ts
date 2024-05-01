/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicMeta } from 'app/core/asset/metadata.model';
import { PropModel } from 'app/map/prop-point/prop-model.model';
import { Asset } from 'app/core/asset/asset.model';

export class PropManager {

	private static prop?: DynamicMeta<PropModel>;

	static setProp ( prop: DynamicMeta<PropModel> ) {

		this.prop = prop;

	}

	static getProp (): DynamicMeta<PropModel> {

		return this.prop;

	}

	static getAssetNode (): Asset {

		return this.prop as any;

	}
}
