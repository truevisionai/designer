/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Controller<T> {

	showInspector ( object: T ): void;

	onAdded ( object: T ): void;

	onUpdated ( object: T ): void;

	onRemoved ( object: T ): void;

}


