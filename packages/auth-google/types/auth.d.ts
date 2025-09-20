declare type SessionValidationResult = {
    session?: ISession;
};

interface IAccount {
    _id?: string;
    uid: number;
    username: string;
    passhash?: string;
    email: string;
    displayName: string;
    googleId?: string;

    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    isActive?: boolean;
    isAdmin?: boolean;
    picture?: string;
}

interface ISession {
    _id?: string;
    sid: string;
    uid: number;
    createdAt: Date;
    expiresAt: Date;
}

interface IOAuthClaims {
    // Authorized party：表示最初向 Google 请求 token 的客户端 ID（即谁发起了请求）
    azp: string;
    // Audience：表示这个 token 是发给谁的，通常就是客户端 ID
    aud: string;
    // Subject：用户在 Google 的唯一标识（对该 aud 唯一，字符串）
    sub: string;
    // Access Token Hash：用于验证 access_token 是否被篡改（可选，用于安全）
    at_hash: string;
    // Issued At：token 颁发时间，单位为秒的 Unix 时间戳
    iat: number;
    // Expiration：token 过期时间，单位为秒的 Unix 时间戳
    exp: number;

    email: string;
    name: string;
    picture: string;
}
