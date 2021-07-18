import React, { useState } from 'react'
import { Scroller, Button } from 'forge-core'
import { DELETE_KEY, LIST_KEYS } from './queries'
import { Box, Markdown, Text } from 'grommet'
import { License } from 'grommet-icons'
import moment from 'moment'
import { extendConnection } from '../../utils/graphql'
import { useMutation, useQuery } from 'react-apollo'
import { Confirm } from '../utils/Confirm'

function NoKeys() {
  return (
    <Box fill align='center' justify='center'>
      <Markdown>No public keys uploaded yet, run `plural crypto setup-keys` to upload one</Markdown>
    </Box>
  )
}


function Key({publicKey}) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, {loading}] = useMutation(DELETE_KEY, {
    variables: {id: publicKey.id},
    refetchQueries: [{query: LIST_KEYS}],
    onCompleted: () => setConfirm(false)
  })

  return (
    <>
    <Box border={{side: 'bottom', color: 'light-3'}} pad='small' direction='row' 
         align='center' gap='small'>
      <Box flex={false} width='50px' align='center' justify='center'>
        <License size='25px' />
      </Box>
      <Box fill='horizontal' gap='2px'>
        <Text size='small' weight={500}>{publicKey.name}</Text>
        <Text size='small'><code>{publicKey.digest.toLowerCase()}</code></Text>
        <Text size='small'>added on {moment(publicKey.insertedAt).format('lll')}</Text>
      </Box>
      <Box flex={false}>
        <Button label='delete' background='red-light' onClick={() => setConfirm(true)} /> 
      </Box>
    </Box>
    {confirm && (
      <Confirm
        description='Please ensure the key is no longer being used for repo encryption first'
        label='Delete'
        submit={mutation}
        loading={loading}
        cancel={() => setConfirm(false)} />
    )}
    </>
  )
} 

export function Keys() {
  const {data, fetchMore} = useQuery(LIST_KEYS)
  if (!data) return null

  const {edges, pageInfo} = data.publicKeys
  return (
    <Scroller
      id='webhooks'
      edges={edges}
      emptyState={<NoKeys />}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}) => (<Key key={node.id} publicKey={node} />)}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {publicKeys}}) => extendConnection(prev, publicKeys, 'publicKeys')
        })
      } />
  )
}