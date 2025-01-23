/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { ISelectable } from 'app/objects/i-selectable';
import * as THREE from "three";
import { BufferGeometry, Material } from "three";

export interface IComponent {
	data: any;
}

export class ComponentItem {
	constructor ( public component: Type<IComponent>, public data: any ) {
	}
}

export class GameObject extends THREE.Mesh implements ISelectable {

	isSelected: boolean;

	private tag: string;

	constructor ( name?: string, geometry?: BufferGeometry, material?: Material | Material[] ) {

		super( geometry, material );

		this.name = name;
		this.userData.is_selectable = true;

	}

	get Tag () {
		return this.tag;
	}

	set Tag ( value ) {
		this.tag = value;
	}

	select (): void {
		this.isSelected = true;
	}

	unselect (): void {
		this.isSelected = false;
	}
}
