export interface IView {

	isView?: boolean;

	// Method to display the object in the view (3D scene, UI, etc.)
	show (): void;

	// Method to hide or remove the object from the view
	hide (): void;

	// Method to update the object's visual representation in the view
	update (): void;

	// Optional method to highlight the object (visual emphasis)
	onMouseOver?(): void;

	// Optional method to unhighlight the object
	onMouseOut?(): void;

	onClick?(): void;

}

export function isView ( object: any ): object is IView {

	return ( object as IView )?.isView === true;

}
