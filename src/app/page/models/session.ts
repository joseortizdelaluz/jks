import { User } from "./user";

export class Session{
    constructor(
        public user: User,
        /// Datos de la session actual
        public access_token?: string,
        public refresh_token?: string,
        public expired_at?: Date,
    ){}

    static fromJson(json:any): Session{
        const user = User.fromJson(json);
        return new Session(
            user,
            json["access_token"],
            json["refresh_token"],
            json["expired_at"],
        );
    }
}