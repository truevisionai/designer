/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineEditor } from './line-editor';

export class ShapeEditorFactory {

	static createLineEditor (): LineEditor {
		return new LineEditor();
	}


}
