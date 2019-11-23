defprotocol Core.PubSub.Fanout do
  @fallback_to_any true

  def fanout(event)
end

defimpl Core.PubSub.Fanout, for: Any do
  def fanout(_), do: :ok
end

defimpl Core.PubSub.Fanout, for: Core.PubSub.VersionCreated do
  alias Core.Schema.ChartInstallation

  def fanout(%{item: version}) do
    ChartInstallation.for_chart(version.chart_id)
    |> ChartInstallation.with_auto_upgrade()
    |> ChartInstallation.ignore_version(version.id)
    |> Core.Repo.update_all(set: [version_id: version.id])
  end
end