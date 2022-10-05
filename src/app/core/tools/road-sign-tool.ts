/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Subscription } from 'rxjs';
import { Object3D, Points } from 'three';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { OdSignalBuilder } from '../../modules/tv-map/builders/od-signal-builder';
import { TvObjectType } from '../../modules/tv-map/interfaces/i-tv-object';
import { TvDynamicTypes, TvOrientation } from '../../modules/tv-map/models/tv-common';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { TvRoadSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { TvSignService } from '../../modules/tv-map/services/tv-sign.service';
import { CommandHistory } from '../../services/command-history';
import { SnackBar } from '../../services/snack-bar.service';
import { OdSignalInspectorComponent } from '../../views/inspectors/signal-inspector/signal-inspector.component';
import { AddSignalCommand } from '../commands/add-signal-command';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { PointEditor } from '../editors/point-editor';
import { SceneService } from '../services/scene.service';
import { BaseTool } from './base-tool';

export class RoadSignTool extends BaseTool {

	name: string = 'RoadSignTool';
	private signFactory = new OdSignalBuilder();
	private controlPointAddedSubscriber: Subscription;
	private hasSignal = false;
	private selectedSignal: TvRoadSignal;
	private shapeEditor: AbstractShapeEditor;
	private controlPointMovedSubscriber: Subscription;

	constructor ( private signService: TvSignService ) {

		super();

		this.shapeEditor = new PointEditor();

		this.controlPointAddedSubscriber = this.shapeEditor.controlPointAdded.subscribe( e => this.onControlPointAdded( e ) );
		this.controlPointMovedSubscriber = this.shapeEditor.controlPointMoved.subscribe( e => this.onControlPointMoved( e ) );
	}

	get sign () {
		return this.signService.currentSign;
	}

	init () {

		super.init();

		this.showControlPoints();

	}

	disable (): void {

		super.disable();

		this.controlPointAddedSubscriber.unsubscribe();
		this.controlPointMovedSubscriber.unsubscribe();

		this.shapeEditor.destroy();

		this.hideControlPoints();
	}

	onPointerDown ( e: PointerEventData ) {

		super.onPointerDown( e );

		this.hasSignal = false;

		for ( const i of e.intersections ) {

			if ( i.object[ 'OpenDriveType' ] != null && i.object[ 'OpenDriveType' ] == TvObjectType.SIGNAL ) {

				this.hasSignal = true;

				this.inspectSignal( i.object );

				break;

			}
		}

		if ( !this.hasSignal ) {

			this.clearInspector();

		}
	}

	private inspectSignal ( object: Object3D ) {

		this.selectedSignal = ( object.userData.data as TvRoadSignal );

		this.setInspector( OdSignalInspectorComponent, this.selectedSignal );
	}

	private onControlPointAdded ( point: AnyControlPoint ) {

		const pose = new TvPosTheta();

		pose.x = point.position.x;
		pose.y = point.position.y;

		if ( this.sign ) {

			const road = TvMapQueries.getRoadByCoords( pose.x, pose.y, pose );

			if ( road == null ) throw new Error( 'Could not find any road' );

			const id = road.getRoadSignalCount() + 1;

			const signal = new TvRoadSignal( pose.s, pose.t, id, '', TvDynamicTypes.NO, TvOrientation.MINUS );

			signal.roadId = road.id;
			signal.height = 4;
			signal.controlPoint = point;
			signal.signShape = this.sign.shape;
			signal.name = this.sign.name;
			signal.text = this.sign.name;

			signal.addUserData( 'asset_name', this.sign.name );
			signal.addUserData( 'sign_shape', this.sign.shape as string );

			CommandHistory.execute( new AddSignalCommand( signal ) );

		} else {

			this.shapeEditor.removeControlPoint( point );

			SnackBar.show( 'Please select a sign first' );

		}

	}


	// OLD CODE JUST FOR REFERENCE
	// const ray = new Ray();
	//
	// ray.origin.copy( e.position );
	//
	// ray.direction.copy( pose.toDirectionVector() );
	//
	// // console.log( pose, ray );
	//
	// SceneService.add( new ArrowHelper( ray.direction, ray.origin, 300, 0xff0000 ) );
	//
	// // e.add( signal.GameObject );
	//
	// // const p1 = pose.toVector3();
	// // const p2 = p1.clone().add( pose.toDirectionVector().multiplyScalar( 10 ) );
	//
	// // console.log( p1, p2 );
	//
	// // console.log( signal.GameObject.position.dot( ray.direction ) );
	// // console.log( this.isLeft( p1, p2, signal.GameObject.position ) );
	//
	// // const tmp1 = new OdPosTheta();
	// // const tmp2 = new OdPosTheta();
	// //
	// // road.getGeometryCoords( pose.s, tmp1 );
	// // road.getGeometryCoords( pose.s + Maths.Epsilon, tmp2 );
	// //
	// // this.directionOfPoint( tmp1.toVector3(), tmp2.toVector3(), e.position );
	//
	// const a = pose.toVector3();
	// const b = e.position;
	//
	// var dot = a.x * b.x + a.y * b.y;
	// if ( dot > 0 )
	// console.log( '<90 degrees' );
	// else if ( dot < 0 )
	// console.log( '>90 degrees' );
	// else
	// console.log( '90 degrees' );


	private showControlPoints () {

		this.forEachControlPoint( controlPoint => {

			// add control points to shape editor to sync and avoid errors
			this.shapeEditor.controlPoints.push( controlPoint );

			controlPoint.visible = true;

			SceneService.add( controlPoint );

		} );

	}

	private hideControlPoints () {

		this.forEachControlPoint( controlPoint => {

			controlPoint.visible = false;

			SceneService.remove( controlPoint );

		} );

	}

	private onControlPointMoved ( point: Points ) {

		for ( const road of this.map.roads ) {

			for ( const map of road[ 1 ].signals ) {

				const signal = map[ 1 ];

				if ( signal.controlPoint && signal.controlPoint.id == point.id ) {

					signal.gameObject.position.copy( point.position );

					break;

				}

			}

		}

	}

	private forEachControlPoint ( callback: ( controlPoint: AnyControlPoint ) => void ) {

		this.map.roads.forEach( road => {

			road.signals.forEach( signal => {

				if ( signal.controlPoint ) callback( signal.controlPoint );

			} );

		} );

	}
}
