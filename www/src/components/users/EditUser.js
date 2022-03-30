import React, { useContext, useState, useEffect, useCallback } from 'react'
import { Box, Text } from 'grommet'
import { useFilePicker } from 'react-sage'
import { Button, InputCollection, ResponsiveInput, Select, User, Installed,
         PublicKeys, Credentials, Password, Logout, Fingerprint } from 'forge-core'
import { useMutation, useQuery } from 'react-apollo'
import { Transaction } from 'grommet-icons'
import { OAUTH_URLS, UPDATE_USER } from './queries'
import Avatar from './Avatar'
import { StatusCritical, Checkmark } from 'grommet-icons'
import Installations from '../repos/Installations'
import { CurrentUserContext } from '../login/CurrentUser'
import { Tokens } from './Tokens'
import { useHistory, useParams } from 'react-router'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { SIDEBAR_WIDTH } from '../constants'
import { Keys } from './Keys'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { LoginMethod } from './types'
import { wipeToken, getPreviousUserData, setToken } from '../../helpers/authentication'
import { EabCredentials } from './EabCredentials'
import { SectionChoice } from '../utils/SectionChoice'
import { Provider } from '../repos/misc'
import { Attribute, Attributes } from '../integrations/Webhook'
import { OauthEnabler } from './OauthEnabler'
import { host } from '../../helpers/hostname'

export const EditContext = React.createContext({})

function EditAvatar({me, noClick=false}) {
  const {files, onClick, HiddenFileInput} = useFilePicker({})
  const [mutation] = useMutation(UPDATE_USER)
  useEffect(() => {
    if (files.length > 0) {
      mutation({variables: {attributes: {avatar: files[0]}}})
    }
  }, [files])

  return (
    <>
      <Avatar user={me} size='50px' onClick={noClick ? null : onClick} />
      <HiddenFileInput accept='.jpg, .jpeg, .png' multiple={false} />
    </>
  )
}

export function EditSelect({name, edit, icon, base}) {
  const {editing} = useParams()
  let hist = useHistory()

  return (
    <SectionChoice
      name={name}
      label={name}
      icon={icon}
      onClick={edit === editing ? null : () => hist.push(`${base || '/me/edit/'}${edit}`)}
      selected={editing === edit} />
  )
}

export function EditHeader({text}) {
  return (
    <Box fill='horizontal' direction='row' justify='center' margin={{bottom: 'small'}}>
      <Text size='small' weight={500}>{text}</Text>
    </Box>
  )
}

export function EditContent({edit, name, children}) {
  const {editing} = useParams()
  if (editing !== edit) return null

  return (
    <SectionContentContainer header={name}>
      {children}
    </SectionContentContainer>
  )
}

function passwordValid(password, confirm) {
  if (password === '') return {disabled: true, reason: 'please enter a password'}
  if (password !== confirm) return {disabled: true, reason: 'passwords must match'}
  if (password.length < 12) return {disabled: true, reason: 'passwords must be more than 12 characters'}
  return {disabled: false, reason: 'passwords match!'}
}

