export default interface IHttpResult<T> {
    ok: boolean
    statusCode: number
    content: T
}

export enum FailureReason {
    Unauthorised,
    MissingScope,
    RateLimitExceeded,
    Other
}
