import type { Cookies, RequestEvent } from "@sveltejs/kit";
import type { Db } from "mongodb";

import { base64Encode, sha256 } from "@cyysummer/core";

interface ISessionComposableConfig {
    // #region Database config

    /**
     * Authorization database
     */
    db: Db;

    /**
     * Name of the session collection.
     * @default "session"
     */
    sessionCollectionName?: string,

    // #endregion

    tokenLength?: number,

    /**
     * How long will the session expires (in milliseconds).
     * @default 7 * 24 * 60 * 60 * 1000 ms = 7 days.
     */
    expires?: number;

    /**
     * Name of the session cookie.
     * @default "session"
     */
    sessionCookieName?: string;
}

export function useSession(config: ISessionComposableConfig) {
    const {
        db,
        sessionCollectionName = "session",

        tokenLength = 20,
        expires = 7 * 24 * 60 * 60 * 1000,  // 7 days.
        sessionCookieName = "session",
    } = config;
    const sessionColl = db.collection<ISession>(sessionCollectionName);

    function generateSessionToken(): string {
        const bytes = new Uint8Array(tokenLength);
        crypto.getRandomValues(bytes);
        const token = base64Encode(bytes);
        return token;
    }

    async function createSession(token: string, userId: number): Promise<ISession> {
        const sessionId = await sha256(token);
        const session: ISession = {
            sid: sessionId,
            uid: userId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + expires),
        };
        // db.execute("INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)", session.id, session.userId, Math.floor(session.expiresAt.getTime() / 1000));
        const res = await sessionColl.insertOne(session);
        //todo: check result
        return session;
    }

    async function validateSessionToken(token: string): Promise<SessionValidationResult> {
        const sessionId = await sha256(token);
        // const row = db.queryOne("SELECT session.id, session.user_id, session.expires_at, user.id FROM session INNER JOIN user ON user.id = session.user_id WHERE id = ?", sessionId);
        const session = await sessionColl.findOne({ sid: sessionId });
        if (session == null) {
            return { session: undefined };
        }

        if (Date.now() >= session.expiresAt.getTime()) {
            // db.execute("DELETE FROM session WHERE id = ?", session.id);
            const res = await sessionColl.deleteOne({ sid: sessionId });
            //todo: check result
            return { session: undefined };
        }
        if (Date.now() >= session.expiresAt.getTime() - expires / 2) {
            session.expiresAt = new Date(Date.now() + expires);
            // db.execute("UPDATE session SET expires_at = ? WHERE id = ?", Math.floor(session.expiresAt.getTime() / 1000), session.id);
            const res = await sessionColl.updateOne({ sid: sessionId }, { $set: { expiresAt: session.expiresAt } });
            //todo: check result
        }

        //@ts-ignore
        delete session._id;
        return { session };
    }

    async function invalidateSession(sessionId: string): Promise<void> {
        // db.execute("DELETE FROM session WHERE id = ?", sessionId);
        await sessionColl.deleteOne({ sid: sessionId });
    }

    async function invalidateAllSessions(userId: number): Promise<void> {
        // await db.execute("DELETE FROM user_session WHERE user_id = ?", userId);
        await sessionColl.deleteMany({ udi: userId });
    }

    function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
        cookies.set(sessionCookieName, token, {
            httpOnly: true,
            sameSite: "lax",
            expires: expiresAt,
            path: "/",
        });
    }

    function deleteSessionTokenCookie(cookies: Cookies): void {
        cookies.set(sessionCookieName, "", {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });
    }

    return {
        generateSessionToken,
        createSession,
        validateSessionToken,
        invalidateSession,
        invalidateAllSessions,
        setSessionTokenCookie,
        deleteSessionTokenCookie,
    }
}
