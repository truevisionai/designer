/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { PropService } from 'app/services/prop-service';
import { SnackBar } from 'app/services/snack-bar.service';
import {
	PropPolygonInspectorComponent,
	PropPolygonInspectorData
} from 'app/views/inspectors/prop-polygon-inspector/prop-polygon-inspector.component';
import { Subscription } from 'rxjs';
import { PointEditor } from '../editors/point-editor';
import { KeyboardInput } from '../input';
import { AppInspector } from '../inspector';
import { BaseTool } from './base-tool';

export class PropPolygonTool extends BaseTool {

	public name: string = 'PropPolygonTool';

	public shapeEditor: PointEditor;

	private cpSubscriptions: Subscription[] = [];

	private cpAddedSub: Subscription;
	private cpMovedSub: Subscription;
	private cpUpdatedSub: Subscription;
	private cpSelectedSub: Subscription;
	private cpUnselectedSub: Subscription;
	private keyDownSub: Subscription;

	private polygon: PropPolygon;
	private point: AnyControlPoint;

	constructor () {

		super();

	}

	public init () {

		super.init();

		this.shapeEditor = new PointEditor( 100 );
	}

	public enable () {

		super.enable();

		this.map.propPolygons.forEach( polygon => {

			polygon.showControlPoints();

			polygon.showCurve();

			polygon.spline.controlPoints.forEach( cp => {

				cp.mainObject = polygon;

				this.shapeEditor.controlPoints.push( cp );

			} );
		} );

		this.keyDownSub = KeyboardInput.keyDown
			.subscribe( e => this.onDeletePressed( e ) );

		this.cpAddedSub = this.shapeEditor.controlPointAdded
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointAdded( cp ) );

		this.cpMovedSub = this.shapeEditor.controlPointMoved
			.subscribe( () => this.onControlPointMoved() );

		this.cpUpdatedSub = this.shapeEditor.controlPointUpdated
			.subscribe( () => this.onControlPointUpdated() );

		this.cpSelectedSub = this.shapeEditor.controlPointSelected
			.subscribe( ( cp: AnyControlPoint ) => this.onControlPointSelected( cp ) );

		this.cpUnselectedSub = this.shapeEditor.controlPointUnselected
			.subscribe( () => this.onControlPointUnselected() );

	}

	public disable (): void {

		super.disable();

		this.map.propPolygons.forEach( polygon => {

			polygon.hideCurve();
			polygon.hideControlPoints();

		} );

		this.keyDownSub.unsubscribe();
		this.cpAddedSub.unsubscribe();
		this.cpMovedSub.unsubscribe();
		this.cpUpdatedSub.unsubscribe();
		this.cpSelectedSub.unsubscribe();
		this.cpUnselectedSub.unsubscribe();

		this.shapeEditor.destroy();
	}

	public onPointerClicked ( e: PointerEventData ) {

		for ( let i = 0; i < e.intersections.length; i++ ) {

			const intersection = e.intersections[ i ];

			if ( intersection.object && intersection.object[ 'tag' ] === PropPolygon.tag ) {

				this.polygon = intersection.object.userData.polygon;

				this.polygon.showControlPoints();

				this.showInspector( this.polygon );

				break;
			}
		}
	}

	private onControlPointSelected ( cp: AnyControlPoint ) {

		this.point = cp;

		this.polygon = cp.mainObject;

		this.showInspector( this.polygon, this.point );
	}

	private onControlPointUnselected () {

		this.polygon = null;

		this.point = null;

	}

	private onControlPointAdded ( cp: AnyControlPoint ) {

		const prop = PropService.getProp();

		if ( !prop ) SnackBar.error( 'Select a prop from the project browser' );

		if ( !prop ) this.shapeEditor.removeControlPoint( cp );

		if ( !prop ) return;

		if ( !this.polygon ) {

			this.polygon = new PropPolygon( prop.guid );

			this.map.propPolygons.push( this.polygon );

		}

		this.point = cp;

		cp.mainObject = this.polygon;

		this.polygon.spline.addControlPoint( cp );

		this.polygon.update();

		this.showInspector( this.polygon, this.point );
	}

	// called after control point position is updated and set
	private onControlPointUpdated () {

		this.polygon.update();

		this.showInspector( this.polygon, this.point );
	}

	// called during control point is being moved/dragged
	private onControlPointMoved () {

		this.polygon.spline.update();

		this.showInspector( this.polygon, this.point );

	}

	private onDeletePressed ( e: KeyboardEvent ) {

		if ( e.key === 'Delete' && this.polygon ) {

			this.polygon.delete();

			const index = this.map.surfaces.findIndex( s => s.id === this.polygon.id );

			if ( index > -1 ) {

				this.map.surfaces.splice( index, 1 );

			}

			this.polygon = null;

			delete this.polygon;
		}

	}

	private showInspector ( polygon?: PropPolygon, point?: AnyControlPoint ) {

		if ( polygon == null && point == null ) {

			AppInspector.clear();

		} else {

			const data = new PropPolygonInspectorData( point, polygon );

			AppInspector.setInspector( PropPolygonInspectorComponent, data );
		}
	}


}
