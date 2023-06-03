/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Selectable {
	select (): void;

	unselect (): void;
}

export interface ISelectable extends Selectable {
	isSelected: boolean;
}
