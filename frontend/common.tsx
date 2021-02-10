import {Box, Text, Button, Loader} from "@airtable/blocks/ui";
import React from "react";
import {ImageIcon} from "./images";

export function WrapperComponent({child_component, theme="light"}) {
    return (
        <Box backgroundColor={theme == "light" ? "white" : "#071C3F"} padding="48px" minHeight="464px">
            <Box marginY={2}>
                <ImageIcon name={theme == "light" ? 'master-logo-blue' : 'master-logo-white'}/>
            </Box>
            {child_component}
        </Box>
    )
}


export function InformationComponent({image_icon, content, sub_content=null, actions = []}) {

    let action_count: number = 0;
    const actionButtons = actions.map(action => {
        return <Button key={action_count++} width="100%" marginBottom="16px" variant={action.variant} onClick={action.onClick}>
            <Text fontWeight="500" fontSize="14px" textColor={action.textColor}> {action.label} </Text>
        </Button>
    });
    return (
        <Box paddingX="24px" paddingY="4px">
            <Box
                backgroundColor="white"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                minHeight="400px"
            >
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Box margin="16px">
                        <ImageIcon name={image_icon}/>
                    </Box>
                    <Text textColor="light" lineHeight="171%">{content}</Text>
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