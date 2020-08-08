import React from 'react';
import {
    initializeBlock,
    useGlobalConfig,
    useSettingsButton,
} from '@airtable/blocks/ui';
import {OnBoardingComponent} from './onboarding';
import {SettingsComponent} from './settings';
import {MainComponent} from './main';

function DocupilotBlock() {

    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apikey: string = globalConfig.get('api-key');
    const [show_settings, setShowSettings] = React.useState(false);

    useSettingsButton(() => setShowSettings(!show_settings));
    if (show_settings) {
        return <SettingsComponent onConnect={() => setShowSettings(false)}/>
    }
    if (!apikey) {
        return <OnBoardingComponent getStarted={() => setShowSettings(true)}/>;
    }
    else {
        return <MainComponent/>
    }
}

// function SchemaMappingComponent() {
//     return <table>
//         <thead>
//         <tr>
//             <th>Field</th>
//             <th>Tag</th>
//         </tr>
//         </thead>
//         {/*<tbody>{schemaRows}</tbody>*/}
//     </table>
// }

initializeBlock(() => <DocupilotBlock />);
