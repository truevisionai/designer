/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropPolygon } from '../../map/prop-polygon/prop-polygon.model';
import { ToolType } from '../../tools/tool-types.enum';
import { PropPolygonInspector } from "../../map/prop-polygon/prop-polygon.inspector";
import { Injectable } from '@angular/core';
import { ToolWithHandler } from '../../tools/base-tool-v2';
import { PointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { BaseToolService } from 'app/tools/base-tool.service';
import { PropPolygonPointController } from './controllers/prop-polygon-point-controller.service';
import { PropPolygonController } from './controllers/prop-polygon-controller.service';
import { PropPolygonPoint } from './objects/prop-polygon-point';
import { PropPolygonCreator, PropPolygonPointCreator } from './creator';
import { PropPolygonPointVisualizer, PropPolygonVisualizer } from './visualiser';
import { SimpleControlPointDragHandler } from 'app/core/drag-handlers/point-drag-handler.service';
import { NewSelectionStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvMap } from 'app/map/models/tv-map.model';
import { MapService } from 'app/services/map/map.service';
import { Vector3 } from 'three';

@Injectable()
export class PropPolygonToolService {

	constructor (
		public base: BaseToolService,
		public mapService: MapService,
	) {
	}
}

export class PropPolygonTool extends ToolWithHandler {

	public name: string = 'PropPolygonTool';

	public toolType: ToolType = ToolType.PropPolygon;

	constructor ( private tool: PropPolygonToolService ) {

		super();

	}


	init (): void {

		super.init();

		this.setTypeName( PropPolygon.name );

		this.addSelectionStrategy( PropPolygonPoint, new PointSelectionStrategy() );
		this.addSelectionStrategy( PropPolygon, new PropPolygonSelectionStrategy( this.tool.mapService.map ) );

		this.addController( PropPolygonPoint, this.tool.base.injector.get( PropPolygonPointController ) );
		this.addController( PropPolygon, this.tool.base.injector.get( PropPolygonController ) );

		this.addVisualizer( PropPolygonPoint, this.tool.base.injector.get( PropPolygonPointVisualizer ) );
		this.addVisualizer( PropPolygon, this.tool.base.injector.get( PropPolygonVisualizer ) );

		this.addDragHandler( PropPolygonPoint, this.tool.base.injector.get( SimpleControlPointDragHandler ) );

		this.addCreationStrategy( this.tool.base.injector.get( PropPolygonPointCreator ) );
		this.addCreationStrategy( this.tool.base.injector.get( PropPolygonCreator ) );

	}

	enable (): void {

		super.enable();

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PropPolygonInspector ) {

			super.onObjectUpdated( object.polygon );

		} else {

			super.onObjectUpdated( object );

		}

	}

}


export class PropPolygonSelectionStrategy extends NewSelectionStrategy<PropPolygon> {

	constructor ( private map: TvMap ) {

		super();

	}

	handleSelection ( e: PointerEventData ): PropPolygon | undefined {

		for ( const propPolygon of this.map.propPolygons ) {

			if ( this.isPointInPolygon2D( e.point, propPolygon.spline.controlPointPositions ) ) {

				return propPolygon;

			}

		}

	}

	private isPointInPolygon2D ( target: Vector3, polygonPoints: Vector3[] ): boolean {

		let inside = false;

		const x = target.x, y = target.y;

		for ( let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++ ) {
			const xi = polygonPoints[ i ].x, zi = polygonPoints[ i ].y;
			const xj = polygonPoints[ j ].x, zj = polygonPoints[ j ].y;

			const intersect = ( ( zi > y ) !== ( zj > y ) ) &&
				( x < ( xj - xi ) * ( y - zi ) / ( zj - zi + Number.EPSILON ) + xi );

			if ( intersect ) inside = !inside;
		}

		return inside;
	}


}
