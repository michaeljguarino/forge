Mimic.copy(Watchman.Deployer)
Mimic.copy(Watchman.Storage.Git)
Mimic.copy(Watchman.Commands.Chartmart)
Mimic.copy(Watchman.Commands.Command)
Mimic.copy(Mojito)

ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(Watchman.Repo, :manual)
{:ok, _} = Application.ensure_all_started(:ex_machina)
