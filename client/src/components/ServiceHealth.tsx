import React from "react";

import {
    ServerGroup, UserClaims, UserLoginResponse,
} from "../data/models";

import {getServerGroup, getGroups, authLogin as apiLogin, authUser} from "../data/dataService";
import { useEffect, useState } from "react";

import {
    ServerGroupComponent,
} from "./ServerGroupComponent";

import {
    Login,
    ILoginCredentials
} from "./Login";

import "@material/data-table/dist/mdc.data-table.css";
import "@rmwc/data-table/data-table.css";
import "@rmwc/icon/icon.css";
import '@rmwc/select/styles';
import { Select } from "@rmwc/select";

import '@rmwc/top-app-bar/styles';
import {
    TopAppBar,
    TopAppBarRow,
    TopAppBarSection,
    TopAppBarTitle,
    TopAppBarFixedAdjust
} from "@rmwc/top-app-bar";

import {Grid, GridCell } from "@rmwc/grid";
import '@rmwc/grid/styles';
import {Typography} from "@rmwc/typography";

import {IconButton} from '@rmwc/icon-button'
import '@rmwc/icon-button/styles';
import {CarrierSetup} from "./CarrierSetup";

export const ServiceHealth = () => {

    let initialUser = null;
    let initialToken = '';
    const [groupName, setGroupName] = useState<string>("");
    const [groups, setGroups] = useState<string[]>([]);
    const [serverGroup, setServerGroup] = useState<ServerGroup>({} as ServerGroup);
    const [loginError, setLoginError] = useState<string>('');
    const [user, setUser] = useState<UserClaims|null>(initialUser);
    const [authToken, setAuthToken] = useState<string>(initialToken);
    const onSubmitLogin = async (credentials: ILoginCredentials): Promise<void> => {
        console.log("onSubmitLogin: ", credentials)
        try {
            setLoginError("");
            const {token, userClaims} = await apiLogin(credentials.username, credentials.password);
            setUser(userClaims);
            setAuthToken(token);
            sessionStorage.setItem("token", token);
        }
        catch(e) {
            if (e instanceof Error) {
                setLoginError(e.message);
            }
        }
    }
    useEffect(() => {
        if (groupName) {
            getServerGroup(groupName).then((serverGroup: ServerGroup) => {
                setServerGroup(serverGroup);
                console.log("serverGroup: ", JSON.stringify(serverGroup));
            });
        }
    }, [groupName]);

    useEffect(() => {
        if (authToken) {
            getGroups().then((groups: string[]) => {
                setGroups(groups);
                console.log("groups: ", groups);
            });
        }
    }, [authToken]);

    useEffect(() => {
        let tokenFromStorage = sessionStorage.getItem('token') || '';
        if (!user && tokenFromStorage) {
            try {
                authUser(tokenFromStorage)
                    .then(({ userClaims: tokenClaims }) => {
                        setUser(tokenClaims);
                        setAuthToken(tokenFromStorage);
                        console.log("set user: ", tokenClaims)
                    }).catch((e) => {
                        console.log("got an error fetching user claims", e);
                    })
            } catch (e) {
                console.log("token is not valid: ", e);
            }
        }
    }, []);

    const onChangeGroup = (e: any) => {
        console.log("group on change", e.target.value)
        setGroupName(e.target.value);
    }

    const onClickLogout = (e: any) => {
        sessionStorage.removeItem("token");
        setUser(null);
        setAuthToken("");
        setServerGroup({} as ServerGroup)
    }

    const carrierSetupRequest = {
        carrier: groupName
    }

    return (
        <div className="ServiceAdmin">
            <TopAppBar fixed={true}>
                <TopAppBarRow>
                    <TopAppBarSection alignStart>
                        <TopAppBarTitle>Service Heath</TopAppBarTitle>
                    </TopAppBarSection>
                    <TopAppBarSection alignEnd>
                        {user && <IconButton icon={"logout"} onClick={onClickLogout}/>}
                    </TopAppBarSection>
                    
                </TopAppBarRow>
            </TopAppBar>
            <TopAppBarFixedAdjust />
            {!user  && (
                <Grid >
                    <GridCell span={4}></GridCell>
                    <GridCell span={4} align="middle" >
                        <Login onSubmit={onSubmitLogin} loginError={loginError}/>
                    </GridCell>
                    <GridCell span={4}></GridCell>
                </Grid>

            ) }
            {user && serverGroup && (
                <div>
                    <div style={{marginTop: "20px", marginBottom: "20px"}}>
                        <Typography use="headline6" tag="div">
                            <Select label="Group" options={groups} onChange={onChangeGroup} />
                        </Typography>
                    </div>
                    <ServerGroupComponent serverGroup={serverGroup} setServerGroup={setServerGroup} />
                </div>
            )}
            <br/>
            {carrierSetupRequest.carrier && <CarrierSetup carrierSetupRequest={carrierSetupRequest}/>}

        </div>
    );
}
