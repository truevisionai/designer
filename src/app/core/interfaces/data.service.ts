/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { AbstractControlPoint } from "app/objects/abstract-control-point";

export interface HasSpline {
	spline: AbstractSpline;
}

export abstract class BaseDataService<T> {

	abstract all (): T[];

	abstract add ( object: T ): void;

	abstract update ( object: T ): void;

	abstract remove ( object: T ): void;

	addPoint ( object: T, point: AbstractControlPoint ): void {

		if ( object[ 'spline' ] && object[ 'spline' ] instanceof AbstractSpline ) {

			object[ 'spline' ].addControlPoint( point );

		}

		this.update( object );
	}

	removePoint ( object: T, point: AbstractControlPoint ): void {

		if ( object[ 'spline' ] && object[ 'spline' ] instanceof AbstractSpline ) {

			object[ 'spline' ].removeControlPoint( point );

		}

		this.update( object );
	}

	updatePoint ( object: T, point: AbstractControlPoint ): void {

		if ( object[ 'spline' ] && object[ 'spline' ] instanceof AbstractSpline ) {

			object[ 'spline' ].update();

		}

		// this builds the object
		// this.update( object );
	}

}

export abstract class LinkedDataService<P, C> {

	protected parentService: BaseDataService<P>;

	abstract all ( parent: P ): C[];

	abstract add ( parent: P, object: C ): void;

	abstract update ( parent: P, object: C ): void;

	abstract remove ( parent: P, object: C ): void;

}

