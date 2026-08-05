import { Place } from "@/app/lib/api/types";
import MapList from "@/app/ui/MapList";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

const places = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `TestPlace ${i + 1}`,
  slug: `testplace-${i + 1}`,
  address: `22${i + 1}B Baker Street`,
  latitude: 51.5128963 + i,
  longitude: -0.1001424 + i,
  rating: null,
  price_level: null,
  opening_status: null,
  city: { id: 1, name: "TestCity" },
  category: { id: 1, name: "TestCategory" },
  sourcerecord: i + 1,
  is_favorite: false,
  distance: 38.32 + i,
}));

describe("MapList", () => {
  it("should contain burger button", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );

    render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should open map list when triggered burger menu button", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );

    const user = userEvent.setup();

    render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    const mapList = screen.getByTestId("map-list");
    expect(mapList).toHaveClass("hidden");
    await user.click(button);
    expect(mapList).toHaveClass("fixed");
  });

  it("should return start search state for empty query selection", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );

    render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    const emptyResult = screen.getByTestId("start-search");
    expect(emptyResult).toBeInTheDocument();
  });

  it("should return empty search state for empty search", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    const { rerender } = render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    const emptyResult = screen.getByTestId("empty-results");
    expect(emptyResult).toBeInTheDocument();

    rerender(
      <MapList
        places={places}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );
    expect(emptyResult).not.toBeInTheDocument();
  });

  it("should return loading state if places isLoading set to true", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    const { rerender } = render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={true}
        error={null}
      />,
    );

    const loadingState = screen.getByText("Loading...");
    expect(loadingState).toBeInTheDocument();

    rerender(
      <MapList
        places={places}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );
    expect(loadingState).not.toBeInTheDocument();
  });

  it("should return error state if error was provided in props", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    const { rerender } = render(
      <MapList
        places={[] as Place[]}
        onPlaceClick={() => null}
        isLoading={false}
        error={"Test-Error"}
      />,
    );

    const errorMessage = screen.getByText("Test-Error");
    expect(errorMessage).toBeInTheDocument();

    const errorState = screen.getByTestId("error-state");
    expect(errorState).toBeInTheDocument();

    rerender(
      <MapList
        places={places}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );
    expect(errorState).not.toBeInTheDocument();
  });

  it("should return list of places when found results", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(
      <MapList
        places={places}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    expect(screen.queryByTestId("start-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("empty-results")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading-results")).not.toBeInTheDocument();

    expect(screen.getByText(places[0].name)).toBeInTheDocument();
    expect(screen.getByText(places[0].address)).toBeInTheDocument();
    expect(screen.getByText(places[0].address)).toBeInTheDocument();
    expect(
      screen.getByText(`Distance: ${String(places[0].distance)}km`),
    ).toBeInTheDocument();
  });

  it("should paginate map list results", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(
      <MapList
        places={places}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    expect(screen.queryByTestId("start-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("empty-results")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading-results")).not.toBeInTheDocument();

    expect(screen.getAllByRole("listitem")).toHaveLength(10);
    expect(screen.queryByText(places[0].name)).toBeInTheDocument();
    expect(screen.queryByText(places[1].name)).toBeInTheDocument();
    expect(screen.queryByText(places[2].name)).toBeInTheDocument();
    expect(screen.queryByText(places[3].name)).toBeInTheDocument();
    expect(screen.queryByText(places[4].name)).toBeInTheDocument();
    expect(screen.queryByText(places[5].name)).toBeInTheDocument();
    expect(screen.queryByText(places[6].name)).toBeInTheDocument();
    expect(screen.queryByText(places[7].name)).toBeInTheDocument();
    expect(screen.queryByText(places[8].name)).toBeInTheDocument();
    expect(screen.queryByText(places[9].name)).toBeInTheDocument();
    expect(screen.queryByText(places[10].name)).not.toBeInTheDocument();
  });

  it("should contain link to detail page", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(
      <MapList
        places={[places[0]]}
        onPlaceClick={() => null}
        isLoading={false}
        error={null}
      />,
    );

    expect(screen.queryByTestId("start-search")).not.toBeInTheDocument();
    expect(screen.queryByTestId("empty-results")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading-results")).not.toBeInTheDocument();

    expect(screen.getByText(places[0].name)).toBeInTheDocument();
    const viewDetailButton = screen.getByText("View details");
    expect(viewDetailButton).toBeInTheDocument();
    expect(viewDetailButton).toHaveAttribute("href", `/places/${places[0].id}`);
  });

  it("should trigger onPlaceClick function when clicked on map list item", async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=test") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    const user = userEvent.setup();

    let count = 0;
    render(
      <MapList
        places={places}
        onPlaceClick={() => count++}
        isLoading={false}
        error={null}
      />,
    );

    expect(count).toBe(0);
    await user.click(screen.getAllByRole("listitem")[0]);
    expect(count).toBe(1);
  });
});
