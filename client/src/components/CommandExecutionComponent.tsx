import React from "react";
import {
    CommandStatus,
    CommandExecution,
    StatusCommandResponse,
    ServiceStatus,
    CommandStatusValue,
} from "../data/models";
import "@rmwc/circular-progress/styles";
import {Button} from "@rmwc/button";
import {CircularProgress} from "@rmwc/circular-progress";
import {Card, CardActionButtons, CardActions, CardPrimaryAction,} from "@rmwc/card";
import "@rmwc/card/styles";
import "@rmwc/typography/styles";
import {Typography} from "@rmwc/typography";

import '@rmwc/icon/styles';
import {Icon} from "@rmwc/icon";

import "@rmwc/list/styles";
import {ListDivider} from "@rmwc/list";

import "@rmwc/grid/styles";
import {Grid, GridCell} from "@rmwc/grid";
import {statusSshCommand} from "../data/dataService";
import {IconButton} from "@rmwc/icon-button";

export interface IUpdateCommandExecutionInputFun {
    (commandExecution: CommandExecution): void;
}

export interface IUpdateCommandExecutionFun {
    (commandExecution: CommandExecution): void;
}

export interface IDeleteCommandExecutionFun {
    (commandExecution: CommandExecution): void;
}

const runCommand = async (
    commandExecution: CommandExecution,
    updateCommandExecution: IUpdateCommandExecutionFun
): Promise<void> => {
    console.log("Run Command", commandExecution);
    commandExecution.commandStatus = CommandStatusValue.Running;
    commandExecution.startDate = new Date();
    commandExecution.updatedAt = new Date();
    updateCommandExecution(commandExecution);

    const commandExecutionResponse: StatusCommandResponse = await statusSshCommand(
        commandExecution.group,
        commandExecution.host,
        commandExecution.service,
        commandExecution.command,
    );

    const output = `${commandExecutionResponse.stdout}${commandExecutionResponse.stderr}`;
    commandExecution.result = output;
    commandExecution.commandStatus = commandExecutionResponse.commandStatus;
    commandExecution.serviceStatus = commandExecutionResponse.serviceStatus;
    commandExecution.updatedAt = new Date();
    commandExecution.endDate = new Date();
    updateCommandExecution(commandExecution);
};

interface ICommandExecutionProps {
    commandExecution: CommandExecution;
    updateCommandExecution: IUpdateCommandExecutionFun;
    deleteCommandExecution: IDeleteCommandExecutionFun;
}

export const CommandExecutionComponent = (props: ICommandExecutionProps) => {
    const onClickExecute = async (): Promise<void> => {
        console.log("Execute Command", props.commandExecution);
        await runCommand(props.commandExecution, props.updateCommandExecution);
    };

    const onClickDelete = async (): Promise<void> => {
        console.log("Execute Command", props.commandExecution);
        await props.deleteCommandExecution(props.commandExecution);
    };

    return (
        <Card className="command-execution">
            <div style={{padding: "1rem"}}>
                <CardPrimaryAction>

                    {/* <Typography use="body1" tag="div" theme="textSecondaryOnBackground"> */}
                    <div style={{textAlign: "left"}}>
                        <Grid>
                            <GridCell span={11}><Typography use="headline6" tag="div">
                                Command Execution
                            </Typography>
                            </GridCell>
                            <GridCell span={1} align-right>
                                <IconButton icon={"close"} onClick={onClickDelete} style={{position: "absolute", right: "6px", top: "6px"}}/>
                                {/*<Icon icon="favorite">X</Icon>*/}
                                {/*<Button onClick={onClickDelete} style={{position: "absolute", top: "-5px", right: "-20px"}}>X</Button>*/}
                            </GridCell>
                        </Grid>
                        <Grid>
                            <GridCell span={6}>
                                <div><label>Service: </label>{props.commandExecution.service.name}</div>
                                <div><label>Command Type: </label>{props.commandExecution.command.type}</div>
                                <div><label>Command: </label>{props.commandExecution.command.command}</div>
                                <div><label>Command Status: </label>{props.commandExecution.commandStatus}</div>
                                <div><label>Service Status: </label>{props.commandExecution.serviceStatus}</div>
                            </GridCell>
                            <GridCell span={6}>
                                <div>
                                    <div><label>Host: </label>{props.commandExecution.host.name}</div>

                                    <label>Start Date: </label>
                                    {props.commandExecution.startDate
                                        ? props.commandExecution.startDate.toLocaleTimeString()
                                        : ""}
                                </div>
                                <div>
                                    <label>End Date: </label>
                                    {props.commandExecution.endDate
                                        ? props.commandExecution.endDate.toLocaleTimeString()
                                        : ""}
                                </div>
                                <div><label>Execution ID:</label>{props.commandExecution.id}</div>
                            </GridCell>
                        </Grid>

                       <pre className="command-execution-results">{props.commandExecution.result}</pre>
                            {/* <textarea readOnly value={props.commandExecution.result}></textarea> */}
                    </div>
                    {/* </Typography> */}
                </CardPrimaryAction>
                <CardActions>
                    <CardActionButtons>
                        {props.commandExecution.commandStatus == CommandStatusValue.Ready && (
                            <Button onClick={onClickExecute} outlined>
                                Execute
                            </Button>
                        )}

                        {props.commandExecution.commandStatus == CommandStatusValue.Running && (
                            <Button icon={<CircularProgress/>} label="Running"/>
                        )}

                        {(props.commandExecution.commandStatus == CommandStatusValue.Success ||
                            props.commandExecution.commandStatus == CommandStatusValue.Error) && (
                            <Button outlined>Executed</Button>
                        )}
                    </CardActionButtons>
                </CardActions>
            </div>
        </Card>
    );
};