export default function EditUser() {
  const me = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: me.name, email: me.email, loginMethod: me.loginMethod})
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const {editing} = useParams()
  const mergedAttributes = password && password.length > 0 ? {...attributes, password} : attributes
  const [mutation, {loading}] = useMutation(UPDATE_USER, {variables: {attributes: mergedAttributes}})
  const {disabled, reason} = passwordValid(password, confirm)
  const {data} = useQuery(OAUTH_URLS, {variables: {host: host()}})
  const color = disabled ? 'status-error' : 'status-ok'

  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/me/edit`, text: 'me'}, {url: `/me/edit/${editing}`, text: editing}])
  }, [setBreadcrumbs, editing])

  const logout = useCallback(() => {
    wipeToken()
    window.location = '/'
  }, [])

  const previousUserData = getPreviousUserData()

  function handlePreviousUserClick() {
    setToken(previousUserData.jwt)
    window.location.reload()
  }

  return (
    <Box fill>
      <Box fill direction='row'>
        <Box flex={false} direction="column" background='backgroundColor' gap='xsmall' width={SIDEBAR_WIDTH}
             pad='small'>
          <Box flex={false} direction='row' gap='small' align='center' margin={{bottom: 'xsmall'}}>
            <EditAvatar me={me} />
            <Box fill='horizontal'>
              <Text size='small' weight='bold' truncate>{attributes.name}</Text>
              <Text size='small' truncate>{attributes.email}</Text>
            </Box>
          </Box>
          <EditSelect edit='user' name='User Attributes' icon={<User size='14px' />} />
          <EditSelect edit='pwd' name='Password' icon={<Password size='14px' />} />
          <EditSelect edit='installations' name='Installations' icon={<Installed size='14px' />} />
          <EditSelect edit='tokens' name='Access Tokens' icon={<Fingerprint size='14px' />} />
          <EditSelect edit='keys' name='Public Keys' icon={<PublicKeys size='14px' />} />
          <EditSelect edit='credentials' name='Eab Credentials' icon={<Credentials size='14px' />} />
          <SectionChoice
            label='Logout'
            icon={<Logout size='14px' />}
            onClick={logout} />
          <Box flex="grow" />
          {previousUserData && previousUserData.me.id !== me.id && (
            <Box direction='row' gap='small' align='center' margin={{bottom: 'xsmall'}} overflow='hidden' style={{ cursor: 'pointer'}} onClick={handlePreviousUserClick}>
              <Transaction size="small" />
              <Box flex={false} direction='row' gap='small' align='center' margin={{bottom: 'xsmall'}}>
                <EditAvatar me={previousUserData.me} noClick />
                <Box fill='horizontal'>
                  <Text size='small' weight='bold' truncate>{previousUserData.me.name}</Text>
                  <Text size='small' truncate>{previousUserData.me.email}</Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        <Box fill>
          <EditContent edit='user' name='User Attributes'>
            <Box pad='small' gap='small'>
              <InputCollection>
                <ResponsiveInput
                  value={attributes.name}
                  label='name'
                  onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
                <ResponsiveInput
                  value={attributes.email}
                  label='email'
                  onChange={({target: {value}}) => setAttributes({...attributes, email: value})} />
              </InputCollection>
              <Attributes width='50%'>
                {me.provider && (
                  <Attribute name='Provider'>
                    <Provider provider={me.provider} width={40} />
                  </Attribute>
                )}

                <Attribute name='Login Method'>
                  <Select
                    name='login-method'
                    value={{value: attributes.loginMethod, label: attributes.loginMethod.toLocaleLowerCase()}}
                    onChange={({value}) => setAttributes({...attributes, loginMethod: value})}
                    options={Object.values(LoginMethod).map((m) => ({
                      label: m.toLocaleLowerCase(),
                      value: m
                    }))} />
                </Attribute>
                {data && data.oauthUrls.map((url, i) => (
                  <OauthEnabler url={url} me={me} key={url + i} />
                ))}
              </Attributes>
              <SectionPortal>
                <Button loading={loading} onClick={mutation} flex={false} label='Update' />
              </SectionPortal>
            </Box>
          </EditContent>
          <EditContent edit='pwd' name='Password'>
            <Box pad='small'>
              <form autocomplete="off" onSubmit={disabled ? null : mutation}>
                <InputCollection>
                  <ResponsiveInput
                    value={password}
                    label='password'
                    placeholder='a long password'
                    type='password'
                    onChange={({target: {value}}) => setPassword(value)} />
                  <ResponsiveInput
                    value={confirm}
                    label='confirm'
                    placeholder='confirm your password'
                    type='password'
                    onChange={({target: {value}}) => setConfirm(value)} />
                </InputCollection>
              </form>
              <SectionPortal>
                <Box flex={false} gap='small' direction='row' align='center'>
                  {disabled ?
                    <StatusCritical size='15px' color={color} /> :
                    <Checkmark size='15px' color={color} />}
                  <Text size='small' color={color}>
                    {reason}
                  </Text>
                  <Button
                    disabled={disabled}
                    loading={loading}
                    onClick={mutation}
                    label='Update' />
                </Box>
              </SectionPortal>
            </Box>
          </EditContent>
          <EditContent edit='installations' name='Installations'>
            <Installations edit />
          </EditContent>
          <EditContent edit='tokens' name='Tokens'>
            <Tokens />
          </EditContent>
          <EditContent edit='keys' name='Public Keys'>
            <Keys />
          </EditContent>
          <EditContent edit='credentials' name='Eab Credentials'>
            <EabCredentials />
          </EditContent>
        </Box>
      </Box>
    </Box>
  )
}
