import useAuthentication from './authentication-context'
import { useNavigate } from 'react-router-dom'

const useLogout = () => {
    const { setTokens } = useAuthentication()
    const navigate = useNavigate()

    return () => {
        setTokens()
        navigate('/login', { replace: true })
    }
}

export default useLogout
