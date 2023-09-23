import jwtDecode from 'jwt-decode'
import ISignupForm from '../models/dto/isignup-form'
import ILoginForm from '../models/dto/ilogin-form'
import ApiService from './api-service'
import IUser from '../models/iuser'
import IAuthenticationResponse from '../models/dto/iauthentication-response'

const storeUserDetails = (authenticationResponse: IAuthenticationResponse) => {
    const decodedToken = jwtDecode<IUser>(authenticationResponse.accessToken)

    localStorage.setItem('accessToken', authenticationResponse.accessToken)
    localStorage.setItem('refreshToken', authenticationResponse.refreshToken)
    localStorage.setItem('user', JSON.stringify(decodedToken))
}

const LogIn = async (loginForm: ILoginForm): Promise<void> => {
    const authenticationResponse = await ApiService.Login(loginForm)
    storeUserDetails(authenticationResponse)
}

const Refresh = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken === null) {
        LogOut()
        return false
    }

    const authenticationResponse = await ApiService.Refresh(refreshToken)
    if (authenticationResponse === null) {
        LogOut()
        return false
    }

    localStorage.setItem('accessToken', authenticationResponse.accessToken)
    localStorage.setItem('refreshToken', authenticationResponse.refreshToken)

    return true
}

const SignUp = async (signupForm: ISignupForm): Promise<void> => {
    const authenticationResponse = await ApiService.SignUp(signupForm)
    storeUserDetails(authenticationResponse)
}

const LogOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    window.location.reload()
}

export default {
    LogIn,
    Refresh,
    SignUp,
    LogOut
}
