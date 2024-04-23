import React, {Component, useState} from 'react'
import '@rmwc/dialog/styles';
import {Button} from "@rmwc/button";

import '@rmwc/textfield/styles';
import {TextField} from '@rmwc/textfield'
import {Dialog} from '@rmwc/dialog'
import {Card} from '@rmwc/card'
import {Typography} from "@rmwc/typography";

export interface ILoginCredentials {
    username: string;
    password: string;
}

interface ILoginProps {
    onSubmit: (data: ILoginCredentials) => void;
    loginError: string;
}

export const Login = (props: ILoginProps) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const onChangeUsername = (e: React.FormEvent<HTMLInputElement> & { target: HTMLButtonElement }) => {
        setUsername(e.target.value)
    }
    const onChangePassword = (e: React.FormEvent<HTMLInputElement> & { target: HTMLButtonElement }) => {
        setPassword(e.target.value)
    }

    const onSubmit = () => {
        props.onSubmit({username, password})
    }


    return (
        <Card style={{margin: "20px"}}>
            {/*<Typography use="headline6" style={{padding: 0, marginBlock: "10px"}}>Login</Typography>*/}
            <Typography
                use="subtitle1"
                tag="div"
                style={{ padding: '0.5rem 1rem' }}
                theme="textSecondaryOnBackground"
            >
                Login
            </Typography>

            {/*<ListDivider />*/}
            <TextField label="Username" fullwidth onChange={onChangeUsername}/>
            <TextField label="Password" type="password" fullwidth onChange={onChangePassword}/>
            <Button onClick={onSubmit}>Login</Button>
            {props.loginError && <div style={{color: "red", fontWeight: "bold"}}>{props.loginError} </div>}
        </Card>
    )
}


interface ILoginDialogProps {
    opened: boolean;
    toggle: () => void;
    onSubmit: (data: ILoginCredentials) => void;
    loginError: string;
}

export const LoginDialog = (props: ILoginDialogProps) => {
    return (
        <Dialog
            open={props.opened}
            onClose={props.toggle}
            title={"Login please!"}
        >
            <Login onSubmit={props.onSubmit} loginError={props.loginError}/>
        </Dialog>
    )
};