import React, { useEffect, useState } from 'react'
import { useUserContext } from '../hooks/user-context'
import IUser from '../models/iuser'
import useAuthenticatedApi from '../hooks/useAuthenticatedApi'
import useLogout from '../hooks/use-logout'
import ValidationErrors from './authentication/forms/validation-errors'
import HttpError from '../models/http-error'
import SignUpValidator from '../utils/sign-up-validator'

const Settings = () => {
    const validator = new SignUpValidator()
    const user = useUserContext()
    const [following, setFollowing] = useState<IUser[]>([])

    const [apiKeyField, setApiKeyField] = useState('')
    const [apiKeyIsValid, setApiKeyIsValid] = useState<boolean>()
    const [apiKeyErrors, setApiKeyErrors] = useState<string[]>([])

    const [displayNameField, setDisplayNameField] = useState(user.displayName)
    const [displayNameErrors, setDisplayNameErrors] = useState<string[]>([])
    const [displayNameSuccess, setDisplayNameSuccess] = useState(false)

    const [profilePictureErrors, setProfilePictureErrors] = useState<string[]>([])
    const [profilePictureSuccess, setProfilePictureSuccess] = useState(false)

    const logout = useLogout()
    const { sendFollowRequest, getFollowing, getApiKeyIsValid, setApiKey, setDisplayName, setProfilePicture } = useAuthenticatedApi()

    useEffect(() => {
        getFollowing().then(response => setFollowing(response))
        getApiKeyIsValid().then(response => setApiKeyIsValid(response))
    }, [])

    const onUnfollowClick = async (discordUsername: string) => {
        await sendFollowRequest(discordUsername)
        setFollowing(following.filter(value => value.discordUsername !== discordUsername))
    }

    const onDisplayNameSubmit = async () => {
        setDisplayNameErrors([])
        setDisplayNameSuccess(false)
        if (displayNameField.trim() === user.displayName) return

        const validationErrors = validator.validateDisplayName(displayNameField)
        if (validationErrors.length !== 0) {
            setDisplayNameErrors(validationErrors)
            return
        }

        try {
            await setDisplayName(displayNameField)
            setDisplayNameErrors([])
            setDisplayNameSuccess(true)
        }
        catch (e) {
            if (e instanceof HttpError) {
                setDisplayNameErrors([ e.response?.error ?? 'error' ])
                return
            }

            throw e
        }
    }

    const onApiKeySubmit = async () => {
        if (apiKeyField === '') {
            setApiKeyErrors(['Api key is required'])
            return
        }

        try {
            await setApiKey(apiKeyField)
            setApiKeyIsValid(true)
            setApiKeyField('')
        }
        catch (e) {
            if (e instanceof HttpError) {
                if (e.response?.errors) {
                    setApiKeyErrors([ ...e.response.errors['apiKey'] ])
                }
                else {
                    setApiKeyErrors([ e.response!.error! ])
                }

                return
            }

            throw e
        }
    }

    const onRefreshProfilePictureClick = async () => {
        try {
            await setProfilePicture()
            setProfilePictureSuccess(true)
        }
        catch (e) {
            if (e instanceof HttpError) {
                setProfilePictureErrors([ e.response.error ?? '' ])
            }

            setProfilePictureSuccess(false)
        }
    }

    return (
        <div className='settings-container'>
            <section>
                <h2>Profile</h2>
                <div className='profile-info'>
                    <img
                        className='profile-picture'
                        src={user.profilePicture}
                        alt={user.displayName + 's profile picture'} />
                    <div>
                        <label htmlFor='display-name'>Display Name</label>
                        <input
                            type='text'
                            name='display-name'
                            value={displayNameField}
                            onChange={e => setDisplayNameField(e.target.value)} />
                        <ValidationErrors errors={displayNameErrors} />
                        <p style={{ display: displayNameSuccess ? 'block' : 'none', color: 'lightgreen' }}>
                            Display name successfully updated
                        </p>

                        <div className='action-buttons'>
                            <button className='btn-action' onClick={onRefreshProfilePictureClick}>Refresh profile picture</button>
                            <button className='btn-action' onClick={onDisplayNameSubmit}>Submit</button>
                        </div>
                        <ValidationErrors errors={profilePictureErrors} />
                        <p style={{ display: profilePictureSuccess ? 'block' : 'none', color: 'lightgreen' }}>
                            Refreshed discord profile picture
                        </p>
                    </div>
                </div>
            </section>
            <section>
                <h2>API Key</h2>
                <div>
                    <p style={{ display: apiKeyIsValid ? 'block' : 'none', color: 'lightgreen' }}>Your Api key is valid</p>
                    <ValidationErrors errors={apiKeyErrors} />
                    <textarea
                        onChange={e => setApiKeyField(e.target.value)}
                        disabled={apiKeyIsValid === undefined || apiKeyIsValid} >
                    </textarea>
                    <button
                        className='btn-action'
                        disabled={apiKeyIsValid === undefined || apiKeyIsValid}
                        onClick={() => onApiKeySubmit()}
                    >
                        Submit
                    </button>
                </div>
            </section>
            <section className='following'>
                <h2>Following</h2>
                {
                    following.map((value, index) => (
                        <div className='leaderboard-item' key={index}>
                            <img src={value.profilePicture} alt={value.displayName + 's profile picture'}/>
                            <p>{ value.displayName }</p>
                            <button onClick={() => onUnfollowClick(value.discordUsername)} className='btn-danger'>Unfollow</button>
                        </div>
                    ))
                }
            </section>
            <section>
                <h2>Authentication</h2>
                <span className='authentication-buttons'>
                    <button className='btn-danger' onClick={logout}>Logout</button>
                    <button className='btn-danger'>Logout All</button>
                </span>
            </section>
        </div>
    )
}

export default Settings
