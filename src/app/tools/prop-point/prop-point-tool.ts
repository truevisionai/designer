/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/assets/asset-database';
import { PropManager } from 'app/managers/prop-manager';
import { PropInstance } from '../../map/prop-point/prop-instance.object';
import { ToolType } from '../tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Object3D } from "three";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { BasePointTool } from "../base-point-tool";

export class PropPointTool extends BasePointTool<PropInstance> {

	public name: string = 'PropPointTool';

	public toolType = ToolType.PropPoint;

	constructor () {

		super();

	}

	get prop (): PropInstance {

		const prop = PropManager.getProp();

		if ( prop ) {

			const object = AssetDatabase.getInstance<Object3D>( prop.guid );

			return new PropInstance( prop.guid, object.clone() );

		}

	}

	init (): void {

		this.setHint( 'use SHIFT + LEFT CLICK to create control point' );

	}

	onCreateObject ( e: PointerEventData ): void {

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		super.onCreateObject( e );

	}

	protected onShowInspector ( object: PropInstance, controlPoint?: AbstractControlPoint ): void {

		this.setInspector( object );

	}

}
