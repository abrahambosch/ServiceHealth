import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {User, UserClaims, UserLoginResponse} from "./data/models";
import {findUser} from "./data";
import bcrypt from 'bcrypt';

export const saltRounds = 8

export const SECRET_KEY: Secret = String(process.env.SECRET_KEY);

export interface AuthenticatedRequest extends Request {
    userClaims: UserClaims;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error("Auth token missing");
        }
        const response: UserLoginResponse = validateJwt(token);
        (req as AuthenticatedRequest).userClaims = response.userClaims;

        next();
    } catch (err) {
        return res.status(401).send('Please authenticate');
    }
};

export const authSuper = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error("Auth token missing");
        }
        const response: UserLoginResponse = validateJwt(token);
        (req as AuthenticatedRequest).userClaims = response.userClaims;

        if (! response.userClaims.roles.includes("super")) {
            throw new Error("User not authorized");
        }

        next();
    } catch (err) {
        return res.status(401).send('Please authenticate');
    }
};


export async function login(username: string, password: string): Promise<UserLoginResponse> {
    try {
        const foundUser:User = await findUser(username);

        if (!foundUser) {
            throw new Error('Username/Password is wrong. code(2)');
        }

        const isMatch = bcrypt.compareSync(password, foundUser.password);

        if (isMatch) {
            const userClaims: UserClaims = {
                username: foundUser.username,
                displayName: foundUser.displayName,
                roles: foundUser.roles
            };
            const token = signUserClaims(userClaims);

            return { userClaims, token };
        } else {
            throw new Error('Username/Password is wrong. code(3)');
        }

    } catch (error) {
        throw error;
    }
}

export const signUserClaims = (userClaims: UserClaims) => {
    const token = jwt.sign(userClaims, SECRET_KEY, {
        expiresIn: '2 days',
    });
    return token;
}

export const validateJwt = (token: string): UserLoginResponse => {
    console.log("validateJwt token: ", token)
    const userClaims = jwt.verify(token, SECRET_KEY);
    return { userClaims, token } as UserLoginResponse;
}

export const getUserClaimsFromReq = (req: Request): UserLoginResponse => {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        throw new Error("Auth token missing");
    }
    const response: UserLoginResponse = validateJwt(token);

    return response
}
