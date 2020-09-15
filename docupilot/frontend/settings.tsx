import React from "react";
import {
    Box,
    Button,
    Input,
    Label,
    loadCSSFromString,
    Text,
    TextButton,
    useGlobalConfig
} from "@airtable/blocks/ui";
import {getProfileDetails, setApiKey} from "./apicallouts";
import {WrapperComponent} from "./common";

loadCSSFromString(`.settings-action-box * {
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
}`)

function APIKeyComponent({apikey, error, saveAPI}) {
    const [input, setInput] = React.useState<string>(apikey||"");
    const [edit_mode, setEditMode] = React.useState<boolean>(false);

    return (
        <Box marginY="32px">
            { !apikey &&
                <Text fontSize="16px" fontWeight="600" lineHeight="24px">Configure API Key</Text>
            }
            <Box marginY="16px">
                <Label htmlFor="api-key">API Key</Label>
                {!apikey || edit_mode
                    ? <Input id="api-key" name="apikey" value={input} onChange={event => {
                        setInput(event.target.value);
                    }}/>
                    : <Text fontSize="17px" lineHeight="20px">{apikey}</Text>
                }
                {!!error &&
                <Text textColor="red">{error} hello</Text>
                }
            </Box>
            <Box className="settings-action-box">
                {!apikey
                    ? <Button variant="primary" width="100%" onClick={() => saveAPI(input, false)}>
                        Connect
                    </Button>
                    : edit_mode
                        ? <Box>
                            <Button variant="primary" size="small" width="100px" onClick={_ => {
                                saveAPI(input);
                                setEditMode(false);
                            }}>
                                Save
                            </Button>
                            <Button variant="secondary" size="small" marginLeft="24px" onClick={() => {
                                setInput(apikey);
                                setEditMode(false)
                            }}>
                                Cancel
                            </Button>
                        </Box>
                        : <TextButton onClick={() => setEditMode(true)}>Change</TextButton>

                }
            </Box>
        </Box>
    );
}

export function SettingsComponent({onConnect}) {
    const globalConfig = useGlobalConfig();
    // @ts-ignore
    const apikey: string = globalConfig.get('api-key');
    // @ts-ignore
    const profile_info: {name: string, email: string, org: string} = globalConfig.get('profile-info');
    const [error, setError] = React.useState<string>("");

    const settings_component =  (
        <Box paddingY="24px">
            { !!profile_info &&
                <Box marginTop="12px">
                    <Label htmlFor="docupilot-email">Account</Label>
                    <Text fontSize="17px" lineHeight="20px">{profile_info.email}</Text>
                </Box>
            }
            { !!profile_info &&
                <Box marginTop="12px">
                    <Text fontSize="17px" lineHeight="20px">{profile_info.name}</Text>
                    <Text textColor="light">{profile_info.org} Org</Text>
                </Box>
            }
            <APIKeyComponent apikey={apikey} error={error} saveAPI={(api_input, is_update=true) => {
                getProfileDetails(api_input).then(response => {
                    setApiKey(api_input);
                    globalConfig.setAsync('api-key', api_input);
                    globalConfig.setAsync('profile-info', {
                        name: response.data.first_name + ' ' + response.data.last_name,
                        email: response.data.email,
                        org: (response.data.organization.name || '')
                    });
                    if (!is_update) {
                        onConnect();
                    }
                }).catch(error => {
                    console.log(error);
                    setError("Invalid API Key");
                });
            }}/>
        </Box>
    );

    return <WrapperComponent child_component={settings_component}/>
}