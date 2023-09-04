export default interface IHttpResult<T> {
    ok: boolean
    statusCode: number
    content: T
}