import { Blank, Github, Google } from 'grommet-icons'

export const obscure = token => token.substring(0, 9) + 'x'.repeat(15)

const CHALLENGE_KEY = 'oauth-challenge'
const DEVICE_TOKEN_KEY = 'device-token'

export const saveChallenge = challenge => localStorage.setItem(CHALLENGE_KEY, challenge)
export const getChallenge = () => localStorage.getItem(CHALLENGE_KEY)
export const wipeChallenge = () => localStorage.removeItem(CHALLENGE_KEY)

export const saveDeviceToken = deviceToken => localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken)
export const getDeviceToken = () => localStorage.getItem(DEVICE_TOKEN_KEY)
export const wipeDeviceToken = () => localStorage.removeItem(DEVICE_TOKEN_KEY)

function Gitlab(props) {
  return (
    <Blank {...props}>
      <svg
        viewBox="0 -10 256 256"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
      >
        <g>
          <path
            d="M128.07485,236.074667 L128.07485,236.074667 L175.17885,91.1043048 L80.9708495,91.1043048 L128.07485,236.074667 L128.07485,236.074667 Z"
            fill="#E24329"
          />
          <path
            d="M128.07485,236.074423 L80.9708495,91.104061 L14.9557638,91.104061 L128.07485,236.074423 L128.07485,236.074423 Z"
            fill="#FC6D26"
          />
          <path
            d="M14.9558857,91.1044267 L14.9558857,91.1044267 L0.641828571,135.159589 C-0.663771429,139.17757 0.766171429,143.57955 4.18438095,146.06275 L128.074971,236.074789 L14.9558857,91.1044267 L14.9558857,91.1044267 Z"
            fill="#FCA326"
          />
          <path
            d="M14.9558857,91.1045486 L80.9709714,91.1045486 L52.6000762,3.79026286 C51.1408762,-0.703146667 44.7847619,-0.701927619 43.3255619,3.79026286 L14.9558857,91.1045486 L14.9558857,91.1045486 Z"
            fill="#E24329"
          />
          <path
            d="M128.07485,236.074423 L175.17885,91.104061 L241.193935,91.104061 L128.07485,236.074423 L128.07485,236.074423 Z"
            fill="#FC6D26"
          />
          <path
            d="M241.193935,91.1044267 L241.193935,91.1044267 L255.507992,135.159589 C256.813592,139.17757 255.38365,143.57955 251.96544,146.06275 L128.07485,236.074789 L241.193935,91.1044267 L241.193935,91.1044267 Z"
            fill="#FCA326"
          />
          <path
            d="M241.193935,91.1045486 L175.17885,91.1045486 L203.549745,3.79026286 C205.008945,-0.703146667 211.365059,-0.701927619 212.824259,3.79026286 L241.193935,91.1045486 L241.193935,91.1045486 Z"
            fill="#E24329"
          />
        </g>
      </svg>
    </Blank>
  )
}

export const METHOD_ICONS = {
  GOOGLE: Google,
  GITHUB: Github,
  GITLAB: Gitlab,
}

