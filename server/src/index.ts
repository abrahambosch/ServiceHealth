
import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import path, {join} from 'path';

//dotenv.config({path: join(__dirname, "..", ".env")});
dotenv.config();

import {getServerGroup, getServerGroups} from "./data";
import {
    ServerGroup,
    CarrierSetupRequestSchema,
    CarrierSetupRequest
} from "./models";
import bodyParser from "body-parser";
import {
    executeSshCommand,
    TSshCommandRequest,
    SshCommandSchema,
} from "./ssh";
import {auth, AuthenticatedRequest, authSuper, login, signUserClaims} from "./jwt";
import {PORT} from "./config";

dotenv.config();

const app: Express = express();
const port = PORT;
//app.use(bodyParser.json({type: 'application/json'}))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../..', 'client', 'build')));

app.get("/api", (req: Request, res: Response): void => {
    res.json({"success": true, datetime: new Date()});
});

app.get("/api/serverGroups", auth, async (req: Request, res: Response): Promise<void> => {
    const serverGroups: string[] = await getServerGroups();
    res.json({"success": true, datetime: new Date(), data: serverGroups});
});

app.get("/api/serverGroups/:serverGroup", auth, async (req: Request, res: Response): Promise<void> => {
    try {
        const userClaims = (req as AuthenticatedRequest).userClaims;
        const serverGroup: ServerGroup = await getServerGroup(req.params.serverGroup, userClaims);
        res.json({"success": true, datetime: new Date(), data: serverGroup});
    } catch (e) {
        res.json({"success": false, datetime: new Date(), error: (e instanceof Error ? e.message : JSON.stringify(e))});
    }
});

export interface TypedRequestBody<T> extends Express.Request {
    body: T
}


app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("auth/login request: ", req.body);
        //const serverGroup: ServerGroup = await getServerGroup(req.params.serverGroup);
        const {username = '', password = ''} = req.body;
        const response = await login(username, password);
        res.json({"success": true, datetime: new Date(), data: response});
    } catch (e) {
        res.json({"success": false, datetime: new Date(), error: (e instanceof Error ? e.message : JSON.stringify(e))});
    }
});

app.get("/api/auth/user", auth, async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("auth/me request: ", req.headers);
        const userClaims = (req as AuthenticatedRequest).userClaims;
        const token = signUserClaims({
            username: userClaims.username,
            displayName: userClaims.displayName,
            roles: userClaims.roles
        });   // refresh the token expiration.
        res.json({"success": true, datetime: new Date(), data: {userClaims, token}});
    } catch (e) {
        res.json({"success": false, datetime: new Date(), error: (e instanceof Error ? e.message : JSON.stringify(e))});
    }
});


app.post("/api/sshCommand", auth, async (req: TypedRequestBody<TSshCommandRequest>, res: Response): Promise<void> => {
    console.log("got sshCommand request: ", req.body)
    let sshCommandRequest: TSshCommandRequest;
    try {
        sshCommandRequest = await SshCommandSchema.validate(req.body);
        const userClaims = (req as AuthenticatedRequest).userClaims;
        const response = await executeSshCommand(sshCommandRequest, userClaims);
        res.json({
            "success": true, datetime: new Date(), data: {
                request: sshCommandRequest,
                response
            }
        });
    } catch (e) {
        console.log("sshCommand error", req.body, e);
        res.json({
            "success": false,
            "datetime": new Date(),
            "error": e instanceof Error ? e.message : e
        });
        return;
    }
});


app.post("/api/carrierSetup", auth, async (req: TypedRequestBody<CarrierSetupRequest>, res: Response): Promise<void> => {
    console.log("got carrierSetup request: ", req.body);

    try {
        const carrierSetupRequest = await CarrierSetupRequestSchema.validate(req.body);
        const userClaims = (req as AuthenticatedRequest).userClaims;
        const response = {
            carrier: carrierSetupRequest.carrier,
            commandOutputResponses: [
                {"code": 0, "stdout": "yeah!!!", "stderr": ""}
            ]
        };

        res.json({
            "success": true, datetime: new Date(), data: {
                request: carrierSetupRequest,
                response
            }
        });
    } catch (e) {
        console.log("sshCommand error", req.body, e);
        res.json({
            "success": false,
            "datetime": new Date(),
            "error": (e instanceof Error && "message" in e) ? e.message : e
        });
        return;
    }
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
