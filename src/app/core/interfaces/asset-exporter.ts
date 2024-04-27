/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface AssetExporter<T> {

	exportAsString ( asset: T ): string;

	exportAsJSON ( asset: T ): any;

}
