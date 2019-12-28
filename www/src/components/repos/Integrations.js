import React, { useContext, useEffect, useState } from 'react'
import {useParams, useHistory} from 'react-router-dom'
import Carousel from '../utils/Carousel'
import { Box, Text, Anchor } from 'grommet'
import { INTEGRATIONS_Q } from './queries'
import { useQuery } from 'react-apollo'
import { BreadcrumbContext } from '../Chartmart'
import ScrollableContainer from '../utils/ScrollableContainer'
import Tags from './Tags'
import { chunk } from '../../utils/array'
import Scroller from '../utils/Scroller'
import HoveredBackground from '../utils/HoveredBackground'
import { FormPrevious, FormNextLink } from 'grommet-icons'

const ICON_SIZE = 50

function Integration({name, description, icon, tags, sourceUrl, width}) {
  const [hover, setHover] = useState(false)
  return (
    <Container pad='medium' width={width} hover={hover} setHover={setHover}>
      <Box direction='row' gap='medium'>
        <Box align='center' justify='center' width={`${ICON_SIZE}px`}>
          <img src={icon} alt={name} width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} />
        </Box>
        <Box gap='xsmall'>
          <Text style={{fontWeight: 500}} size='small'>{name}</Text>
          <Text color='dark-3' size='small'>{description}</Text>
          {tags && tags.length > 0 && (
            <Box direction='row' gap='xxsmall'>
              {tags.map(({tag}) => <Text size='xsmall' color='dark-3'>#{tag}</Text>)}
            </Box>
          )}
        </Box>
      </Box>
      {hover && sourceUrl && <SourceLink sourceUrl={sourceUrl} />}
    </Container>
  )
}

export function Container({pad, width, hover, setHover, children, ...rest}) {
  return (
    <Box
      width={width}
      pad={pad || 'medium'}
      round='xsmall'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={hover ? {color: 'focus'} : true}
      elevation={hover ? 'medium' : null}
      {...rest}>
    {children}
    </Box>
  )
}

function SourceLink({sourceUrl}) {
  return (
    <Box
      direction='row'
      justify='end'
      fill='horizontal'
      pad={{horizontal: 'small'}}
      animation={{type: 'slideUp', duration: 200, size: 'large'}}>
      <Anchor href={sourceUrl} color='focus' _target="blank">
        <Box
          direction='row'
          gap='xsmall'
          align='center'>
          <Text size='small' color='focus'>Source code</Text>
          <FormNextLink size='12px' />
        </Box>
        </Anchor>
    </Box>
  )
}

function IntegrationGrid({integrations: {edges, pageInfo}, fetchMore}) {
  return (
    <Scroller
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      edges={Array.from(chunk(edges, 3))}
      mapper={(chunk) => (
        <Box direction='row' gap='small' fill='horizontal'>
          {chunk.map(({node}) => <Integration {...node} width='30%' />)}
        </Box>
      )}
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {intCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const {edges, pageInfo} = fetchMoreResult.integrations
            return edges.length ? {
              ...prev,
              integrations: {
                ...prev.integrations,
                pageInfo,
                edges: [...prev.integrations.edges, ...edges]
              }
            } : prev
          }
        })
      }} />
  )
}

const WIDTH = 15

export function IntegrationPage() {
  const [tag, setTag] = useState(null)
  const {repositoryId} = useParams()
  const {loading, data, fetchMore} = useQuery(INTEGRATIONS_Q, {
    variables: {id: repositoryId, tag},
    fetchPolicy: "cache-and-network"
  })
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!data) return
    const {repository} = data

    setBreadcrumbs([
      {url: `/publishers/${repository.publisher.id}`, text: repository.publisher.name},
      {url: `/repositories/${repository.id}`, text: repository.name},
      {url: `/repositories/${repository.id}/integrations`, text: 'integrations'}
    ])
  }, [setBreadcrumbs, data])

  if (loading) return null

  const {tags, integrations, repository} = data

  return (
    <ScrollableContainer>
      <Box direction='row' height='100%'>
        <Box pad='small' width={`${WIDTH}%`} height='100%' border='right'>
          <Box>
            <Tags tags={tags} fetchMore={fetchMore} setTag={setTag} />
          </Box>
        </Box>
        <Box pad='small' margin={{left: 'medium'}} width={`${100 - WIDTH}%`} gap='small'>
          <Box pad={{vertical: 'small'}}>
          {tag ? <HoveredBackground>
                   <Box
                    accentable
                    style={{cursor: 'pointer'}}
                    align='center'
                    direction='row'
                    gap='xsmall'
                    onClick={() => setTag(null)}>
                     <FormPrevious size='20px' />
                     <Text style={{fontWeight: 500}}>#{tag}</Text>
                   </Box>
                 </HoveredBackground> :
                 <Text style={{fontWeight: 500}}>{repository.name}</Text>}
          </Box>
          <IntegrationGrid integrations={integrations} fetchMore={fetchMore} />
        </Box>
      </Box>
    </ScrollableContainer>
  )
}

export default function Integrations({integrations: {edges, pageInfo}, fetchMore, repository}) {
  let hist = useHistory()
  return (
    <Box pad='small'>
      <Box
        pad={{bottom: 'small'}}
        direction='row'
        fill='horizontal'
        justify='end'>
        <Anchor color="focus" onClick={() => hist.push(`/repositories/${repository.id}/integrations`)}>
          <Box direction='row' gap='xxsmall' align='center'>
            <Text size='small' color='focus'>
              view all
            </Text>
            <FormNextLink size='15px' color='focus' />
          </Box>
        </Anchor>
      </Box>
      <Carousel
        dots
        draggable={false}
        slidesPerPage={1}
        offset={12}
        edges={edges}
        mapper={({node}) => <Integration key={node.id} {...node} width='80%' />}
        fetchMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {intCursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.integrations
              return edges.length ? {
                ...prev,
                integrations: {
                  ...prev.integrations,
                  pageInfo,
                  edges: [...prev.integrations.edges, ...edges]
                }
              } : prev
            }
          })
        }} />
    </Box>
  )
}