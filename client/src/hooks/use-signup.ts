import ISignupForm from '../models/dto/isignup-form'
import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'
import ApiService from '../services/api-service'

const useSignup = () => {
    const { setTokens } = useAuthentication()
    const navigate = useNavigate()

    return async (signupForm: ISignupForm) => {
        const authenticationResponse = await ApiService.SignUp(signupForm)
        setTokens(authenticationResponse)
        navigate('/', { replace: true })
    }
}

export default useSignup
