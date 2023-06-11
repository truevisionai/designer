/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OscFile } from './osc-common';

export class OscRoadNetwork {

	private Logics: OscFile;
	private m_SceneGraph: OscFile;

	constructor ( logics: OscFile, sceneGraph: OscFile ) {

		this.Logics = logics;
		this.m_SceneGraph = sceneGraph;

	}

	get logics (): OscFile {
		return this.Logics;
	}

	set logics ( value: OscFile ) {
		this.Logics = value;
	}

	get sceneGraph (): OscFile {
		return this.m_SceneGraph;
	}

	// TODO: Add Signals

	set sceneGraph ( value: OscFile ) {
		this.m_SceneGraph = value;
	}

}
