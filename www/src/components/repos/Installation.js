import React, {useState} from 'react'
import {Box, Text, CheckBox} from 'grommet'
import {Alert, Close} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import Button from '../utils/Button'
import {INSTALL_REPO, UPDATE_INSTALLATION, REPO_Q} from './queries'
import Editor from '../utils/Editor'
import Pill from '../utils/Pill'
import yaml from 'js-yaml'
import Highlight from 'react-highlight.js'
import Expander from '../utils/Expander'
import Integrations from './Integrations'

function update(cache, repositoryId, installation) {
  const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId} })
  cache.writeQuery({query: REPO_Q,
    variables: {repositoryId},
    data: {...prev, repository: { ...prev.repository, installation: installation}}
  })
}

function EditInstallation({installation, repository, onUpdate, open}) {
  const [ctx, setCtx] = useState(yaml.safeDump(installation.context || {}, null, 2))
  const [autoUpgrade, setAutoUpgrade] = useState(installation.autoUpgrade)
  const [notif, setNotif] = useState(false)
  const [mutation, {loading, errors}] = useMutation(UPDATE_INSTALLATION, {
    variables: {id: installation.id, attributes: {context: ctx, autoUpgrade}},
    update: (cache, {data: {updateInstallation}}) => {
      const func = onUpdate || update
      func(cache, repository.id, updateInstallation)
      setNotif(true)
    }
  })

  return (
    <>
    {notif && (
      <Pill background='status-ok' onClose={() => {console.log('wtf'); setNotif(false)}}>
        <Box direction='row' align='center' gap='small'>
          <Text>Configuration saved</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setNotif(false)} />
        </Box>
      </Pill>
    )}
    <Expander text='Configuration' open={open}>
      <Box gap='small' fill='horizontal' pad='small'>
        <Box>
          <Editor lang='yaml' value={ctx} onChange={setCtx} />
        </Box>
        {errors && (
          <Box direction='row' gap='small'>
            <Alert size='15px' color='notif' />
            <Text size='small' color='notif'>Must be in json format</Text>
          </Box>)}
        <Box direction='row' justify='end'>
          <CheckBox
            toggle
            label='Auto Upgrade'
            checked={autoUpgrade}
            onChange={(e) => setAutoUpgrade(e.target.checked)}
          />
        </Box>
        <Box pad='small' direction='row' justify='end'>
          <Button
            pad={{horizontal: 'medium', vertical: 'xsmall'}}
            loading={loading}
            label='Save'
            onClick={mutation}
            round='xsmall' />
        </Box>
      </Box>
    </Expander>
    </>
  )
}


function Installation({repository, onUpdate, noHelm, open, integrations, pageInfo, fetchMore}) {
  const [mutation] = useMutation(INSTALL_REPO, {
    variables: {repositoryId: repository.id},
    update: (cache, { data: { createInstallation } }) => {
      const prev = cache.readQuery({ query: REPO_Q, variables: {repositoryId: repository.id} })
      cache.writeQuery({query: REPO_Q,
        variables: {repositoryId: repository.id},
        data: {...prev, repository: { ...prev.repository, installation: createInstallation}}
      })
    }
  })

  return (
    <Box elevation='small' gap='small'>
      {repository.installation ?
        <Box>
          {!noHelm && (
            <Box gap='small' pad='small' border='bottom'>
              <Text size='small' style={{fontWeight: 500}}>Installation</Text>
              <Box>
                <Highlight language='bash'>
                  {`chartmart build --only ${repository.name}
chartmart deploy ${repository.name}`}
                </Highlight>
              </Box>
            </Box>
          )}
          <EditInstallation
            installation={repository.installation}
            repository={repository}
            open={open}
            onUpdate={onUpdate} />
          {integrations && integrations.edges.length > 0 && (
            <Expander text='Integrations'>
              <Integrations integrations={integrations} fetchMore={fetchMore} repository={repository} />
            </Expander>
          )}
        </Box> :
        <Box pad='medium' gap='small'>
          <Text size='small'>This repository is free to use</Text>
          <Button label='Install Repository' round='xsmall' onClick={mutation} />
        </Box>
      }
    </Box>
  )
}

export default Installation