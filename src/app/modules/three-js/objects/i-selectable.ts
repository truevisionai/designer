/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Selectable {
	select (): void;
	unselect (): void;
}

export interface Highlightable {
	onMouseOver ();
	onMouseOut ();
}

export interface ISelectable extends Selectable {
	isSelected: boolean;
}

export interface INode extends ISelectable, Highlightable {

}
