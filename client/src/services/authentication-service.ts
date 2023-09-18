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

const LogIn = async (loginForm: ILoginForm) => {
    const authenticationResponse = await ApiService.Login(loginForm)
    storeUserDetails(authenticationResponse)
}

const SignUp = async (signupForm: ISignupForm) => {
    const authenticationResponse = await ApiService.SignUp(signupForm)
    storeUserDetails(authenticationResponse)
}

const LogOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
}

export default {
    LogIn,
    SignUp,
    LogOut
}
