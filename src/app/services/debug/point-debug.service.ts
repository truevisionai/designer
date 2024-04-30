/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugState } from "./debug-state";
import { Object3DMap } from "../../core/models/object3d-map";
import { PropInstance } from "../../map/prop-point/prop-instance.object";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { BaseDebugger } from "../../core/interfaces/base-debugger";

export class PointDebugService extends BaseDebugger<PropInstance> {

	private points = new Object3DMap<number, AbstractControlPoint>();

	onDefault ( object: PropInstance ): void {

		this.createOrUpdate( object )?.unselect();

	}

	onHighlight ( object: PropInstance ): void {

		this.createOrUpdate( object );

	}

	onRemoved ( object: PropInstance ): void {

		this.points.remove( object.id );

	}

	onSelected ( object: PropInstance ): void {

		this.createOrUpdate( object )?.select();

	}

	onUnhighlight ( object: PropInstance ): void {

	}

	onUnselected ( object: PropInstance ): void {

		this.createOrUpdate( object )?.unselect();

	}

	setDebugState ( object: PropInstance, state: DebugState ): void {

		if ( !object ) return;

		this.setBaseState( object, state );

	}

	private createOrUpdate ( object: PropInstance ) {

		if ( !object ) return;

		let point: AbstractControlPoint;

		if ( this.points.has( object.id ) ) {

			point = this.points.get( object.id )

		} else {

			point = this.createControlPoint( object, object.Position )

			object.add( point );

			this.points.add( object.id, point );

		}

		point.position.copy( object.Position );

		return point;
	}

}
