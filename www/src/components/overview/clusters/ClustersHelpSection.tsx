import {
  Button,
  Card,
  DocumentIcon,
  Flex,
  LifePreserverIcon,
  SendMessageIcon,
} from '@pluralsh/design-system'
import { ReactElement } from 'react'
import ReactPlayer from 'react-player'
import { useIntercom } from 'react-use-intercom'
import styled from 'styled-components'

export default function ClustersHelpSection(): ReactElement {
  const { show } = useIntercom()

  return (
    <>
      <ReactPlayer
        url="https://www.youtube.com/watch?v=W8KCaiZRV3M"
        width="100%"
      />
      <ResourcesCard>
        <div className="header">Helpful resources</div>
        <Flex gap="medium">
          <ResourcesButton
            floating
            startIcon={<DocumentIcon />}
            forwardedAs="a"
            href="https://docs.plural.sh/getting-started/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </ResourcesButton>
          <ResourcesButton
            floating
            startIcon={<SendMessageIcon />}
            forwardedAs="a"
            href="mailto:sales@plural.sh"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact sales
          </ResourcesButton>
          <ResourcesButton
            flex={1}
            floating
            startIcon={<LifePreserverIcon />}
            onClick={() => show()}
          >
            Chat on Intercom
          </ResourcesButton>
        </Flex>
      </ResourcesCard>
    </>
  )
}

const ResourcesCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.xlarge,
  minWidth: 'max-content',
  '.header': {
    ...theme.partials.text.overline,
    color: theme.colors['text-xlight'],
  },
}))

const ResourcesButton = styled(Button)({
  flex: 1,
  minWidth: 'fit-content',
})
