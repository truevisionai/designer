export interface Importer {

	import ( sourcePath: string, destinationFolder: string ): Promise<void>;

}