import { Box, Drop, TextInput } from 'grommet'
import { CaretDownIcon, CheckIcon } from 'pluralsh-design-system'
import { useCallback, useRef, useState } from 'react'

function OrgOption({
  org,
  current,
  setOrg,
  render,
}) {
  const isCurrent = org.id === current.id

  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      hoverIndicator="tone-light"
      onClick={isCurrent ? () => {} : () => setOrg(org)}
    >
      {render(org)}
      {isCurrent && (
        <CheckIcon
          color="brand"
          size={12}
        />
      )}
    </Box>
  )
}

export function OrgInput({
  name, setName, org, orgs, setOrg, render,
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const doSetOrg = useCallback(org => {
    setOrg(org)
    setOpen(false)
  }, [setOrg, setOpen])

  return (
    <Box
      direction="row"
      align="center"
    >
      {org && (
        <>
          <Box
            ref={ref}
            flex={false}
            style={{ borderRightStyle: 'none' }}
            border
            height="40px"
            align="center"
            justify="center"
            pad={{ horizontal: 'small' }}
            hoverIndicator="card"
            background="sidebarHover"
            direction="row"
            gap="small"
            onClick={() => setOpen(true)}
          >
            {render(org)}
            <CaretDownIcon size={12} />
          </Box>
          {open && (
            <Drop
              target={ref.current as object}
              align={{ top: 'bottom' }}
              onClickOutside={close}
              onEsc={close}
            >
              <Box
                gap="none"
                border={{ side: 'between' }}
              >
                {orgs.map(o => (
                  <OrgOption
                    key={o.id}
                    org={o}
                    current={org}
                    setOrg={doSetOrg}
                    render={render}
                  />
                ))}
              </Box>
            </Drop>
          )}
        </>
      )}
      <TextInput
        value={name}
        onChange={({ target: { value } }) => setName(value)}
        placeholder="your-repository-name"
      />
    </Box>
  )
}
