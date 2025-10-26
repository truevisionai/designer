/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseController } from 'app/core/controllers/base-controller';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { PropPointService } from 'app/map/prop-point/prop-point.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropInstanceController extends BaseController<PropInstance> {

	constructor ( private readonly service: PropPointService ) {
		super();
	}

	onAdded ( object: PropInstance ): void {
		this.service.add( object );
	}

	onUpdated ( object: PropInstance ): void {
		this.service.update( object );
	}

	onRemoved ( object: PropInstance ): void {
		this.service.remove( object );
		this.clearInspector();
	}

	showInspector ( object: PropInstance ): void {
		this.setInspector( object );
	}

}
