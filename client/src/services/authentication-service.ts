import ISignupForm from '../models/dto/isignup-form'
import ILoginForm from '../models/dto/ilogin-form'
import ApiService from './api-service'

const LogIn = async (loginForm: ILoginForm) => {
    const token = await ApiService.Login(loginForm)

    // TODO: store the jwt and payload
    // TODO: redirect to home page on completion
    console.log(token)
}

const SignUp = (signupForm: ISignupForm) => {

}

const LogOut = () => {

}

export default {
    LogIn,
    SignUp,
    LogOut
}
