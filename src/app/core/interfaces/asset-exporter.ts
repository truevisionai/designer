/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { JsonObject } from "app/importers/xml.element";

export interface AssetExporter<T> {

	exportAsString ( asset: T ): string;

	exportAsJSON ( asset: T ): JsonObject;

}
