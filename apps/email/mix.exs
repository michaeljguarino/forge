defmodule Email.MixProject do
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
      app: :email,
      version: version(),
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.7",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [tool: ExCoveralls]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Email.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.6.0"},
      {:phoenix_html, "~> 3.2.0"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:phoenix_live_dashboard, "~> 0.8.0"},
      {:telemetry_metrics, "~> 0.6.1"},
      {:telemetry_poller, "~> 1.0.0"},
      {:bamboo_phoenix, "~> 1.0"},
      {:gettext, "~> 0.20"},
      {:jason, "~> 1.0"},
      {:plug_cowboy, "~> 2.6.0"},

      {:core, in_umbrella: true}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "cmd npm install --prefix assets"]
    ]
  end
end
