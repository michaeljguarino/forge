import { CheckIcon } from 'pluralsh-design-system'

import { Box, Text } from 'grommet'

import { LoopingLogo } from '../utils/AnimatedLogo'
import { PulsyDiv } from '../utils/animations'

const SIZE = '25px'

function StatusContainer({
  children, background, base, size,
}: any) {
  return (
    <Box
      flex={false}
      width={size || SIZE}
      height={size || SIZE}
      background={background}
      round="full"
      align="center"
      justify="center"
      as={base}
    >
      {children}
    </Box>
  )
}

function UnreadyStatus() {
  return (
    <StatusContainer
      background="progress"
      base={PulsyDiv}
    />
  )
}

function ReadyStatus() {
  return (
    <StatusContainer background="success">
      <CheckIcon size={15} />
    </StatusContainer>
  )
}

export function Status({ name, state }: any) {
  return (
    <Box
      background="card"
      round="xsmall"
      direction="row"
      fill="horizontal"
      align="center"
      pad="small"
    >
      <Box fill="horizontal">
        <Text
          size="small"
          weight={500}
        >{name}
        </Text>
      </Box>
      {state && <ReadyStatus />}
      {!state && <UnreadyStatus />}
    </Box>
  )
}

export function ShellStatus({ shell: { status } }: any) {
  if (!status) return <LoopingLogo />

  return (
    <Box
      background="background"
      fill
      align="center"
      justify="center"
    >
      <Box
        width="40%"
        gap="xsmall"
      >
        <Status
          name="Initialized"
          state={status.initialized}
        />
        <Status
          name="Pod Scheduled"
          state={status.podScheduled}
        />
        <Status
          name="Containers Ready"
          state={status.containersReady}
        />
        <Status
          name="Ready"
          state={status.ready}
        />
        <Text
          size="small"
          color="dark-3"
        >Give us a minute as your shell instance is provisioning
        </Text>
      </Box>
    </Box>
  )
}
