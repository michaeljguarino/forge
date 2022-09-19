import { useQuery } from '@apollo/client'
import { Outlet, useParams } from 'react-router-dom'
import { Flex } from 'honorable'

import { GoBack } from 'components/utils/GoBack'

import { ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer } from 'components/layout/ResponsiveLayout'

import { LoopingLogo } from '../utils/AnimatedLogo'

import TopBar from '../layout/TopBar'

import { STACK_QUERY } from './queries'

export default function Stack() {
  const { name } = useParams()
  const { data } = useQuery(STACK_QUERY, { variables: { name, provider: 'AWS' } })
  // const tabStateRef = useRef()

  if (!data) {
    return (
      <Flex
        paddingTop={388}
        marginLeft={-80}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const { stack } = data

  return (
    <Flex
      height="100%"
      maxHeight="100%"
      direction="column"
      overflowY="hidden"
    >
      <TopBar>
        <GoBack
          text="Back to marketplace"
          link="/marketplace"
        />
      </TopBar>
      <Flex
        flexGrow={1}
        height={0}
        overflowX="hidden"
        paddingLeft="medium"
        paddingRight="medium"
      >
        <ResponsiveLayoutSidenavContainer>
          {/* <RepositorySideNav tabStateRef={tabStateRef} /> */}
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <Outlet context={{ stack }} />
        {/* <TabPanel
          as={
            <ResponsiveLayoutContentContainer />
          }
          stateRef={tabStateRef}
        >
          <Outlet />
        </TabPanel> */}
        <ResponsiveLayoutSidecarContainer>
          {/* <RepositorySideCar /> */}
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}
