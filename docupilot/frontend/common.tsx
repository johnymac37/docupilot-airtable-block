import {Box, Icon, Text, Button, Loader} from "@airtable/blocks/ui";
import React from "react";

export function InformationComponent({icon_name, icon_color, show_icon_bg= true, content, sub_content=null, actions = []}) {

    let action_count: number = 0;
    const actionButtons = actions.map(action => <Button key={action_count++} width="100%" marginBottom={3} variant={action.variant}
                                                        onClick={action.onClick}>
        {action.label}
    </Button>);
    return (
        <Box paddingX="24px">
            <Box
                backgroundColor="white"
                display="flex"
                flexDirection="column"
                // alignItems="center"
                justifyContent="center"
                minHeight="400px"
            >
                <Box display="flex" flexDirection="column" width="100%" alignItems="center">
                    <Box backgroundColor={show_icon_bg? "#071C3F": null} border={show_icon_bg? "7px solid #E3EAF5": null}
                         borderRadius="circle" margin="16px">
                        <Icon name={icon_name} size={60} fillColor={icon_color} margin={3}/>
                    </Box>
                    <Text as="p" size="large" textColor="light">{content}</Text>
                </Box>
                {sub_content &&
                    <Box marginTop={4}>
                        {sub_content}
                    </Box>
                }
            </Box>
            {actionButtons}
        </Box>
    );
}

export function LoaderComponent() {
    return (
        <Box width="100%" height="300px" alignItems="center" justifyContent="center">
            <Loader scale={0.3} fillColor="#888"/>
        </Box>
    );
}