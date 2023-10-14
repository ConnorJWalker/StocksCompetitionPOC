import ILoginForm from '../models/dto/ilogin-form'
import useApi from './useApi'
import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'

const useLogin = () => {
    const { login } = useApi()
    const { setTokens } = useAuthentication()
    const navigate = useNavigate()

    return async (loginForm: ILoginForm) => {
        const authenticationResponse = await login(loginForm)
        setTokens(authenticationResponse)
        navigate('/', { replace: true })
    }
}

export default useLogin
