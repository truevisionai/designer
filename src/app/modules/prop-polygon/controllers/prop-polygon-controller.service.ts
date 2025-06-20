/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseController } from 'app/core/controllers/base-controller';
import { PropPolygonInspector } from 'app/map/prop-polygon/prop-polygon.inspector';
import { PropPolygon } from 'app/map/prop-polygon/prop-polygon.model';
import { PropPolygonService } from 'app/map/prop-polygon/prop-polygon.service';

@Injectable()
export class PropPolygonController extends BaseController<PropPolygon> {

	constructor ( private service: PropPolygonService ) {

		super();

	}

	onAdded ( object: PropPolygon ): void {

		this.service.add( object );

	}

	onUpdated ( object: PropPolygon ): void {

		this.service.update( object );

	}

	onRemoved ( object: PropPolygon ): void {

		this.service.remove( object );

	}

	showInspector ( object: PropPolygon ): void {

		this.setInspector( new PropPolygonInspector( object ) );

	}

}
