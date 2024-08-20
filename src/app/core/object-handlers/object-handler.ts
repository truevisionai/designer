/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface ObjectHandler<T> {

	isSelected ( object: T ): boolean;

	getSelected (): T[];

	select ( object: T ): void;

	onSelected ( object: T ): void;

	unselect ( object: T ): void;

	onUnselected ( object: T ): void;

	onAdded ( object: T ): void;

	onUpdated ( object: T ): void;

	onRemoved ( object: T ): void;

}


