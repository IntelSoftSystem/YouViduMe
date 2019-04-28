// @flow

// import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { SpotlightTarget } from '@atlaskit/onboarding';
import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';

import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Navbar } from '../../navbar';
import { Onboarding, startOnboarding } from '../../onboarding';
import { RecentList } from '../../recent-list';
import { normalizeServerURL } from '../../utils';

import { Body, Button, Form ,Label , H1 , H2, Img , Header, Wrapper } from '../../welcome/styled';
import HeaderLogo from '../../../images/new-logo.png';
import { remote } from 'electron';

import { removeSync } from 'fs-extra-p';
import { existsSync, readFile } from 'fs'
import { getAppCacheDir } from 'electron-updater/out/AppAdapter';



type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;
};


remote.getCurrentWindow().webContents.once('dom-ready', () => {
    let a = remote.app.getPath('userData');
    let path = `${a}/Cookies`;
    let configPath = `${a}/config.json`;
    if(existsSync(configPath)) {
        readFile(configPath, function (err, data) {
            if (err) return;
            if(data.indexOf('activeOnboarding') >= 0){
                removeSync(configPath);
                remote.getCurrentWindow().reload();
            }
          });
    }
});

type State = {

    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;
};

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
       
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }
        this.state = { url,
            email: '',
            roomId: '',
            roomName: '',
            formErrors: {
                email: '',
                roomId: '' },
            emailValid: false,
            roomIdValid: false,
            formValid: false
        };

        // Bind event handlers.
        this._onURLChange = this._onURLChange.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onJoin = this._onJoin.bind(this);
        this._onEmailChange = this._onEmailChange.bind(this);
        this._onRoomIdChange = this._onRoomIdChange.bind(this);

    }

    /**
     * Start Onboarding once component is mounted.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {      
       this.props.dispatch(startOnboarding('welcome-page'));
    }

    componentWillMount() {
        var win = remote.getCurrentWindow();
        win.webContents.session.clearCache(function(){ return; });   
    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page navigation = { <Navbar /> }>
                <AtlasKitThemeProvider mode = 'light'>
                    <Wrapper>
                        <Img src={ HeaderLogo } width="350" ></Img>
                        <H1>Welcome to YouViduMe</H1>
                        <H2>Begin Your Video call in just a few seconds!</H2>
                        { this._renderHeader() }
                        { this._renderBody() }
                        <Onboarding section = 'welcome-page' />
                    </Wrapper>
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    _onFormSubmit: (*) => void;

    /**
     * Prevents submission of the form and delegates the join logic.
     *
     * @param {Event} event - Event by which this function is called.
     * @returns {void}
     */
    _onFormSubmit(event: Event) {
        event.preventDefault();
        this._onJoin();
    }

    _onJoin: (*) => void;

    /**
     * Redirect and join conference.
     *
     * @returns {void}
     */
    _onJoin() {
        const inputURL = this.state.url;
        const lastIndexOfSlash = inputURL.lastIndexOf('/');
        let room;
        let serverURL;
        let roomName;
        const roomId = this.state.roomId;
        const regex = /\S+@\S+\.\S+/;
        const numericRegex = /^([0-9]{5})$/;
        const isEmailValid = regex.test(this.state.email);

        if (!isEmailValid) {
            return;
        }

        const isNumericValid = numericRegex.test(this.state.roomId);

        if (!isNumericValid) {
            return;
        }
        if (lastIndexOfSlash === -1) {
            // This must be only the room name.
            room = roomId;
        } else {
            // Take the substring after last slash to be the room name.
            room = roomId; // inputURL.substring(lastIndexOfSlash + 1);

            // Take the substring before last slash to be the Server URL.
            serverURL = inputURL.substring(0, lastIndexOfSlash);

            // Normalize the server URL.
            serverURL = normalizeServerURL(serverURL);
        }

        // Don't navigate if no room was specified.
        if (!room) {
            return;
        }

        fetch(
            `https://vmpuapi.azurewebsites.net/api/meeting/
            CheckMeetingAvailability/${roomId}/${this.state.email}/`
        )
        .then(res => res.json())
        .then(
        result => {
            const dict = result;
            let dictKey = '';
            let dictVal = '';

            Object.keys(dict).map(key => {
                dictKey = key;

                return key;
            });

            dictVal = result[dictKey];

            if (dictKey === 'true') {
                const arr = dictVal.split('-');

                room = arr[0];
                roomName = arr[1];

                this.props.dispatch(push('/conference', {
                    room,
                    serverURL,
                    roomName
                }
                )
                );
            } else {
                return;
            }
        },
        error => {
            this.setState({
                isLoaded: true,
                error
            });
        }
        );

    }

    _onURLChange: (*) => void;

    /**
     * Keeps URL input value and URL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onURLChange(event) {
        this.setState({
            url: event.currentTarget.value
        });
    }


    _onEmailChange: (*)=> void;

    /**
     * Keeps EMAIL input value and EMAIL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onEmailChange(event) {
        this.setState({
            email: event.currentTarget.value
        });
    }

    _onRoomIdChange: (*)=> void;

    /**
     * Keeps roomId input value and roomId in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onRoomIdChange(event) {
        this.setState({
            roomId: event.currentTarget.value
        });
    }

    /**
     * Renders the body for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderBody() {
        return (
            <Body>
                <RecentList />
            </Body>
        );
    }

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderHeader() {
        const regex = /\S+@\S+\.\S+/;
        const numericRegex = /^([0-9]{5})$/;

        return (
            
            <Header>
                <Form onSubmit = { this._onFormSubmit }>

                <Label>Enter Your Email</Label>

                    <SpotlightTarget name = 'conference-url'>
                        <FieldTextStateless
                            autoFocus = { true }
                            isInvalid = {
                                !regex.test(this.state.email)
                                && this.state.email !== ''
                            }
                            isLabelHidden = { true }
                            name = 'email'
                            onChange = { this._onEmailChange }
                            placeholder = 'Enter your Meeting Email'
                            shouldFitContainer = { true }
                            type = 'email'
                            value = { this.state.email } />
                    </SpotlightTarget>
                    <br />


                    <Label>Enter Meeting id</Label>

                    <SpotlightTarget name = 'server-setting'>
                        <FieldTextStateless
                            autoFocus = { false }
                            isInvalid = {
                                !numericRegex.test(this.state.roomId)
                                && this.state.roomId.length !== 0
                            }
                            isLabelHidden = { true }
                            name = 'roomId'
                            onChange = { this._onRoomIdChange }
                            placeholder = 'Enter Meeting ID you recieved in email'
                            shouldFitContainer = { true }
                            type = 'roomId'
                            value = {
                                this.state.roomId
                            } />
                    </SpotlightTarget>
                    <Button
                        onClick = { this._onJoin }
                        type = 'button'>
                        Join Meeting
                    </Button>
                </Form>
            </Header>
        );
    }
}

export default connect()(Welcome);
