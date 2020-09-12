import React from 'react';
import {
    initializeBlock,
    useGlobalConfig,
    useSettingsButton,
    loadCSSFromString
} from '@airtable/blocks/ui';
import {OnBoardingComponent} from './onboarding';
import {SettingsComponent} from './settings';
import {MainComponent} from './main';
import {setApiKey} from './apicallouts';

loadCSSFromString(`* {
    font-family: SF Pro Text;
    font-style: normal;
    font-weight: normal;
}`)
function DocupilotBlock() {

    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apikey: string = globalConfig.get('api-key');
    const [show_settings, setShowSettings] = React.useState<boolean>(false);

    useSettingsButton(() => setShowSettings(!show_settings));
    if (show_settings) {
        return <SettingsComponent onConnect={() => setShowSettings(false)}/>
    }
    if (!apikey) {
        return <OnBoardingComponent getStarted={() => setShowSettings(true)}/>;
    }
    else {
        setApiKey(apikey);
        return <MainComponent/>
    }
}

initializeBlock(() => <DocupilotBlock/>);
