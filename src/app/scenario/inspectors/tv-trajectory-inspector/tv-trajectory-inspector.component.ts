/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractShapeEditor } from 'app/core/editors/abstract-shape-editor';
import { PolyLineEditor } from 'app/core/editors/polyline-editor';
import { Debug } from 'app/core/utils/debug';
import { CatmullRomCurve3, Points } from 'three';
import { Position } from '../../models/position';
import { WorldPosition } from '../../models/positions/tv-world-position';
import { PolylineShape, Trajectory, Vertex } from '../../models/tv-trajectory';

@Component( {
	selector: 'app-tv-trajectory-inspector',
	templateUrl: './tv-trajectory-inspector.component.html',
	styleUrls: [ './tv-trajectory-inspector.component.css' ]
} )
export class TrajectoryInspectorComponent implements OnInit, OnDestroy, OnChanges {

	@Input() trajectory: Trajectory;

	@Input() display: boolean = true;
	@Input() disableEditing: boolean = false;

	private shapeEditor: AbstractShapeEditor;

	constructor () {
	}

	ngOnInit () {

		this.shapeEditor = new PolyLineEditor;

		this.drawTrajectory();

		this.addVertexAddedListener();

		this.addGeometryChangeListener();

	}

	ngOnChanges ( changes: SimpleChanges ): void {

		if ( this.shapeEditor == null ) return;

		if ( this.disableEditing ) {

			this.shapeEditor.removeHighlight();

			this.shapeEditor.disable();

			Debug.log( 'disable', this.trajectory.name );

		} else {

			this.shapeEditor.highlight();

			this.shapeEditor.enable();

			Debug.log( 'enabld', this.trajectory.name );

		}

	}

	addVertexAddedListener () {

		this.shapeEditor.controlPointAdded.subscribe( ( e: Points ) => {

			if ( this.disableEditing ) return;

			if ( this.trajectory.shape instanceof PolylineShape ) {

				const time = this.trajectory.shape.vertices.length;

				const position = new WorldPosition( e.position.clone() );

				const vertex = new Vertex( time, position );

				this.trajectory.shape.vertices.push( vertex );

			}

		} );

	}

	ngOnDestroy (): void {

		this.shapeEditor.destroy();

	}

	drawTrajectory () {

		if ( this.trajectory.shape instanceof PolylineShape ) {

			this.trajectory.shape.vertices.forEach( vertex => {

				// Important! Need to set the vector3
				vertex.position.setPosition( vertex.position.getVectorPosition() );

				this.shapeEditor.addControlPoint( vertex.position.getVectorPosition() );

			} );

			this.shapeEditor.draw();

		}

	}

	addGeometryChangeListener () {

		this.shapeEditor.curveGeometryChanged.subscribe( ( curve: CatmullRomCurve3 ) => {

			if ( this.disableEditing ) return;

			curve.points.forEach( ( point, i ) => {

				if ( this.trajectory.shape instanceof PolylineShape ) {

					this.trajectory.shape.vertices[ i ].position.setPosition( point );

				}

			} );

		} );

	}

	onPositionModified ( position: Position ) {

		throw new Error( 'not implemented' );

		// this.shapeEditor.removeAll();

		// this.drawTrajectory();

	}


}
