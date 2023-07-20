export const XML = `<?xml version="1.0" standalone="yes"?>
<OpenDRIVE>
    <header revMajor="1" revMinor="7" name="" version="1.00" date="Tue Oct 29 09:28:28 2019" north="0.0000000000000000e+00" south="0.0000000000000000e+00" east="0.0000000000000000e+00" west="0.0000000000000000e+00">
    </header>
    <road rule="LHT" name="" length="5.0000000000000000e+01" id="1" junction="-1">
        <link>
            <predecessor elementType="junction" elementId="1" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="2.5000000000000000e+01" y="0.0000000000000000e+00" hdg="0.0000000000000000e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                    <lane id="2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                        <roadMark sOffset="0.0000000000000000e+00" type="solid" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="none" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </center>
                <right>
                    <lane id="-1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </right>
            </laneSection>
        </lanes>
        <objects>
            <object type="pole" name="RdTrafficLightPole01" id="0" s="0.0000000000000000e+00" t="-1.1000000000000000e+01" zOffset="0.0000000000000000e+00" validLength="0.0000000000000000e+00" orientation="none" length="3.9999999105930328e-02" width="3.9999999105930328e-02" height="0.0000000000000000e+00" hdg="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" />
        </objects>
        <signals>
            <signal s="0.0000000000000000e+00" t="-0.0000000000000000e+00" id="1" name="SgRMHoldingline-1Lane-360" dynamic="no" orientation="-" zOffset="0.0000000000000000e+00" type="294" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="0.03" width="3.40">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
            <signal s="0.0000000000000000e+00" t="-1.1000000000000000e+01" id="2" name="_Sg2" dynamic="yes" orientation="-" zOffset="2.4200000166893005e+00" type="1000001" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="1.15" width="0.38">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT" name="" length="5.0000000000000000e+01" id="2" junction="-1">
        <link>
            <predecessor elementType="junction" elementId="1" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-2.5000000000000000e+01" y="0.0000000000000000e+00" hdg="3.1415926535897931e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                    <lane id="2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                        <roadMark sOffset="0.0000000000000000e+00" type="solid" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="none" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </center>
                <right>
                    <lane id="-1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </right>
            </laneSection>
        </lanes>
        <objects>
            <object type="pole" name="RdTrafficLightPole01" id="1" s="0.0000000000000000e+00" t="-1.1000000000000000e+01" zOffset="0.0000000000000000e+00" validLength="0.0000000000000000e+00" orientation="none" length="3.9999999105930328e-02" width="3.9999999105930328e-02" height="0.0000000000000000e+00" hdg="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" />
        </objects>
        <signals>
            <signal s="0.0000000000000000e+00" t="-0.0000000000000000e+00" id="11" name="SgRMHoldingline-1Lane-360" dynamic="no" orientation="-" zOffset="0.0000000000000000e+00" type="294" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="0.03" width="3.40">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
            <signal s="0.0000000000000000e+00" t="-1.1000000000000000e+01" id="4" name="_Sg4" dynamic="yes" orientation="-" zOffset="2.4200000166893005e+00" type="1000001" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="1.15" width="0.38">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="3" junction="-1">
        <link>
            <predecessor elementType="junction" elementId="1" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="0.0000000000000000e+00" y="7.5000000000000000e+01" hdg="-1.5707963267948966e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                    <lane id="2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                        <roadMark sOffset="0.0000000000000000e+00" type="solid" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="none" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </center>
                <right>
                    <lane id="-1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </right>
            </laneSection>
        </lanes>
        <objects>
            <object type="pole" name="RdTrafficLightPole01" id="2" s="5.0000000000000000e+01" t="1.1000000000000000e+01" zOffset="0.0000000000000000e+00" validLength="0.0000000000000000e+00" orientation="none" length="3.9999999105930328e-02" width="3.9999999105930328e-02" height="0.0000000000000000e+00" hdg="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" />
        </objects>
        <signals>
            <signal s="5.0000000000000000e+01" t="0.0000000000000000e+00" id="21" name="SgRMHoldingline-1Lane-360" dynamic="no" orientation="+" zOffset="0.0000000000000000e+00" type="294" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="0.03" width="3.40">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
            <signal s="5.0000000000000000e+01" t="1.1000000000000000e+01" id="6" name="_Sg6" dynamic="yes" orientation="+" zOffset="2.4200000166893005e+00" type="1000001" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="1.15" width="0.38">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="4" junction="-1">
        <link>
            <predecessor elementType="junction" elementId="1" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="0.0000000000000000e+00" y="-2.5000000000000000e+01" hdg="-1.5707963267998624e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                    <lane id="2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                        <roadMark sOffset="0.0000000000000000e+00" type="solid" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="none" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                </center>
                <right>
                    <lane id="-1" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-2" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                        <roadMark sOffset="0.0000000000000000e+00" type="broken" weight="standard" color="standard" width="1.3000000000000000e-01" laneChange="both" height="1.9999999552965164e-02">
                        </roadMark>
                    </lane>
                    <lane id="-3" type="driving" level="false">
                        <link>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </right>
            </laneSection>
        </lanes>
        <objects>
            <object type="pole" name="RdTrafficLightPole01" id="3" s="0.0000000000000000e+00" t="-1.1000000000000000e+01" zOffset="0.0000000000000000e+00" validLength="0.0000000000000000e+00" orientation="none" length="3.9999999105930328e-02" width="3.9999999105930328e-02" height="0.0000000000000000e+00" hdg="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" />
        </objects>
        <signals>
            <signal s="0.0000000000000000e+00" t="-0.0000000000000000e+00" id="31" name="SgRMHoldingline-1Lane-360" dynamic="no" orientation="-" zOffset="0.0000000000000000e+00" type="294" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="0.03" width="3.40">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
            <signal s="0.0000000000000000e+00" t="-1.1000000000000000e+01" id="8" name="_Sg8" dynamic="yes" orientation="-" zOffset="2.4200000166893005e+00" type="1000001" country="OpenDRIVE" subtype="-1" hOffset="0.0000000000000000e+00" pitch="0.0000000000000000e+00" roll="0.0000000000000000e+00" height="1.15" width="0.38">
                <validity fromLane="-3" toLane="-1"/>
            </signal>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="3.0340875589160035e+01" id="10" junction="1">
        <link>
            <predecessor elementType="road" elementId="1" contactPoint="start" />
            <successor elementType="road" elementId="4" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="2.5000000000000000e+01" y="-7.0000000000000000e+00" hdg="3.1415926535897931e+00" length="8.7748935032052344e-01">
                <line/>
            </geometry>
            <geometry s="8.7748935032052344e-01" x="2.4122510649679477e+01" y="-7.0000000000000000e+00" hdg="3.1415926535897931e+00" length="1.0521739130434783e+01">
                <spiral curvStart="0.0000000000000000e+00" curvEnd="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.1399228480755307e+01" x="1.3818843120268710e+01" y="-8.5806245507238330e+00" hdg="-2.6841257348764787e+00" length="7.5424186276494236e+00">
                <arc curvature="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8941647108404730e+01" x="8.5806245507086789e+00" y="-1.3818843120257847e+01" hdg="-2.0282632455156593e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="8.6956521739130432e-02" curvEnd="0.0000000000000000e+00"/>
            </geometry>
            <geometry s="2.9463386238839512e+01" x="7.0000000000000000e+00" y="-2.4122510649679477e+01" hdg="-1.5707963267998624e+00" length="8.7748935032052344e-01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-3"/>
                            <successor id="3"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="3.0340875589136363e+01" id="22" junction="1">
        <link>
            <predecessor elementType="road" elementId="2" contactPoint="start" />
            <successor elementType="road" elementId="3" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-2.5000000000000000e+01" y="7.0000000000000000e+00" hdg="-4.9666937229631003e-12" length="8.7748935028012554e-01">
                <line/>
            </geometry>
            <geometry s="8.7748935028012554e-01" x="-2.4122510649719874e+01" y="6.9999999999999991e+00" hdg="-4.9666937229631003e-12" length="1.0521739130434783e+01">
                <spiral curvStart="0.0000000000000000e+00" curvEnd="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.1399228480714909e+01" x="-1.3818843120309104e+01" y="8.5806245507238366e+00" hdg="4.5746691870834777e-01" length="7.5424186277065370e+00">
                <arc curvature="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8941647108421446e+01" x="-8.5806245507238401e+00" y="1.3818843120309095e+01" hdg="1.1133294080741338e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="8.6956521739130432e-02" curvEnd="0.0000000000000000e+00"/>
            </geometry>
            <geometry s="2.9463386238856231e+01" x="-7.0000000000000000e+00" y="2.4122510649719864e+01" hdg="1.5707963267948966e+00" length="8.7748935028013619e-01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-3"/>
                            <successor id="-3"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="3.0340875589164686e+01" id="28" junction="1">
        <link>
            <predecessor elementType="road" elementId="4" contactPoint="start" />
            <successor elementType="road" elementId="2" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-7.0000000000000000e+00" y="-2.5000000000000000e+01" hdg="1.5707963267899308e+00" length="8.7748935022105101e-01">
                <line/>
            </geometry>
            <geometry s="8.7748935022105101e-01" x="-6.9999999999956426e+00" y="-2.4122510649778949e+01" hdg="1.5707963267899308e+00" length="1.0521739130434783e+01">
                <spiral curvStart="0.0000000000000000e+00" curvEnd="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.1399228480655834e+01" x="-8.5806245506683165e+00" y="-1.3818843120360327e+01" hdg="2.0282632455032452e+00" length="7.5424186277636291e+00">
                <arc curvature="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8941647108419463e+01" x="-1.3818843120278792e+01" y="-8.5806245507238401e+00" hdg="2.6841257348739962e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="8.6956521739130432e-02" curvEnd="0.0000000000000000e+00"/>
            </geometry>
            <geometry s="2.9463386238854248e+01" x="-2.4122510649689563e+01" y="-7.0000000000000000e+00" hdg="3.1415926535897931e+00" length="8.7748935031043729e-01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-3"/>
                            <successor id="3"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="31" junction="1">
        <link>
            <predecessor elementType="road" elementId="1" contactPoint="start" />
            <successor elementType="road" elementId="2" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="2.5000000000000000e+01" y="-3.5000000000000000e+00" hdg="3.1415926535897931e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-2"/>
                            <successor id="2"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="4.4340875589231622e+01" id="34" junction="1">
        <link>
            <predecessor elementType="road" elementId="1" contactPoint="start" />
            <successor elementType="road" elementId="3" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="2.5000000000000000e+01" y="0.0000000000000000e+00" hdg="3.1415926535897931e+00" length="7.8774893503277745e+00">
                <line/>
            </geometry>
            <geometry s="7.8774893503277745e+00" x="1.7122510649672225e+01" y="9.6471421181962707e-16" hdg="3.1415926535848264e+00" length="1.0521739130434783e+01">
                <spiral curvStart="-0.0000000000000000e+00" curvEnd="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8399228480762559e+01" x="6.8188431202318958e+00" y="1.5806245506423497e+00" hdg="2.6841257348715120e+00" length="7.5424186277065157e+00">
                <arc curvature="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="2.5941647108469077e+01" x="1.5806245506600534e+00" y="6.8188431202792348e+00" hdg="2.0282632455057277e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="-8.6956521739130432e-02" curvEnd="-0.0000000000000000e+00"/>
            </geometry>
            <geometry s="3.6463386238903858e+01" x="0.0000000000000000e+00" y="1.7122510649672229e+01" hdg="1.5707963267948966e+00" length="7.8774893503277710e+00">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
            <elevation s="2.9469619740896036e-01" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-1"/>
                            <successor id="-1"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="37" junction="1">
        <link>
            <predecessor elementType="road" elementId="2" contactPoint="start" />
            <successor elementType="road" elementId="1" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-2.5000000000000000e+01" y="3.5000000000000000e+00" hdg="0.0000000000000000e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-2"/>
                            <successor id="2"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="4.4340875589136353e+01" id="40" junction="1">
        <link>
            <predecessor elementType="road" elementId="2" contactPoint="start" />
            <successor elementType="road" elementId="4" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-2.5000000000000000e+01" y="0.0000000000000000e+00" hdg="-4.9658055445434002e-12" length="7.8774893502801362e+00">
                <line/>
            </geometry>
            <geometry s="7.8774893502801362e+00" x="-1.7122510649719864e+01" y="-1.9294284236275861e-15" hdg="-4.9658055445434002e-12" length="1.0521739130434783e+01">
                <spiral curvStart="-0.0000000000000000e+00" curvEnd="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8399228480714918e+01" x="-6.8188431203347157e+00" y="-1.5806245507112293e+00" hdg="-4.5746691871828027e-01" length="7.5424186277065228e+00">
                <arc curvature="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="2.5941647108421442e+01" x="-1.5806245507238419e+00" y="-6.8188431203090998e+00" hdg="-1.1133294080840646e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="-8.6956521739130432e-02" curvEnd="-0.0000000000000000e+00"/>
            </geometry>
            <geometry s="3.6463386238856224e+01" x="0.0000000000000000e+00" y="-1.7122510649719871e+01" hdg="-1.5707963267998624e+00" length="7.8774893502801291e+00">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
            <elevation s="2.9469619741046671e-01" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-1"/>
                            <successor id="1"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="3.0340875589064787e+01" id="52" junction="1">
        <link>
            <predecessor elementType="road" elementId="3" contactPoint="start" />
            <successor elementType="road" elementId="1" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="7.0000000000000000e+00" y="2.5000000000000000e+01" hdg="-1.5707963267998633e+00" length="8.7748935027289221e-01">
                <line/>
            </geometry>
            <geometry s="8.7748935027289221e-01" x="6.9999999999999991e+00" y="2.4122510649727108e+01" hdg="-1.5707963267948966e+00" length="1.0521739130434783e+01">
                <spiral curvStart="0.0000000000000000e+00" curvEnd="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.1399228480707675e+01" x="8.5806245507901551e+00" y="1.3818843120335035e+01" hdg="-1.1133294080815830e+00" length="7.5424186276494236e+00">
                <arc curvature="8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8941647108357099e+01" x="1.3818843120324171e+01" y="8.5806245507750010e+00" hdg="-4.5746691872076362e-01" length="1.0521739130434783e+01">
                 <spiral curvStart="8.6956521739130432e-02" curvEnd="0.0000000000000000e+00"/>
            </geometry>
            <geometry s="2.9463386238791884e+01" x="2.4122510649727097e+01" y="7.0000000000000000e+00" hdg="0.0000000000000000e+00" length="8.7748935027290287e-01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-3"/>
                            <successor id="3"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="55" junction="1">
        <link>
            <predecessor elementType="road" elementId="3" contactPoint="start" />
            <successor elementType="road" elementId="4" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="3.5000000000000000e+00" y="2.5000000000000000e+01" hdg="-1.5707963267998624e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-2"/>
                            <successor id="2"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="4.4340875589231615e+01" id="58" junction="1">
        <link>
            <predecessor elementType="road" elementId="3" contactPoint="start" />
            <successor elementType="road" elementId="2" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="0.0000000000000000e+00" y="2.5000000000000000e+01" hdg="-1.5707963267998624e+00" length="7.8774893503277639e+00">
                <line/>
            </geometry>
            <geometry s="7.8774893503277639e+00" x="-1.5217434245613538e-15" y="1.7122510649672236e+01" hdg="-1.5707963267998624e+00" length="1.0521739130434783e+01">
                <spiral curvStart="-0.0000000000000000e+00" curvEnd="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8399228480762545e+01" x="-1.5806245507623911e+00" y="6.8188431202949360e+00" hdg="-2.0282632455131768e+00" length="7.5424186277065228e+00">
                <arc curvature="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="2.5941647108469070e+01" x="-6.8188431202536179e+00" y="1.5806245506726686e+00" hdg="-2.6841257348789620e+00" length="1.0521739130434783e+01">
                 <spiral curvStart="-8.6956521739130432e-02" curvEnd="-0.0000000000000000e+00"/>
            </geometry>
            <geometry s="3.6463386238903851e+01" x="-1.7122510649672240e+01" y="0.0000000000000000e+00" hdg="3.1415926535897931e+00" length="7.8774893503277603e+00">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
            <elevation s="2.9469619740897457e-01" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-1"/>
                            <successor id="1"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="5.0000000000000000e+01" id="61" junction="1">
        <link>
            <predecessor elementType="road" elementId="4" contactPoint="start" />
            <successor elementType="road" elementId="3" contactPoint="start" />
        </link>
        <type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="-3.5000000000000000e+00" y="-2.5000000000000000e+01" hdg="1.5707963267948966e+00" length="5.0000000000000000e+01">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>

        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>

                            <predecessor id="-2"/>
                            <successor id="-2"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                    <lane id="2" type="driving" level="false">
                        <link>
                            <predecessor id="-3"/>
                            <successor id="-3"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <road rule="LHT"  name="" length="4.4340875589073306e+01" id="64" junction="1">
        <link>
            <predecessor elementType="road" elementId="4" contactPoint="start" />
            <successor elementType="road" elementId="1" contactPoint="start" />
        </link>
		<type s="0.0000000000000000e+00" type="town" country="JP"/>
        <planView>
            <geometry s="0.0000000000000000e+00" x="0.0000000000000000e+00" y="-2.5000000000000000e+01" hdg="1.5707963267899305e+00" length="7.8774893503392391e+00">
                <line/>
            </geometry>
            <geometry s="7.8774893503392391e+00" x="3.9120566750632601e-11" y="-1.7122510649660761e+01" hdg="1.5707963267899303e+00" length="1.0521739130434783e+01">
                <spiral curvStart="-0.0000000000000000e+00" curvEnd="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="1.8399228480774021e+01" x="1.5806245508015180e+00" y="-6.8188431202834625e+00" hdg="1.1133294080766163e+00" length="7.5424186276494165e+00">
                <arc curvature="-8.6956521739130432e-02"/>
            </geometry>
            <geometry s="2.5941647108423439e+01" x="6.8188431203741482e+00" y="-1.5806245507238312e+00" hdg="4.5746691871579737e-01" length="1.0521739130434783e+01">
                 <spiral curvStart="-8.6956521739130432e-02" curvEnd="-0.0000000000000000e+00"/>
            </geometry>
            <geometry s="3.6463386238858220e+01" x="1.7122510649784918e+01" y="1.1194585667701350e-15" hdg="-4.9658055445434002e-12" length="7.8774893502150825e+00">
                <line/>
            </geometry>
        </planView>
        <elevationProfile>
            <elevation s="0.0000000000000000e+00" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
            <elevation s="2.9469619740276443e-01" a="0.0000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
        </elevationProfile>
        <lateralProfile>
        </lateralProfile>
        <lanes>
            <laneSection s="0.0000000000000000e+00">
                <left>
                    <lane id="1" type="driving" level="false">
                        <link>
                            <predecessor id="-1"/>
                            <successor id="1"/>
                        </link>
                        <width sOffset="0.0000000000000000e+00" a="3.5000000000000000e+00" b="0.0000000000000000e+00" c="0.0000000000000000e+00" d="0.0000000000000000e+00"/>
                    </lane>
                </left>
                <center>
                    <lane id="0" type="driving" level="false">
                        <link>
                        </link>
                    </lane>
                </center>
            </laneSection>
        </lanes>
        <objects>
        </objects>
        <signals>
        </signals>
        <surface>
        </surface>
    </road>
    <controller name="ctrl001" id="1">
        <control signalId="8" type="0" />
    </controller>
    <controller name="ctrl002" id="2">
        <control signalId="2" type="0" />
    </controller>
    <controller name="ctrl003" id="3">
        <control signalId="6" type="0" />
    </controller>
    <controller name="ctrl004" id="4">
        <control signalId="4" type="0" />
    </controller>
    <junction name="" id="1">
        <connection id="0" incomingRoad="1" connectingRoad="10" contactPoint="start">
            <laneLink from="-3" to="1"/>
        </connection>
        <connection id="1" incomingRoad="1" connectingRoad="31" contactPoint="start">
            <laneLink from="-2" to="1"/>
        </connection>
        <connection id="2" incomingRoad="1" connectingRoad="34" contactPoint="start">
            <laneLink from="-1" to="1"/>
        </connection>
        <connection id="3" incomingRoad="2" connectingRoad="22" contactPoint="start">
            <laneLink from="-3" to="1"/>
        </connection>
        <connection id="4" incomingRoad="2" connectingRoad="37" contactPoint="start">
            <laneLink from="-2" to="1"/>
        </connection>
        <connection id="5" incomingRoad="2" connectingRoad="40" contactPoint="start">
            <laneLink from="-1" to="1"/>
        </connection>
        <connection id="6" incomingRoad="3" connectingRoad="52" contactPoint="start">
            <laneLink from="-3" to="1"/>
        </connection>
        <connection id="7" incomingRoad="3" connectingRoad="55" contactPoint="start">
            <laneLink from="-2" to="1"/>
        </connection>
        <connection id="8" incomingRoad="3" connectingRoad="58" contactPoint="start">
            <laneLink from="-1" to="1"/>
        </connection>
        <connection id="9" incomingRoad="4" connectingRoad="28" contactPoint="start">
            <laneLink from="-3" to="1"/>
        </connection>
        <connection id="10" incomingRoad="4" connectingRoad="61" contactPoint="start">
            <laneLink from="-2" to="1"/>
            <laneLink from="-3" to="2"/>
        </connection>
        <connection id="11" incomingRoad="4" connectingRoad="64" contactPoint="start">
            <laneLink from="-1" to="1"/>
        </connection>
        <controller id="2" type="0"/>
        <controller id="4" type="0"/>
        <controller id="3" type="0"/>
        <controller id="1" type="0"/>
    </junction>
</OpenDRIVE>
`
