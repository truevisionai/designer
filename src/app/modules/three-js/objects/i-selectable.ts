/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ISelectable {
	isSelected: boolean;

	select (): void;

	unselect (): void;
}
