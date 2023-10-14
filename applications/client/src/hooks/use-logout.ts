import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'
import useApi from './useApi'

const useLogout = () => {
    const { setTokens, accessToken, refreshToken } = useAuthentication()
    const { sendLogout } = useApi()

    const navigate = useNavigate()

    return async (logoutAll: boolean = false) => {
        const response = await sendLogout({ accessToken: accessToken!, refreshToken: refreshToken! }, logoutAll)
        if (response.ok || response.statusCode === 401) {
            setTokens()
            return navigate('/login', { replace: true })
        }

        console.error('failed to log out')
    }
}

export default useLogout
