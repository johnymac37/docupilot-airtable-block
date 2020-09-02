import React from "react";
import {Box, Button, Heading, Input, Label, Text, TextButton, useGlobalConfig} from "@airtable/blocks/ui";
import {getProfileDetails, setApiKey} from "./apicallouts";


function APIKeyComponent({apikey, error, saveAPI}) {
    const [input, setInput] = React.useState<string>(apikey||"");
    const [edit_mode, setEditMode] = React.useState<boolean>(false);

    return (
        <Box marginTop={4}>
            <Label htmlFor="api-key">API Key</Label>
            {!apikey || edit_mode
                ? <Input id="api-key" name="apikey" value={input} onChange={event => {
                    setInput(event.target.value);
                }}/>
                : <Text>{apikey}</Text>
            }
            {!!error &&
                <Text textColor="red">{error} hello</Text>
            }
            <Box marginY={3} display="flex" flexDirection="row">
                {!!apikey
                    ? <div>
                        {edit_mode
                            ? <div>
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
                            </div>
                            : <TextButton onClick={() => setEditMode(true)}>
                                Change
                            </TextButton>
                        }
                    </div>
                    : <Button variant="primary" width="100%" onClick={() => saveAPI(input, false)}>
                        Connect
                    </Button>
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

    return (
        <Box backgroundColor="white" padding={5}>
            { !!profile_info &&
                <Box>
                    <Label htmlFor="docupilot-email">Account</Label>
                    <Text marginBottom="6px">{profile_info.email}</Text>
                    <Text marginY="6px">{profile_info.name}</Text>
                    <Text textColor="light">{profile_info.org} Org</Text>
                </Box>
            }
            { !apikey &&
                <Heading as="h5" marginY={3}>Configure API Key</Heading>
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
}