import { Octokit } from '@octokit/core'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { LABEL_REQUEST, LABEL_ROADMAP } from './constants'

const filterOutPullRequests = () => true
// const filterOutPullRequests = data => !data.pull_request // TODO use this one before shipping

function useRoadmapData() {
  const [pluralIssues, setPluralIssues] = useState<any[]>([])
  const [pluralArtifactsIssues, setPluralArtifactsIssues] = useState<any[]>([])
  const [hasMorePlural, setHasMorePlura] = useState(false)
  const [hasMorePluralArtifacts, setHasMorePluraArtifacts] = useState(false)

  const [page, setPage] = useState(0)
  const ockokit = useMemo(() => new Octokit(), [])

  const getPluralIssues = useCallback(async () => {
    const response = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_ROADMAP},${LABEL_REQUEST}&page=${page}&per_page=100`, {
      owner: 'pluralsh',
      repo: 'plural',
    })

    setPluralIssues(x => [...x, ...response.data.filter(filterOutPullRequests)])
    setHasMorePlura(response.data.length >= 100)
  }, [ockokit, page])

  const getPluralArtifactsIssues = useCallback(async () => {
    const response = await ockokit.request(`GET /repos/{owner}/{repo}/issues?labels=${LABEL_ROADMAP},${LABEL_REQUEST}&page=${page}&per_page=100`, {
      owner: 'pluralsh',
      repo: 'plural-artifacts',
    })

    setPluralArtifactsIssues(x => [...x, ...response.data.filter(filterOutPullRequests)])
    setHasMorePluraArtifacts(response.data.length >= 100)
  }, [ockokit, page])

  useEffect(() => {
    getPluralIssues()
    getPluralArtifactsIssues()
  }, [getPluralIssues, getPluralArtifactsIssues])

  return {
    pluralIssues,
    pluralArtifactsIssues,
    hasMore: hasMorePlural || hasMorePluralArtifacts,
    paginate: () => setPage(x => x + 1),
  }
}

export default useRoadmapData
