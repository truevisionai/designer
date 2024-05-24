/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Importer {

	import ( sourcePath: string, destinationFolder: string ): Promise<void>;

}