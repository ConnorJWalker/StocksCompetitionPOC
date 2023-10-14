import IAuthenticationResponse from './dto/iauthentication-response'

export default interface IAuthenticationContext {
    accessToken: string | null
    refreshToken: string | null
    setTokens: (authenticationResponse?: IAuthenticationResponse) => void
}
