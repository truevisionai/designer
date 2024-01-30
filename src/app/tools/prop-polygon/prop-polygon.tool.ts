/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropModel } from 'app/map/prop-point/prop-model.model';
import { PointerEventData } from 'app/events/pointer-event-data';
import { PropManager } from 'app/managers/prop-manager';
import { PropPolygon } from '../../map/prop-polygon/prop-polygon.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PropPolygonToolService } from "./prop-polygon-tool.service";
import { Vector3 } from 'three';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { PropPolygonInspector } from "../../map/prop-polygon/prop-polygon.inspector";

export class PropPolygonTool extends BaseTool<PropPolygon> {

	public name: string = 'PropPolygonTool';

	public toolType: ToolType = ToolType.PropPolygon;

	constructor ( private tool: PropPolygonToolService ) {

		super();

	}

	private get prop (): PropModel {

		const prop = PropManager.getProp();

		if ( prop ) {

			return new PropModel(
				prop.guid,
				prop.data?.rotationVariance || new Vector3( 0, 0, 0 ),
				prop.data?.scaleVariance || new Vector3( 0, 0, 0 )
			);

		}

	}

	onCreateObject ( e: PointerEventData ) {

		if ( !this.prop ) this.tool.base.setWarning( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		super.onCreateObject( e );

	}

	protected onShowInspector ( object: PropPolygon, controlPoint?: AbstractControlPoint ): void {

		this.setInspector( new PropPolygonInspector( object, controlPoint ) );

	}

}
