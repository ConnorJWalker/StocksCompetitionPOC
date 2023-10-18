import React, { useEffect, useState } from 'react'
import { useUserContext } from '../hooks/user-context'
import { useNavigate, useParams } from 'react-router-dom'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'

const AdminSettings = () => {
    const [displayName, setNewDisplayName] = useState('')
    const user = useUserContext()

    const { getUserInfo, setDisplayName } = useAuthenticatedApi()

    const { discordUsername } = useParams()
    const navigate = useNavigate()

    if (!user.isAdmin) navigate('/settings')

    useEffect(() => {
        getUserInfo(discordUsername!).then(response => {
            setNewDisplayName(response.accountValue.value.user.displayName)
        })
    }, [])

    return (
        <div>
            <input type="text" value={displayName} onChange={e => setNewDisplayName(e.target.value)} />
            <button
                className='btn-action'
                onClick={() => setDisplayName(displayName, discordUsername)
                    .then(() => alert('done'))
                    .catch(err => alert(err))}>

                Submit
            </button>
        </div>
    )
}

export default AdminSettings
