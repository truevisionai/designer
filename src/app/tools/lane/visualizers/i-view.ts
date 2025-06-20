/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ColorRepresentation } from "three";
import { IViewModel } from "./i-view-model";
import { Vector3 } from "app/core/maths";

export interface IView {

	isView?: boolean;

	// Method to display the object in the view (3D scene, UI, etc.)
	show (): void;

	// Method to hide or remove the object from the view
	hide (): void;

	remove?(): void;

	// Method to update the object's visual representation in the view
	update (): void;

	// Optional method to highlight the object (visual emphasis)
	onMouseOver?(): void;

	// Optional method to unhighlight the object
	onMouseOut?(): void;

	onClick?(): void;

	onUnselect?(): void;

	setColor?( color: ColorRepresentation ): void;

	on?( event: string, callback: ( data: any ) => void ): void;

	emit?( event: string, data: any ): void;

	bindViewModel?( viewModel: IViewModel<any, any> ): void;

	getViewModel?(): IViewModel<any, any>;

	getPosition (): Vector3;

	setPosition ( position: Vector3 ): void;

}

export function isView ( object: any ): object is IView {

	return ( object as IView )?.isView === true;

}
