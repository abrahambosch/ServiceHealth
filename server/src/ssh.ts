import {NodeSSH} from 'node-ssh';
import 'dotenv/config'
import {InferType, object, string} from "yup";
import { Client } from 'node-scp';
import {Command, CommandResponse, UserClaims} from "./data/models";
import {findCommand} from "./data";


export const SshCommandSchema = object({
    groupName: string().required().defined(),
    hostName: string().required().defined(),
    serviceName: string().required().defined(),
    commandName: string().required().defined(),
    command: string().required().defined()
});

export type TSshCommandRequest = InferType<typeof SshCommandSchema>;

export interface ISshConfig {
    host: string;
    username: string;
    password: string;
    port: number;
    readyTimeout: number;
}

const getServerConfig = async (hostName: string): Promise<ISshConfig> => {
    return {
        host: "localhost",
        username: process.env.SSH_USERNAME ||"jenkins",
        password: process.env.SSH_PASSWORD || "jenkins",
        port: process.env.SSH_PORT || 2222,
        readyTimeout: 5000,
        //privateKey: process.env.SSH_privatekey,
        //passphrase: process.env.SSH_passphrase
    } as ISshConfig;
}

export const executeSshCommand = async (sshCommand: TSshCommandRequest, userClaims: UserClaims): Promise<CommandResponse> => {
    const command = await findCommand(sshCommand, userClaims); // lookup the command.
    // @ts-ignore
    if (!Array.isArray(userClaims.roles) || !userClaims.roles.includes(command.role)) {
        // @ts-ignore
        throw new Error(`User has insufficient role to execute command. required role is ${command.role}. User has these roles: [${userClaims.roles.join(',')}]`)
    }
    const config: ISshConfig = await getServerConfig(sshCommand.hostName);
    const ssh = new NodeSSH()
    await ssh.connect(config);
    const response = await ssh.execCommand(command.command, {
        cwd: '/opt/admin/jenkins/bin'
    });
    if (response.code != 0) {
        // @ts-ignore
        throw new Error(response.stderr);
    }
    return {
        stdout: response.stdout,
        stderr: response.stderr,
        code: response.code,
    };
}




async function test() {
    try {
        const client = await Client({
            host: 'your host',
            port: 22,
            username: 'username',
            password: 'password',
            // privateKey: fs.readFileSync('./key.pem'),
            // passphrase: 'your key passphrase',
        })
        await client.uploadFile(
            './test.txt',
            '/workspace/test.txt',
            // options?: TransferOptions
        )
        // you can perform upload multiple times
        await client.uploadFile('./test1.txt', '/workspace/test1.txt')
        client.close() // remember to close connection after you finish
    } catch (e) {
        console.log(e)
    }
}


// const main = async () => {
//     const config = {
//         host: process.env.SSH_host,
//         username: process.env.SSH_user,
//         password: process.env.SSH_password,
//         port: process.env.SSH_port,
//         readyTimeout: 5000
// //privateKey: process.env.SSH_privatekey,
// //passphrase: process.env.SSH_passphrase
//     }
//     const command = '/root/bin/apache_status';
//     return await executeSshCommand(config, command);
// }
//
//
// main().then(result => {
//     console.log("done", result);
//     process.exit();
// }).catch(error => {
//     if (error.level == "client-timeout") {
//         console.log("Caught Client Timeout Error. ", error);
//     } else {
//         console.log("Caught Error. ", error);
//     }
//     process.exit();
// })

