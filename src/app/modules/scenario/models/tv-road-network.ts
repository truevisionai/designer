/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { File } from './tv-common';

export class RoadNetwork {

	private Logics: File;
	private m_SceneGraph: File;

	constructor ( logics: File, sceneGraph: File ) {

		this.Logics = logics;
		this.m_SceneGraph = sceneGraph;

	}

	get logics (): File {
		return this.Logics;
	}

	set logics ( value: File ) {
		this.Logics = value;
	}

	get sceneGraph (): File {
		return this.m_SceneGraph;
	}

	// TODO: Add Signals

	set sceneGraph ( value: File ) {
		this.m_SceneGraph = value;
	}

}
