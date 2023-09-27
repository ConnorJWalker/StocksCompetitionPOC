import ISignupForm from '../models/dto/isignup-form'
import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'
import useApi from './useApi'

const useSignup = () => {
    const { signup } = useApi()
    const { setTokens } = useAuthentication()
    const navigate = useNavigate()

    return async (signupForm: ISignupForm) => {
        const authenticationResponse = await signup(signupForm)
        setTokens(authenticationResponse)
        navigate('/', { replace: true })
    }
}

export default useSignup
