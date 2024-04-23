import {
    CommandType,
    Command,
    Host,
    ServerGroup,
    Service,
    Role,
    ServiceStatus,
    ServiceType,
    User,
    UserClaims,
    CommandTypeValue,
    RoleValue,
    ServiceStatusValue,
    ServiceTypeValue,
    ServerGroupSchema, UserSchema
} from "./data/models";
import bcrypt from 'bcrypt';
import {saltRounds} from "./jwt";
import {object, array, string, number, InferType} from 'yup'
import {TSshCommandRequest} from "./ssh";
import * as fs from 'fs';
import { join } from 'path'
import {userFile, configFile} from './config'


export const UserFileSchema = array().of(UserSchema).required();
export type UserFileData = InferType<typeof UserFileSchema>;
type UserMap = Record<string, User>;

export const ConfigFileSchema = array().of(ServerGroupSchema).required();
export type Config = InferType<typeof ConfigFileSchema>;
type ServerGroupMap = Record<string, ServerGroup>;



export const getUsers = async (): Promise<UserMap> => {
    const userJson = fs.readFileSync(userFile, 'utf-8');
    const userObj = JSON.parse(userJson);
    if (!userObj) {
        throw new Error(`Error parsing users file. invalid json. userFile: ${userFile}`);
    }
    const config: UserFileData = await UserFileSchema.validate(userObj);

    let map:UserMap = {};
    config.forEach((user: User) => {
        map[user.username] = user;
    });

    return map;
}

export const getServerConfig = async (): Promise<ServerGroupMap> => {
    const configJson = fs.readFileSync(configFile, 'utf-8');
    const configObj = JSON.parse(configJson);
    if (!configObj) {
        throw new Error(`Error parsing config file. invalid json. configFile: ${configFile}`);
    }
    const config: Config = await ConfigFileSchema.validate(configObj);

    let map:ServerGroupMap = {};
    config.forEach((serverGroup: ServerGroup) => {
        map[serverGroup.name] = serverGroup;
    });

    return map;
}

export const getServerGroups = async (): Promise<string[]> => {
    const serverConfigMap: ServerGroupMap = await getServerConfig();
    return Object.keys(serverConfigMap);
}

export const getServerGroup = async (serverGroupName: string, userClaims: UserClaims): Promise<ServerGroup> => {
    const serverConfigMap: ServerGroupMap = await getServerConfig();

    if (!(serverGroupName in serverConfigMap)) {
        throw new Error(`ServerGroup not found: ${serverGroupName}`);
    }
    const serverGroup: ServerGroup = serverConfigMap[serverGroupName];

    console.log("ServerGroup: ", JSON.stringify(serverGroup));

    serverGroup.hosts.forEach((host: Host, hostIndex: number) => {
        host.services.forEach((service: Service, serviceIndex: number) => {
            if (serverGroup.hosts[hostIndex].services[serviceIndex].commands.length > 0) {
                serverGroup.hosts[hostIndex].services[serviceIndex].commands = service.commands.filter((command: Command) => {
                    return userClaims.roles.includes(command.role);
                });
            }
        });
    });

    return serverGroup;
};

export const findCommand = async (commandRequest: TSshCommandRequest, userClaims: UserClaims): Promise<Command> => {
    const serverGroup = await getServerGroup(commandRequest.groupName, userClaims);

    const hostIndex: number = serverGroup.hosts.findIndex(
        (host: Host) => host.name === commandRequest.hostName
    );
    if (hostIndex === -1) {
        throw new Error(`Command not found. Invalid Host name: ${commandRequest.hostName}`)
    }
    const serverIndex = serverGroup.hosts[hostIndex].services.findIndex(
        (service: Service) => service.name === commandRequest.serviceName
    );
    if (serverIndex === -1) {
        throw new Error(`Command not found. Invalid Service name: ${commandRequest.serviceName}`)
    }
    const commandIndex = serverGroup.hosts[hostIndex].services[serverIndex].commands.findIndex(
        (command: Command) => command.name == commandRequest.commandName
    );
    if (commandIndex === -1) {
        throw new Error(`Command not found. Invalid Command name: ${commandRequest.commandName}`)
    }
    return serverGroup.hosts[hostIndex].services[serverIndex].commands[commandIndex];
}


export const findUser = async (username: string): Promise<User> => {
    const users = await getUsers();
    // const users = [
    //     {
    //         displayName: "Abe Bosch",
    //         username: "boscha1",
    //         password: await bcrypt.hash("secret", saltRounds),
    //         roles: [RoleValue.user, RoleValue.admin, RoleValue.super]
    //     },
    //     {
    //         displayName: "PDC User",
    //         username: "pdc",
    //         password: await bcrypt.hash("secret", saltRounds),
    //         //roles: [Role.user, Role.admin]
    //         roles: [RoleValue.user]
    //     }
    // ]
    // const user = users.find((user: User)=> user.username === username);
    if (!(username in users)) {
        throw new Error('Username/Password is wrong. code(1)');
    }
    return users[username];
}


const makeServerGroupObj = (serverGroupName: string): ServerGroup => {
    const serverGroup: ServerGroup = {
        name: `${serverGroupName.toLocaleUpperCase()}`,
        hosts: [
            {
                name: `${serverGroupName.toLocaleLowerCase()}-portal-lax-gcs01.pacwisp.net`,
                services: [
                    {
                        name: "Wisp Core",
                        serviceType: ServiceTypeValue.wispCore,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/apache_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/apache_restart",
                                role: RoleValue.admin
                            },
                        ],
                    },
                    {
                        name: "Wisp Job Queues",
                        serviceType: ServiceTypeValue.supervisor,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/supervisor_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/supervisor_restart",
                                role: RoleValue.admin
                            },
                        ],
                    },
                    {
                        name: "Cron",
                        serviceType: ServiceTypeValue.cron,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/cron_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/cron_restart",
                                role: RoleValue.admin
                            },
                        ],
                    },
                ],
            },
            {
                name: `${serverGroupName.toLocaleLowerCase()}-radius-lax-gcs01.pacwisp.net`,
                services: [
                    {
                        name: "RAS",
                        serviceType: ServiceTypeValue.ras,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/ras_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/ras_restart",
                                role: RoleValue.admin
                            },
                        ],
                    },
                    {
                        name: "Radius",
                        serviceType: ServiceTypeValue.radius,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/radius_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/radius_restart",
                                role: RoleValue.admin
                            },
                        ],
                    },
                    {
                        name: "MySQL",
                        serviceType: ServiceTypeValue.mysql,
                        status: ServiceStatusValue.unknown,
                        commands: [
                            {
                                name: "Get Status",
                                type: CommandTypeValue.statusCommand,
                                command: "/opt/admin/jenkins/bin/mysql_status",
                                role: RoleValue.user
                            },
                            {
                                name: "Restart",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/mysql_restart",
                                role: RoleValue.admin
                            },
                            {
                                name: "Stop",
                                type: CommandTypeValue.restartCommand,
                                command: "/opt/admin/jenkins/bin/mysql_stop",
                                role: RoleValue.admin
                            },
                        ],
                    },
                ],
            },
        ],
    };

    return serverGroup;
}