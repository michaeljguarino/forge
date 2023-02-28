import {
  A,
  Code,
  Div,
  P,
} from 'honorable'
import { TipCarousel } from '@pluralsh/design-system'

function TipCode(props) {
  return (
    <Code
      backgroundColor="fill-two"
      font-style="normal"
      paddingTop="0.1em"
      paddingBottom="0.2em"
      paddingHorizontal="0.5em"
      marginHorizontal="0.1em"
      borderRadius="normal"
      border="1px solid border-fill-two"
      {...props}
    />
  )
}

function OnboardingTips({ autoAdvanceTime = 10000, ...props }: any) {
  return (
    <Div {...props}>
      <TipCarousel
        autoAdvanceTime={autoAdvanceTime}
        paddingHorizontal="xlarge"
      >
        {[
          <P
            margin={0}
            key="sa"
          >
            You can use service accounts to have an entire team manage a set of installations for one of your plural clusters. Learn more{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/advanced-topics/identity-and-access-management/identity-and-installations/service-accounts"
            >
              here
            </A>.
          </P>,
          <P
            margin={0}
            key="oidc"
          >
            Plural can be an identity provider for most web facing applications using OpenId Connect. Learn more{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/basic-setup-and-deployment/openid-connect"
            >
              here
            </A>.
          </P>,
          <P
            margin={0}
            key="watch"
          >
            You can use <TipCode>plural watch &lt;app&gt;</TipCode> to track the status of an application&nbsp;being&nbsp;deployed.
          </P>,
          <P
            margin={0}
            key="encrypt"
          >
            If you want to share an encrypted plural git repo, you can use age encryption to securely share encryption keys with a group of users, following the guides{' '}
            <A
              inline
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.plural.sh/advanced-topics/identity-and-access-management/identity-and-installations/sharing-existing-repos"
            >
              here
            </A>.
          </P>,
          <P
            margin={0}
            key="sync"
          >
            You can use <TipCode>plural shell sync</TipCode> to transfer your state from the Plural Cloud Shell to the command line.
          </P>,
          <P
            margin={0}
            key="create"
          >
            You can use <TipCode>plural create</TipCode> to try out adding an application to the Plural catalog.
          </P>,
        ]}
      </TipCarousel>
    </Div>
  )
}

export default OnboardingTips
