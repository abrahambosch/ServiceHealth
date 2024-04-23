import React, {useState} from "react";
import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableContent,
    DataTableHead,
    DataTableHeadCell,
    DataTableRow,
} from "@rmwc/data-table";

import {v4 as uuidv4} from "uuid";

import {Button} from "@rmwc/button";
import "@rmwc/typography/styles";
import {Typography} from "@rmwc/typography";

import "@rmwc/grid/styles";
import {Grid, GridCell} from "@rmwc/grid";

import {getAllStatusesForServerGroup,} from "../data/dataService";
import {
    CommandStatus,
    Command,
    CommandExecution,
    Host,
    ServerGroup,
    Service,
    ServiceStatus,
    ServiceStatusValue, CommandStatusValue
} from "../data/models";

import {CommandExecutionComponent,} from "./CommandExecutionComponent";
import {ServiceStatusBadge} from "./ServiceStatusBadge";
import {IconButton} from "@rmwc/icon-button";
import '@rmwc/icon-button/styles';


interface ISetServerGroupFun {
    (serverGroup: ServerGroup): void;
}

interface IProps {
    serverGroup: ServerGroup;
    setServerGroup: ISetServerGroupFun;
}

export const ServerGroupComponent = (props: IProps): JSX.Element => {
    if (!props.serverGroup) return <div>No ServerGroup</div>;

    const [commandExecutions, setCommandExecutions] = useState<
        CommandExecution[]
    >([]);

    const onClickUpdateAllStatuses = async (): Promise<void> => {
        console.log("onClickUpdateAllStatuses clicked");
        const updatedServerGroup = await getAllStatusesForServerGroup(props.serverGroup);
        console.log("updatedServerGroup: ", updatedServerGroup);
        props.setServerGroup(updatedServerGroup);
    };

    const updateServiceStatus = (commandExecution: CommandExecution) => {
        let newServerGroup = {...props.serverGroup};
        const hostIndex = props.serverGroup.hosts.findIndex((host: Host) => {
            return host.name === commandExecution.host.name;
        });
        if (hostIndex === -1) {
            return;
        }
        const serviceIndex = props.serverGroup.hosts[hostIndex].services.findIndex((service: Service) => {
            return service.name === commandExecution.service.name;
        });
        if (serviceIndex === -1) {
            return;
        }
        newServerGroup.hosts[hostIndex].services[serviceIndex].status = commandExecution.serviceStatus;
        props.setServerGroup(newServerGroup);
    };

    const updateCommandExecution = async (
        commandExecution: CommandExecution
    ): Promise<void> => {
        const newCommandExecutions = commandExecutions.map((command) => {
            return command.id == commandExecution.id ? commandExecution : command;
        });
        setCommandExecutions(newCommandExecutions);
        updateServiceStatus(commandExecution);
    };

    const deleteCommandExecution = async (
        commandExecution: CommandExecution
    ): Promise<void> => {
        const newCommandExecutions = commandExecutions.filter((command) => {
            return command.id != commandExecution.id;
        });
        setCommandExecutions(newCommandExecutions);
    };

    const AddNewExecuteCommand = (
        group: ServerGroup,
        host: Host,
        service: Service,
        command: Command
    ) => {
        console.log("Execute Command", host, service, command);

        setCommandExecutions([
            ...commandExecutions,
            {
                id: uuidv4(),
                group,
                host,
                service,
                command,
                result: "",
                serviceStatus: ServiceStatusValue.unknown,
                commandStatus: CommandStatusValue.Ready,
                startDate: new Date(),
                endDate: null,
                updatedAt: new Date(),
            } as CommandExecution,
        ]);
    };

    return (
        <div>
            {/*<Grid>*/}
            {/*    <GridCell>*/}
            {/*        <Typography use="headline5" tag="div">*/}
            {/*            Group: {props.serverGroup.name}*/}
            {/*        </Typography>*/}
            {/*    </GridCell>*/}
            {/*    <GridCell>*/}
            {/*        */}
            {/*    </GridCell>*/}
            {/*</Grid>*/}


            {/* <pre style={{ "text-align": "left" }}>
        {JSON.stringify(props.serverGroup, null, 2)}
      </pre> */}

            {props.serverGroup.hosts && (
                <DataTable>
                    <DataTableContent>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableHeadCell>Host</DataTableHeadCell>
                                <DataTableHeadCell>Service</DataTableHeadCell>
                                <DataTableHeadCell>Status</DataTableHeadCell>
                                <DataTableHeadCell>Commands
                                    <IconButton icon={"refresh"} onClick={onClickUpdateAllStatuses}
                                                style={{position: "absolute", right: "6px", top: "6px"}}/>
                                    {/*<Button onClick={onClickUpdateAllStatuses}>Update All Statuses</Button>*/}
                                </DataTableHeadCell>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                            {props.serverGroup.hosts &&
                                props.serverGroup.hosts.map((host: Host) => {
                                    console.log("Host:", host);
                                    return (
                                        host.services &&
                                        host.services.map((service: Service) => {
                                            console.log("Service:", service);

                                            return (
                                                <DataTableRow key={`${host.name}${service.name}`}>
                                                    <DataTableCell>{host.name}</DataTableCell>
                                                    <DataTableCell>{service.name}</DataTableCell>
                                                    <DataTableCell><ServiceStatusBadge
                                                        status={service.status}/></DataTableCell>
                                                    <DataTableCell>
                                                        {service.commands &&
                                                            service.commands.map((command: Command) => {
                                                                return (
                                                                    <Button
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                AddNewExecuteCommand(
                                                                                    props.serverGroup,
                                                                                    host,
                                                                                    service,
                                                                                    command
                                                                                );
                                                                            }}
                                                                    >
                                                                        {command.name}
                                                                    </Button>
                                                                );
                                                            })}
                                                    </DataTableCell>
                                                </DataTableRow>
                                            );
                                        })
                                    );
                                })}
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>
            )}

            <div>
                {commandExecutions &&
                    commandExecutions.length > 0 &&
                    commandExecutions.map((commandExecution: CommandExecution) => {
                        return (
                            <CommandExecutionComponent
                                commandExecution={commandExecution}
                                updateCommandExecution={updateCommandExecution}
                                deleteCommandExecution={deleteCommandExecution}
                            />
                        );
                    })}
            </div>
        </div>
    );
};
