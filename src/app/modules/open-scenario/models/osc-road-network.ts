import { OscFile } from './osc-common';

export class OscRoadNetwork {

	get logics (): OscFile {
		return this.Logics;
	}

	set logics ( value: OscFile ) {
		this.Logics = value;
	}

	get sceneGraph (): OscFile {
		return this.m_SceneGraph;
	}

	set sceneGraph ( value: OscFile ) {
		this.m_SceneGraph = value;
	}

	private Logics: OscFile;
	private m_SceneGraph: OscFile;

	// TODO: Add Signals

	constructor ( logics: OscFile, sceneGraph: OscFile ) {

		this.Logics = logics;
		this.m_SceneGraph = sceneGraph;

	}

}
