defmodule Core.Services.Cloud do
  use Core.Services.Base
  alias Core.Repo
  alias Core.PubSub
  alias Core.Services.{Accounts, Users, Repositories, Shell}
  alias Core.Schema.{CloudCluster, CockroachCluster, ConsoleInstance, User, OIDCProvider}

  @type error :: {:error, term}
  @type console_resp :: {:ok, ConsoleInstance.t} | error
  @type cluster_resp :: {:ok, CloudCluster.t} | error
  @type cockroach_resp :: {:ok, CockroachCluster.t} | error

  def get_instance!(id), do: Repo.get!(ConsoleInstance, id)

  @spec upsert_cluster(map, binary) :: cluster_resp
  def upsert_cluster(attrs, name) do
    case Repo.get_by(CloudCluster, name: name) do
      %CloudCluster{} = cluster -> cluster
      nil -> %CloudCluster{name: name}
    end
    |> CloudCluster.changeset(attrs)
    |> Repo.insert_or_update()
  end

  @spec upsert_cockroach(map, binary) :: cockroach_resp
  def upsert_cockroach(attrs, name) do
    case Repo.get_by(CockroachCluster, name: name) do
      %CockroachCluster{} = cluster -> cluster
      nil -> %CockroachCluster{name: name}
    end
    |> CockroachCluster.changeset(attrs)
    |> Repo.insert_or_update()
  end

  @doc """
  Creates a new Cloud instance of the Plural console
  """
  @spec create_instance(map, User.t) :: console_resp
  def create_instance(%{name: name} = attrs, %User{} = user) do
    start_transaction()
    |> add_operation(:cluster, fn _ -> select_cluster(attrs[:cloud], attrs[:region]) end)
    |> add_operation(:cockroach, fn _ -> select_roach(attrs[:cloud]) end)
    |> add_operation(:sa, fn _ ->
      Accounts.create_service_account(%{name: "#{name}-cloud-sa", email: "#{name}-cloud-sa@srv.plural.sh"}, user)
    end)
    |> add_operation(:token, fn %{sa: sa} -> Users.create_persisted_token(sa) end)
    |> add_operation(:install, fn %{sa: sa} ->
      repo = Repositories.get_repository_by_name!("console")
      case Repositories.get_installation(sa.id, repo.id) do
        nil -> Repositories.create_installation(%{}, repo, sa)
        inst -> {:ok, inst}
      end
    end)
    |> add_operation(:oidc, fn %{install: inst, sa: sa} ->
      inst = Core.Repo.preload(inst, [oidc_provider: :bindings])
      Repositories.upsert_oidc_provider(%{
        auth_method: :post,
        bindings: Shell.oidc_bindings(inst.oidc_provider, user),
        redirect_uris: Shell.merge_uris(["https://console.#{name}.cloud.plural.sh/oauth/callback"], inst.oidc_provider)
      }, inst.id, sa)
    end)
    |> add_operation(:instance, fn %{oidc: oidc, token: token, cluster: cluster, cockroach: roach, sa: sa} ->
      %ConsoleInstance{status: :pending, cluster_id: cluster.id, cockroach_id: roach.id, owner_id: sa.id}
      |> ConsoleInstance.changeset(add_configuration(attrs, name, token.token, oidc, user))
      |> Repo.insert()
    end)
    |> execute(extract: :instance)
    |> notify(:create, user)
  end

  @doc """
  Updates base attributes of a console instance
  """
  @spec update_instance(map, binary, User.t) :: console_resp
  def update_instance(attrs, id, %User{} = user) do
    start_transaction()
    |> add_operation(:inst, fn _ -> authorize(id, user) end)
    |> add_operation(:updated, fn %{inst: inst} ->
      ConsoleInstance.changeset(inst, attrs)
      |> Repo.update()
    end)
    |> execute(extract: :updated)
    |> notify(:update, user)
  end

  @doc """
  Schedules a console instance to be cleaned up
  """
  @spec delete_instance(binary, User.t) :: console_resp
  def delete_instance(id, %User{} = user) do
    start_transaction()
    |> add_operation(:inst, fn _ -> authorize(id, user) end)
    |> add_operation(:deleted, fn %{inst: inst} ->
      Ecto.Changeset.change(inst, %{deleted_at: Timex.now()})
      |> Repo.update()
    end)
    |> execute(extract: :deleted)
    |> notify(:delete, user)
  end

  def authorize(id, %User{} = user) do
    inst = get_instance!(id) |> Repo.preload([:owner])
    with {:ok, _} <- Core.Policies.Account.allow(inst.owner, user, :impersonate),
      do: {:ok, inst}
  end

  def visible(id, %User{account_id: aid}) do
    get_instance!(id)
    |> Repo.preload([:owner])
    |> case do
      %ConsoleInstance{owner: %User{account_id: ^aid}} = instance -> {:ok, instance}
      _ -> {:error, :forbidden}
    end
  end

  defp add_configuration(attrs, name, token, %OIDCProvider{} = oidc, %User{} = user) do
    Map.merge(attrs, %{subdomain: "#{name}.cloud.plural.sh", url: "console.#{name}.cloud.plural.sh"})
    |> Map.put(:configuration, %{
      aes_key:        aes_key(),
      encryption_key: encryption_key(),
      database:       "#{name}_cloud",
      dbuser:         "#{name}_user",
      dbpassword:     Core.random_alphanum(30),
      subdomain:      "#{name}.cloud.plural.sh",
      jwt_secret:     Core.random_alphanum(30),
      owner_name:     user.name,
      owner_email:    user.email,
      admin_password: Core.random_alphanum(30),
      client_id:      oidc.client_id,
      client_secret:  oidc.client_secret,
      plural_token:   token,
      kas_api:        Core.random_alphanum(30),
      kas_private:    Core.random_alphanum(30),
      kas_redis:      Core.random_alphanum(30)
    })
  end

  defp select_cluster(cloud, region) do
    CloudCluster.for_cloud(cloud)
    |> CloudCluster.for_region(region)
    |> CloudCluster.unsaturated()
    |> Repo.all()
    |> random_choice("Could not find cluster for #{cloud} and #{region}")
  end

  defp select_roach(cloud) do
    CockroachCluster.for_cloud(cloud)
    |> CockroachCluster.unsaturated()
    |> Repo.all()
    |> random_choice("Could not place in #{cloud}")
  end

  defp random_choice([], message), do: {:error, message}
  defp random_choice(l, _) do
    Enum.random(l)
    |> inc()
  end

  def inc(%schema{id: id}) do
    schema.selected()
    |> schema.for_id(id)
    |> Core.Repo.update_all(inc: [count: 1])
    |> case do
      {1, [res]} -> {:ok, res}
      _ -> {:error, "could not increment #{schema} [id=#{id}]"}
    end
  end

  def dec(%schema{id: id}) do
    schema.selected()
    |> schema.for_id(id)
    |> Core.Repo.update_all(inc: [count: -1])
    |> case do
      {1, [res]} -> {:ok, res}
      _ -> {:error, "could not increment #{schema} [id=#{id}]"}
    end
  end

  defp aes_key() do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64()
  end

  defp encryption_key() do
    :crypto.strong_rand_bytes(32)
    |> Base.encode64()
  end

  defp notify({:ok, %ConsoleInstance{} = inst}, :create, user),
    do: handle_notify(PubSub.ConsoleInstanceCreated, inst, actor: user)
  defp notify({:ok, %ConsoleInstance{} = inst}, :update, user),
    do: handle_notify(PubSub.ConsoleInstanceUpdated, inst, actor: user)
  defp notify({:ok, %ConsoleInstance{} = inst}, :delete, user),
    do: handle_notify(PubSub.ConsoleInstanceDeleted, inst, actor: user)
  defp notify(pass, _, _), do: pass
end
