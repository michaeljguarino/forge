defmodule Worker.Docker.PipelineTest do
  use Core.SchemaCase, async: false
  use Mimic
  alias Worker.Docker

  setup :set_mimic_global

  describe "docker pipeline" do
    test "it can poll and process unscanned dkr images" do
      old = Timex.now() |> Timex.shift(days: -20)
      imgs = insert_list(3, :docker_image, scanned_at: old)
      insert(:docker_image, scanned_at: Timex.now())

      me = self()
      expect(Core.Conduit.Broker, :publish, 3, fn %{body: img}, :dkr -> send me, {:dkr, img} end)

      {:ok, producer} = Docker.Producer.start_link()
      {:ok, _} = Docker.Pipeline.start_link(producer)

      :timer.sleep(:timer.seconds(6))

      found = Enum.map(1..3, fn _ ->
        assert_receive {:dkr, img}
        img
      end)

      assert ids_equal(found, imgs)
      assert Enum.all?(found, & &1.scanned_at)
    end
  end
end
