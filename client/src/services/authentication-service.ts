import jwtDecode from 'jwt-decode'
import ISignupForm from '../models/dto/isignup-form'
import ILoginForm from '../models/dto/ilogin-form'
import ApiService from './api-service'
import IUser from '../models/iuser'

const storeUserDetails = (token: string) => {
    const decodedToken = jwtDecode<IUser>(token)

    localStorage.setItem('authenticationToken', token)
    localStorage.setItem('user', JSON.stringify(decodedToken))
}

const LogIn = async (loginForm: ILoginForm) => {
    const token = await ApiService.Login(loginForm)
    storeUserDetails(token)
}

const SignUp = async (signupForm: ISignupForm) => {
    const token = await ApiService.SignUp(signupForm)
    storeUserDetails(token)
}

const LogOut = () => {
    localStorage.removeItem('authenticationToken')
}

export default {
    LogIn,
    SignUp,
    LogOut
}
