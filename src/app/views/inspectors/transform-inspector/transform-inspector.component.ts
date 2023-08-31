/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Euler, Object3D, Vector3 } from 'three';
import { IComponent } from '../../../core/game-object';
import { SetPositionCommand } from '../../../modules/three-js/commands/set-position-command';
import { SetRotationCommand } from '../../../modules/three-js/commands/set-rotation-command';
import { SetScaleCommand } from '../../../modules/three-js/commands/set-scale-command';
import { CommandHistory } from '../../../services/command-history';

@Component( {
	selector: 'app-transform-inspector',
	templateUrl: './transform-inspector.component.html',
} )
export class TransformInspectorComponent implements OnInit, IComponent {

	@Output() changed = new EventEmitter();

	@Input() data: Object3D;

	@Input() showPosition = true;
	@Input() showRotation = true;
	@Input() showScale = true;

	public position: Vector3;
	public rotation: Vector3;
	public scale: Vector3;

	constructor () {

	}


	ngOnInit (): void {

		this.position = this.data.position.clone();
		this.rotation = new Vector3().setFromEuler( this.data.rotation.clone() );
		this.scale = this.data.scale.clone();

		// this.rotation.x *= Maths.Rad2Deg;
		// this.rotation.y *= Maths.Rad2Deg;
		// this.rotation.z *= Maths.Rad2Deg;
	}

	positionChanged ( $position: Vector3 ) {

		CommandHistory.execute( new SetPositionCommand( this.data, $position ) );

		this.changed.emit();

	}

	rotationChanged ( $rotation: Vector3 ) {

		// $rotation.x *= Maths.Deg2Rad;
		// $rotation.y *= Maths.Deg2Rad;
		// $rotation.z *= Maths.Deg2Rad;

		const command = new SetRotationCommand( this.data, new Euler().setFromVector3( $rotation ) );

		CommandHistory.execute( command );

		this.changed.emit();
	}

	scaleChanged ( $scale: Vector3 ) {

		CommandHistory.execute( new SetScaleCommand( this.data, $scale ) );

		this.changed.emit();
	}
}
