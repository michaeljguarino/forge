import { useMemo, useRef, useState } from 'react'
import { A, Div, Flex, P } from 'honorable'

import {
  Button,
  Callout,
  Code,
  Codeline,
  Tab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

const TAB_MAC = 'TAB_MAC'
const TAB_CURL = 'TAB_CURL'
const TAB_DOCKER = 'TAB_DOCKER'
const TAB_EC2 = 'TAB_EC2'

const DIRECTORY = [
  {
    key: TAB_MAC,
    label: 'Mac',
    command: 'brew install pluralsh/plural/plural',
  },
  {
    key: TAB_CURL,
    label: 'Curl',
    command:
      "VSN=$(curl --silent -qI https://github.com/pluralsh/plural-cli/releases/latest | awk -F '/' '/^location/ {print  substr($NF, 1, length($NF)-1)}')\n" +
      "curl -L -o plural.tgz 'https://github.com/pluralsh/plural-cli/releases/download/${VSN}/plural-cli_${VSN#v}_Darwin_arm64.tar.gz'\n" + // eslint-disable-line no-template-curly-in-string
      'tar -xvf plural.tgz\n' +
      'chmod +x plural\n' +
      'mv plural /usr/local/bin/plural',
  },
  //   {
  //     key: TAB_DOCKER,
  //     label: 'Docker',
  //     command: `docker run -it --volume $HOME/.aws:/home/plural/aws \\
  // \t--volume $HOME/.plural:/home/plural/.plural \\
  // \t--volume $HOME/.ssh:/home/plural/.ssh \\
  // \t--volume $HOME/path-to-installation-repo:/home/plural/workspace \\ # optional if you want to manage git via a volume
  // \tgcr.io/pluralsh/plural-cli:0.1.1-cloud zsh`,
  //   },
]

function CliInstallation({ onBack, onNext }) {
  return (
    <>
      <CliInstallationBaseInfo />
      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        paddingTop="large"
        marginTop="xlarge"
      >
        <Button
          secondary
          onClick={onBack}
        >
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </Flex>
    </>
  )
}
export function CliInstallationBaseInfo() {
  const theme = useTheme()
  const [tab, setTab] = useState(TAB_MAC)
  const tabStateRef = useRef<any>(null)
  const currentTab = useMemo(() => DIRECTORY.find((t) => t.key === tab), [tab])

  return (
    <>
      <Flex>
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey: tab,
            onSelectionChange: (key) => setTab(`${key}`),
          }}
          justifyContent="stretch"
          width="100%"
        >
          {DIRECTORY.map(({ key, label }) => (
            <Tab
              key={key}
              flexGrow={1}
              justifyContent="center"
              {...{ '& div': { justifyContent: 'center' } }}
            >
              {label}
            </Tab>
          ))}
        </TabList>
      </Flex>
      <TabPanel stateRef={tabStateRef}>
        <>
          {tab === TAB_MAC &&
            'Start by running this command in your local terminal:'}
          {tab === TAB_CURL && (
            <Flex
              direction="column"
              gap="small"
            >
              <Callout
                size="compact"
                css={theme.partials.text.body2Bold}
              >
                <A
                  // relative so it's displayed above visually hidden title element
                  position="relative"
                  href="https://helm.sh/docs/intro/install/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Helm
                </A>
                ,{' '}
                <A
                  inline
                  href="https://developer.hashicorp.com/terraform/install"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terraform
                </A>{' '}
                and{' '}
                <A
                  inline
                  href="https://kubernetes.io/docs/tasks/tools/#kubectl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kubectl
                </A>{' '}
                are dependencies of the Plural CLI.
              </Callout>
              <span>
                After downloading the dependencies above, you can download the
                binaries attached to our{' '}
                <A
                  inline
                  href="https://github.com/pluralsh/plural-cli/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub releases
                </A>
                .
              </span>
              For example, you can download the latest version for Darwin arm64
              via:
            </Flex>
          )}
          {tab === TAB_DOCKER && (
            <>
              We offer a docker image with the plural cli installed along with
              all cli dependencies: Terraform, Helm, Kubectl, and all the major
              cloud CLIs: gcr.io/pluralsh/plural-cli-cloud:0.6.8 We also provide
              a decent configuration of zsh in it, so you can drive the entire
              plural workflow in an interactive session. The best strategy is
              probably to mount the config dir of the cloud provider you're
              using, like (~/.aws), in the docker run command:
            </>
          )}
        </>

        {tab !== TAB_EC2 && (
          <>
            <Div marginTop="small">
              {tab === TAB_MAC ? (
                <Codeline css={{ background: theme.colors['fill-two'] }}>
                  {currentTab?.command}
                </Codeline>
              ) : (
                <Code
                  css={{ background: theme.colors['fill-two'] }}
                  onSelectedTabChange={() => {}}
                >
                  {currentTab?.command || ''}
                </Code>
              )}
            </Div>
            <P marginTop="small">
              {tab === TAB_MAC && (
                <>
                  The brew tap will install plural, alongside terraform, helm
                  and kubectl for you. If you've already installed any of those
                  dependencies, you can add{' '}
                  <strong>
                    <code>--without-helm</code>
                  </strong>
                  ,{' '}
                  <strong>
                    <code>--without-terraform</code>
                  </strong>
                  , or{' '}
                  <strong>
                    <code>--without-kubectl</code>
                  </strong>
                  .
                </>
              )}
              {tab === TAB_DOCKER && (
                <>
                  Once you're in the container's zsh, you'll want to clone the
                  repository you'll use for your installations state there, or
                  alternatively you can clone it outside your container and
                  mount another volume pointing to it.
                </>
              )}
            </P>
          </>
        )}
      </TabPanel>
    </>
  )
}

export default CliInstallation
