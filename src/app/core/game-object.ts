/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ElementRef, Type } from '@angular/core';
import * as THREE from 'three';
import { BufferGeometry, Euler, Material, Vector3 } from 'three';
import { ITvObject, TvObjectType } from '../modules/tv-map/interfaces/i-tv-object';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';

export interface IComponent {
	data: any;
}

export class ComponentItem {
	constructor ( public component: Type<IComponent>, public data: any ) {
	}
}

export interface IComponentEditor {
	componentContent: ElementRef;
}

export class Component {

}

export class Transform extends Component {

	public position: Vector3 = new Vector3;
	public eulerAngles: Euler = new Euler;
	public scale: Vector3 = new Vector3;

}

export class SomeNewComponent extends Component {

	public position: any;

}

export class GameObject extends THREE.Mesh implements ITvObject, ISelectable {

	OpenDriveType: TvObjectType;
	public IsGameObject = true;
	public detectRaycast = true;
	private active: boolean;
	private tag: string;
	private transform: Transform;
	private components: Component[] = [];

	constructor ( name?: string, geometry?: BufferGeometry, material?: Material | Material[] ) {

		super( geometry, material );

		this.name = name;
		this.transform = new Transform;
		this.transform.position = this.position;
		this.transform.eulerAngles = this.rotation;
		this.transform.scale = this.scale;

		this.userData.is_selectable = true;

		// AppService.engine.add( this );

	}

	isSelected: boolean;

	select (): void {

		this.isSelected = true;

	}

	unselect (): void {

		this.isSelected = false;

	}

	get Active () {
		return this.active;
	}

	set Active ( value ) {
		this.active = value;
	}

	get Tag () {
		return this.tag;
	}

	set Tag ( value ) {
		this.tag = value;
	}

	get Transform () {
		return this.transform;
	}

	set Transform ( value ) {
		this.transform = value;
	}

	getType (): TvObjectType {
		return this.OpenDriveType;
	}

	public addComponent<T extends Component> ( componentType: Type<T> ): T {

		const obj = new componentType;

		this.components.push( obj );

		return obj;

	}

	public getComponent<T extends Component> ( componentType: Type<T> ): Component {

		for ( let i = 0; i < this.components.length; i++ ) {

			const element: Component = this.components[ i ];

			if ( element instanceof componentType ) {

				return element;

			}
		}

	}

}

export class Cube extends GameObject {

	constructor ( width: number = 1, height: number = 1, length: number = 1 ) {
		super(
			'Cube',
			new THREE.BoxGeometry( width, height, length ),
			new THREE.MeshBasicMaterial( { color: 0x000000 }
			)
		);
	}

}
