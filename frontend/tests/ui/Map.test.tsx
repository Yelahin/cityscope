import fetchApi, { fetchAllPages } from "@/app/lib/api/client";
import { Place } from "@/app/lib/api/types";
import { useAuth } from "@/app/ui/AuthContext";
import Map from "@/app/ui/Map";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const places = [
  {
    id: 1,
    name: "TestPlace 1",
    slug: "testplace-1",
    address: null,
    latitude: 51.5128963,
    longitude: -0.1001424,
    rating: null,
    price_level: null,
    opening_status: null,
    city: { id: 1, name: "TestCity" },
    category: { id: 1, name: "TestCategory" },
    sourcerecord: 1,
    is_favorite: false,
  },
  {
    id: 2,
    name: "TestPlace 2",
    slug: "testplace-2",
    address: "221B Baker Street",
    latitude: 51.5237656,
    longitude: -0.1585426,
    rating: 4.5,
    price_level: null,
    opening_status: null,
    city: { id: 1, name: "TestCity" },
    category: { id: 1, name: "TestCategory" },
    sourcerecord: 1,
    is_favorite: true,
  },
];

let searchParams = new URLSearchParams();
const scrollTo = vi.fn();

const push = vi.fn((url: string) => {
  const query = url.split("?")[1] ?? "";
  searchParams = new URLSearchParams(query);
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
  useSearchParams: () => searchParams,
  usePathname: () => "/",
}));

vi.mock("@/app/ui/AuthContext", async () => {
  const actual = await vi.importActual("@/app/ui/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock("@/app/lib/api/client", () => ({
  default: vi.fn(),
  fetchAllPages: vi.fn(),
}));

vi.mock("@/app/ui/MapController", () => ({
  default: ({ places }: { places: Place[] }) => (
    <div>
      {places.map((place) => (
        <div key={place.id} data-testid="marker">
          <p>Name: {place.name}</p>
        </div>
      ))}
    </div>
  ),
}));

HTMLElement.prototype.scrollTo = scrollTo;

describe("Map", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "cities/") {
        return Promise.resolve({
          results: [
            { id: 1, name: "Paris" },
            { id: 2, name: "London" },
          ],
        });
      }
      if (path === "categories/") {
        return Promise.resolve({
          results: [
            { id: 1, name: "Gym" },
            { id: 2, name: "Cafe" },
          ],
        });
      }
      return Promise.resolve({ results: [] });
    });
  });

  it("should display UserMarker if users coordinates provided", async () => {
    render(<Map zoom={15} position={[1, 1]} />);
    await act(async () => {});

    expect(screen.getByTestId("user-marker")).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(screen.getByTestId("user-marker"));

    expect(screen.getByText("Latitude: 1.0000000")).toBeInTheDocument();
    expect(screen.getByText("Longitude: 1.0000000")).toBeInTheDocument();
  });

  it("should not display UserMarker without users coordinates", async () => {
    render(<Map zoom={15} />);
    await act(async () => {});

    expect(screen.queryByTestId("user-marker")).not.toBeInTheDocument();
  });

  it("should apply searchBar value only if searchBar value bigger than min length", async () => {
    render(<Map zoom={15} />);
    await act(async () => {});

    const user = userEvent.setup();

    const searchBar = screen.getByRole("textbox");

    await user.click(searchBar);
    await user.type(searchBar, "test");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?search=test");

    await user.clear(searchBar);
    await user.type(searchBar, "so");

    expect(push).toHaveBeenCalledTimes(1);
  });

  it("should trigger places fetching when applying valid filters", async () => {
    const { rerender } = render(<Map zoom={15} />);
    await act(async () => {});

    const user = userEvent.setup();

    const searchBar = screen.getByRole("textbox");

    await user.click(searchBar);
    await user.type(searchBar, "test");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?search=test");

    rerender(<Map zoom={15} />);
    await act(async () => {});

    expect(fetchAllPages).toHaveBeenCalledTimes(1);
    expect(fetchAllPages).toHaveBeenCalledWith(
      "places/?search=test",
      1000,
    );
  });

  it("should not trigger places fetching when applying invalid filters", async () => {
    const { rerender } = render(<Map zoom={15} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Opening status"));
    await user.click(screen.getByText("OPEN"));

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(scrollTo).toHaveBeenCalledTimes(1);

    rerender(<Map zoom={15} />);
    await act(async () => {});

    expect(fetchAllPages).toHaveBeenCalledTimes(0);
  });

  it("should display fetched places in the map list", async () => {
    vi.mocked(fetchAllPages).mockResolvedValue(places);

    const { rerender } = render(<Map zoom={15} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Category"));
    await user.click(screen.getByText("Gym"));

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(1);

    rerender(<Map zoom={15} />);
    await act(async () => {});

    expect(screen.getByText("TestPlace 1")).toBeInTheDocument();
    expect(screen.getByText("TestPlace 2")).toBeInTheDocument();
  });

  it("should display fetched places on the map", async () => {
    vi.mocked(fetchAllPages).mockResolvedValue(places);

    const { rerender } = render(<Map zoom={15} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Category"));
    await user.click(screen.getByText("Gym"));

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(1);

    rerender(<Map zoom={15} />);
    await act(async () => {});

    const place = screen.getByText("TestPlace 1");
    expect(place).toBeInTheDocument();
    expect(screen.getAllByTestId("marker")).toHaveLength(2);
    expect(screen.getByText(`Name: ${places[0].name}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${places[1].name}`)).toBeInTheDocument();
  });
});
