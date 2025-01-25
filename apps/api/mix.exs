defmodule Api.MixProject do
  use Mix.Project

  defp version do
    version = git_vsn()
    case Version.parse(version) do
      {:ok, %Version{pre: ["pre" <> _ | _]} = version} ->
        to_string(version)

      {:ok, %Version{pre: []} = version} ->
        to_string(version)

      {:ok, %Version{patch: patch, pre: pre} = version} ->
        to_string(%{version | patch: patch + 1, pre: ["dev" | pre]})

      :error ->
        Mix.shell().error("Failed to parse, falling back to 0.0.0")
        "0.0.0"
    end
  end

  defp git_vsn() do
    case System.cmd("git", ~w[describe --dirty=+dirty]) do
      {version, 0} ->
        String.trim_leading(String.trim(version), "v")

      {_, code} ->
        Mix.shell().error("Git exited with code #{code}, falling back to 0.0.0")

        "0.0.0"
    end
  end

  def project do
    [
      app: :api,
      version: version(),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.5",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [tool: ExCoveralls]
    ]
  end

  def application do
    [
      mod: {Api.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:sentry, "8.0.6"},
      {:phoenix, "~> 1.6.0"},
      {:phoenix_pubsub, "~> 2.0"},
      {:phoenix_ecto, "~> 4.4.0"},
      {:ecto_sql, "~> 3.9.0"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 3.2.0"},
      {:basic_auth, "~> 2.2.2"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:gettext, "~> 0.20"},
      {:jason, "~> 1.0"},
      {:guardian, "~> 2.3.0"},
      {:cors_plug, "~> 2.0"},
      {:plug_cowboy, "~> 2.6.0", override: true},
      {:reverse_proxy_plug, "~> 2.1.1"},
      {:libcluster, "~> 3.3.1"},
      {:prometheus_ex, "~> 3.0"},
      {:prometheus_plugs, "~> 1.1.1"},
      {:remote_ip, "~> 0.2.0"},
      {:hammer_plug, "~> 3.0"},
      {:k8s_traffic_plug, git: "https://github.com/pluralsh/k8s_traffic_plug"},

      {:core, in_umbrella: true},
      {:graphql, in_umbrella: true},
      {:email, in_umbrella: true}
    ]
  end

  defp aliases do
    []
  end
end
