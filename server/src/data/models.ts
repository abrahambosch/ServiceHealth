import { object, array, string, number, InferType, date  } from 'yup'


export enum RoleValue {
    user = "user",
    admin = "admin",
    super = "super"
}
export const RoleSchema = string().oneOf([
    'user',
    'admin',
    'super',
]);
export type Role = InferType<typeof RoleSchema>;


export const UserSchema = object({
    displayName: string().required().defined(),
    username: string().required().defined(),
    password: string().required().defined(),
    roles: array().of(RoleSchema).required(),
});
export type User = InferType<typeof UserSchema>;

export const UserClaimsSchema = object({
    displayName: string().required().defined(),
    username: string().required().defined(),
    roles: array().of(RoleSchema).required(),
});
export type UserClaims = InferType<typeof UserClaimsSchema>;

export const UserLoginResponseSchema = object({
    userClaims: UserClaimsSchema,
    token: string().required().defined(),
});
export type UserLoginResponse = InferType<typeof UserLoginResponseSchema>;


export enum CommandTypeValue {
    statusCommand = "statusCommand",
    restartCommand = "restartCommand",
    startCommand = "startCommand",
    stopCommand = "stopCommand",
    customCommand = "customCommand",
}
export const CommandTypeSchema = string().oneOf([
    'statusCommand',
    'restartCommand',
    'startCommand',
    'stopCommand',
    'customCommand',
]);
export type CommandType = InferType<typeof CommandTypeSchema>;


export enum CommandStatusValue {
    Ready = "Ready",
    Running = "Running",
    Success = "Success",
    Error = "Error",
}
export const CommandStatusSchema = string().oneOf([
    'Ready',
    'Running',
    'Success',
    'Error',
]);
export type CommandStatus = InferType<typeof CommandStatusSchema>;

export const CommandSchema = object({
    name: string().required().defined(),
    type: CommandTypeSchema,
    command: string().required().defined(),
    role: RoleSchema,
});
export type Command = InferType<typeof CommandSchema>;


export enum ServiceStatusValue {
    unknown = "unknown",
    ok = "ok",
    hostTimeout = "hostTimeout",
    down = "down",
    yellow = "yellow",
    red = "red",
    errorRetrieving = "errorRetrieving",
    unmappedStatus = "unmappedStatus",
    invalidJsonReturned = "invalidJsonReturned",
}
export const ServiceStatusSchema = string().oneOf([
    'unknown',
    'ok',
    'hostTimeout',
    'down',
    'yellow',
    'red',
    'errorRetrieving',
    'unmappedStatus',
    'invalidJsonReturned',
]);
export type ServiceStatus = InferType<typeof ServiceStatusSchema>;


export enum ServiceTypeValue {
    wispCore = "wispCore",
    portalUi = "portalUi",
    ras = "ras",
    radius = "radius",
    mysql = "mysql",
    mikrotik = "mikrotik",
    supervisor = "supervisor",
    cron = "cron",
}
export const ServiceTypeSchema = string().oneOf([
    'wispCore',
    'portalUi',
    'ras',
    'radius',
    'mysql',
    'mikrotik',
    'supervisor',
    'cron',
]);
export type ServiceType = InferType<typeof ServiceTypeSchema>;

export const ServiceSchema = object({
    name: string().required().defined(),
    serviceType: ServiceTypeSchema,
    status: ServiceStatusSchema,
    commands: array().of(CommandSchema).required(),
});
export type Service = InferType<typeof ServiceSchema>;


export const HostSchema = object({
    name: string().required().defined(),
    services: array().of(ServiceSchema).required(),
});
export type Host = InferType<typeof HostSchema>;

export const ServerGroupSchema = object({
    name: string().required().defined(),
    hosts: array().of(HostSchema).required()
});
export type ServerGroup = InferType<typeof ServerGroupSchema>;


export const CommandResponseSchema = object({
    stdout: string().required().defined(),
    stderr: string().required().defined(),
    code: number()
});
export type CommandResponse = InferType<typeof CommandResponseSchema>;

export const StatusCommandResponseSchema = object({
    serviceStatus: ServiceStatusSchema,
    commandStatus: CommandStatusSchema,
    commandOutput: string().required().defined(),
    stdout: string().required().defined(),
    stderr: string().required().defined(),
    code: number()
});
export type StatusCommandResponse = InferType<typeof StatusCommandResponseSchema>;

export const CommandExecutionSchema = object({
    id: string().required().defined(),
    group: ServerGroupSchema,
    host: HostSchema,
    service: ServiceSchema,
    command: CommandSchema,
    result: string().required().defined(),
    commandStatus: CommandStatusSchema,
    serviceStatus: ServiceStatusSchema,
    startDate: date().nullable(),
    endDate: date().nullable(),
    updatedAt: date(),
});
export type CommandExecution = InferType<typeof CommandExecutionSchema>;


/////////////////////
// Interfaces
/////////////////////
//
// export interface ServerGroup {
//     name: string;
//     hosts: Host[];
// }
//
// export interface Host {
//     name: string;
//     services: Service[];
// }
//
//
// export interface Service {
//     name: string;
//     serviceType: string;
//     status: ServiceStatus;
//     commands: Command[];
// }
//
//
// export enum ServiceStatus {
//     unknown = "unknown",
//     ok = "ok",
//     hostTimeout = "hostTimeout",
//     down = "down",
//     yellow = "yellow",
//     red = "red",
//     errorRetrieving = "errorRetrieving",
//     unmappedStatus = "unmappedStatus",
//     invalidJsonReturned = "invalidJsonReturned",
// }
//
//

//
//
// export enum CommandType {
//     statusCommand = "statusCommand",
//     restartCommand = "restartCommand",
//     startCommand = "startCommand",
//     stopCommand = "stopCommand",
//     customCommand = "customCommand",
// }
//
//
//
//
// export interface Command {
//     name: string;
//     type: CommandType;
//     command: string; // example: /opt/admin/jenkins/bin/apache_status
//     role: Role;
//     // SSH into the  server. run shell command.
// }
//
//
//
//
// export enum CommandStatus {
//     Ready = "Ready",
//     Running = "Running",
//     Success = "Success",
//     Error = "Error",
// }
//
// export interface CommandExecution {
//     id: string;
//     group: ServerGroup;
//     host: Host;
//     service: Service;
//     command: Command;
//     result: string;
//     commandStatus: CommandStatus;
//     serviceStatus: ServiceStatus;
//     startDate: Date | null;
//     endDate: Date | null;
//     updatedAt: Date;
// }
//
// export interface CommandResponse {
//     stdout: string;
//     stderr: string;
//     code: number;
// }
//
// export interface StatusCommandResponse extends CommandResponse{
//     serviceStatus: ServiceStatus;
//     commandStatus: CommandStatus;
//     commandOutput: string;
// }
//
// export interface User {
//     displayName: string;
//     username: string;
//     password: string;
//     roles: Role[];
// }
//
// export enum Role {
//     user = "user",
//     admin = "admin",
//     super = "super"
// }
//
// export interface UserClaims {
//     displayName: string;
//     username: string;
//     roles: Role[];
// }
//
// export interface UserLoginResponse {
//     userClaims: UserClaims;
//     token: string;
// }

