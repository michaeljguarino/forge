import gql from 'graphql-tag'
import {UserFragment, PublisherFragment} from './user'

export const RepoFragment = gql`
  fragment RepoFragment on Repository {
    id
    name
    description
    documentation
    icon
    publisher {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`;

export const InstallationFragment = gql`
  fragment InstallationFragment on Installation {
    id
    context
    license
    autoUpgrade
    repository {
      ...RepoFragment
    }
    user {
      ...UserFragment
    }
  }
  ${RepoFragment}
  ${UserFragment}
`;

export const DependenciesFragment = gql`
  fragment DependenciesFragment on Dependencies {
    dependencies {
      name
      repo
      type
    }
    providers
    wirings {
      terraform
      helm
    }
  }
`;

export const IntegrationFragment = gql`
  fragment IntegrationFragment on Integration {
    id
    name
    icon
    sourceUrl
    description
    publisher {
      ...PublisherFragment
    }
  }
  ${PublisherFragment}
`;