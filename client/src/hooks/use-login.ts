import ILoginForm from '../models/dto/ilogin-form'
import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'
import ApiService from '../services/api-service'

const useLogin = () => {
    const { setTokens } = useAuthentication()
    const navigate = useNavigate()

    return async (loginForm: ILoginForm) => {
        const authenticationResponse = await ApiService.Login(loginForm)
        setTokens(authenticationResponse)
        navigate('/', { replace: true })
    }
}

export default useLogin
