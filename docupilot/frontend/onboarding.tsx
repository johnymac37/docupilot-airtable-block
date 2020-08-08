import {Box, Text, Button, Heading} from "@airtable/blocks/ui";
import React from "react";

export function OnBoardingComponent({getStarted}) {
    return (
        <Box padding={5} backgroundColor="#071C3F" textColor="#FFFFFF" fontFamily="SF Pro Text">
            <Heading textColor="#FFFFFF">
                Intuitive, flexible, and affordable Document Automation Software
            </Heading>
            <Text marginTop={3} textColor="#FFFFFF">Get Started</Text>
            <dl>
                <dt>Sign in to dashboard.docupilot.app</dt>
                <dt>Create an API key or copy an existing API key from Settings  API.</dt>
                <dt>Paste your API key in the block and start.</dt>
            </dl>
            <Button variant="primary" marginY="20px" width="155px" onClick={getStarted}>
                Get Started
            </Button>
        </Box>
    );
}