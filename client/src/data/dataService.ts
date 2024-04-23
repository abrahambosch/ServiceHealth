import {
    CommandStatus,
    CommandStatusValue,
    CommandType,
    CommandTypeValue,
    Command,
    CommandResponse,
    Host,
    ServerGroup,
    Service,
    StatusCommandResponse,
    Role,
    RoleValue,
    ServiceStatus,
    UserLoginResponse, ServiceStatusValue
} from "./models";

import {InferType, object, array, string, number,} from "yup";


export const getAuthToken = () => {
    return sessionStorage.getItem("token");
}

export const getAllStatusesForServerGroup = async (
    serverGroup: ServerGroup
): Promise<ServerGroup> => {
    let promises = [];
    if (!serverGroup.hosts || !serverGroup.hosts.length) return serverGroup;
    let updatedServerGroup = {...serverGroup} as ServerGroup;
    for (let h = 0; h < serverGroup.hosts.length; h++) {
        if (!serverGroup.hosts[h].services || !serverGroup.hosts[h].services.length)
            continue;
        for (let s = 0; s < serverGroup.hosts[h].services.length; s++) {
            if (
                !serverGroup.hosts[h].services[s].commands ||
                !serverGroup.hosts[h].services[s].commands.length
            )
                continue;
            let commandIndex = serverGroup.hosts[h].services[s].commands.findIndex(
                (command) => command.type == CommandTypeValue.statusCommand
            );
            if (commandIndex != -1) {
                let statusPromise = statusSshCommand(
                    serverGroup,
                    serverGroup.hosts[h],
                    serverGroup.hosts[h].services[s],
                    serverGroup.hosts[h].services[s].commands[commandIndex]
                )
                    .then((result) => {
                        updatedServerGroup.hosts[h].services[s].status = result.serviceStatus;
                    })
                    .catch((e) => {
                    });
                promises.push(statusPromise);
            }
        }
    }
    await Promise.all(promises);
    return updatedServerGroup;
};


export const statusSshCommand = async (
    serverGroup: ServerGroup,
    host: Host,
    service: Service,
    command: Command
): Promise<StatusCommandResponse> => {
    const response: CommandResponse = await sshCommand(serverGroup, host, service, command);
    let serviceStatus: ServiceStatus;
    let commandStatus: CommandStatus;
    let commandOutput: string = "";
    if (response.code != 0) {
        serviceStatus = ServiceStatusValue.errorRetrieving;
        commandStatus = CommandStatusValue.Error;
    } else {
        try {
            const details = JSON.parse(response.stdout);

            if ("serviceStatus" in details && details.serviceStatus in ServiceStatusValue) {
                serviceStatus = details.serviceStatus;
            } else {
                serviceStatus = ServiceStatusValue.unmappedStatus;
            }
            if ("commandStatus" in details && details.commandStatus in CommandStatusValue) {
                commandStatus = details.commandStatus;
            } else {
                commandStatus = CommandStatusValue.Error;
            }
            if ("commandOutput" in details) {
                commandOutput = details.commandOutput;
            }
        } catch (e) {
            serviceStatus = ServiceStatusValue.invalidJsonReturned
            commandStatus = CommandStatusValue.Error;
        }

    }

    return {
        ...response,
        commandStatus,
        serviceStatus,
        commandOutput,
    }
};


const apiUrl = (url: string) => {
    if ("API_URL" in process.env) {
        return `${process.env.API_URL}${url}`;
    }
    return url;
}

const sshCommandResponseSchema = object({
    data: object({
        response: object({
            stdout: string().defined(),
            stderr: string().defined(),
            code: number().required(),
        })
    })
});

export const sshCommand = async (
    group: ServerGroup,
    host: Host,
    service: Service,
    command: Command
): Promise<CommandResponse> => {
    const response = await fetch(apiUrl("/api/sshCommand"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
            groupName: group.name,
            hostName: host.name,
            serviceName: service.name,
            commandName: command.name,
            command: command.command,
        })
    });
    const data = await response.json();
    console.log("ssh command response data: ", data);

    if ("error" in data) {
        return {
            stdout: "",
            stderr: data.error,
            code: 1
        }
    }
    try {
        const {
            data: {
                response: {
                    stdout,
                    stderr,
                    code
                }
            }
        } = await sshCommandResponseSchema.validate(data);
        return {
            stdout,
            stderr,
            code
        };
    } catch (e) {
        return {
            stdout: "",
            stderr: e instanceof Error ? e.message : JSON.stringify(e),
            code: 1
        }
    }
    //return JSON.stringify({status: "ok", stdout: "", stderr: "", code: 0});
};

const sleep = (timeout: number, returnVal: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(returnVal);
        }, timeout);
    });
};

export const getGroups = async (): Promise<string[]> => {
    const response = await fetch(apiUrl("/api/serverGroups"), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`
        }
    });
    const data = await response.json();
    return data.data;
}

export const getServerGroup = async (serverGroupName: string): Promise<ServerGroup> => {
    const response = await fetch(apiUrl(`/api/serverGroups/${serverGroupName}`), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getAuthToken()}`
        }
    });
    const data = await response.json();
    return data.data;
};


const loginResponseSchema = object({
    data: object({
        token: string().defined().min(1),
        userClaims: object({
            username: string().defined().min(1),
            displayName: string().defined().min(1),
            roles: array().of(
                string().oneOf([RoleValue.user, RoleValue.admin, RoleValue.super])
            ).min(1)
        })
    })
});


export const authLogin = async (
    username: string,
    password: string
): Promise<UserLoginResponse> => {
    const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });
    const data = await response.json();
    console.log("ssh command response data: ", data);

    if ("error" in data) {
        throw new Error(data.error);
    }

    const {
        data: {
            token,
            userClaims
        }
    } = await loginResponseSchema.validate(data);

    return {token, userClaims} as UserLoginResponse;
}

export const authUser = async (
    authToken: string
): Promise<UserLoginResponse> => {
    //await sleep(1000, "");
    const response = await fetch(apiUrl("/api/auth/user"), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    });
    const data = await response.json();
    console.log("ssh command response data: ", data);

    if ("error" in data) {
        throw new Error(data.error);
    }

    const {
        data: {
            token,
            userClaims
        }
    } = await loginResponseSchema.validate(data);

    return {token, userClaims} as UserLoginResponse;
}