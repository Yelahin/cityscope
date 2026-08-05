import PlaceDetails from "@/app/places/[id]/page";
import { act, render, screen } from "@testing-library/react";
import { ApiError } from "@/app/lib/api/client";
import userEvent from "@testing-library/user-event";

const { push, fetchApi } = vi.hoisted(() => ({
  push: vi.fn(),
  fetchApi: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
  useParams: () => ({ id: "1" }),
}));

vi.mock("@/app/lib/api/client", async () => {
  const actual = await vi.importActual("@/app/lib/api/client");
  return {
    ...actual,
    default: fetchApi,
  };
});

const place = {
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
};

const user = { username: "testUser", email: "testEmail@gmail.com" };

describe("PlaceDetails", () => {
  beforeEach(() => {
    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "places/1/") {
        return Promise.resolve(place);
      }
      return Promise.resolve({});
    });
  });

  it("should display correspondent error message when trying to access not existing place", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("Place not found", 404, null),
    );

    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Place not found.")).toBeInTheDocument();
  });

  it("should display correspondent error message when unexpected error occurs", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("Something went wrong", 500, null),
    );

    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Could not load this place.")).toBeInTheDocument();
  });

  it("should display places details and place on the map when no errors occured", async () => {
    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText(place.name)).toBeInTheDocument();
    expect(screen.getByText(place.city.name)).toBeInTheDocument();
    expect(screen.getAllByText(place.category.name)).toHaveLength(2);
  });

  it("should display back to search button with previous selected filters", async () => {
    const { unmount } = render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("← Back to search")).toBeInTheDocument();
    expect(screen.getByText("← Back to search")).toHaveAttribute("href", "/");
    unmount();

    sessionStorage.setItem("lastSearchUrl", "/?search=test&city=1");
    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("← Back to search")).toBeInTheDocument();
    expect(screen.getByText("← Back to search")).toHaveAttribute(
      "href",
      "/?search=test&city=1",
    );
  });

  it("should redirect unauthenticated user when click on add to favorites button", async () => {
    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "places/1/") {
        return Promise.resolve(place);
      }
      if (path === "me/") {
        return Promise.reject(new ApiError("User doesn't exist", 401, null));
      }
      return Promise.resolve({});
    });

    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Add to favorites")).toBeInTheDocument();

    const user = userEvent.setup();

    expect(push).toHaveBeenCalledTimes(0);

    await user.click(screen.getByText("Add to favorites"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent("/places/1")}`,
    );
  });

  it("should display add to favorites button if place isn't in favorites", async () => {
    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Add to favorites")).toBeInTheDocument();
  });

  it("should display Remove from favorites button if place is in favorites", async () => {
    vi.mocked(fetchApi).mockImplementation((path: string) => {
      const favoritePlace = { ...place, is_favorite: true };
      if (path === "places/1/") {
        return Promise.resolve(favoritePlace);
      }
      if (path === "me/") {
        return Promise.resolve(user);
      }
      return Promise.resolve({});
    });

    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Remove from favorites")).toBeInTheDocument();
  });

  it("should make POST request to add new favorite place", async () => {
    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Add to favorites")).toBeInTheDocument();
    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).not.toHaveBeenCalledWith(
      "places/1/favorite/",
      undefined,
      undefined,
      {
        method: "POST",
      },
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Add to favorites"));

    expect(fetchApi).toHaveBeenCalledTimes(3);
    expect(fetchApi).toHaveBeenCalledWith(
      "places/1/favorite/",
      undefined,
      undefined,
      {
        method: "POST",
      },
    );

    expect(screen.queryByText("Add to favorites")).not.toBeInTheDocument();
    expect(screen.getByText("Remove from favorites")).toBeInTheDocument();
  });

  it("should make DELETE request to remove place from favirtes", async () => {
    vi.mocked(fetchApi).mockImplementation((path: string) => {
      const favoritePlace = { ...place, is_favorite: true };
      if (path === "places/1/") {
        return Promise.resolve(favoritePlace);
      }
      if (path === "me/") {
        return Promise.resolve(user);
      }
      return Promise.resolve({});
    });

    render(<PlaceDetails />);
    await act(async () => {});

    expect(screen.getByText("Remove from favorites")).toBeInTheDocument();
    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).not.toHaveBeenCalledWith(
      "places/1/favorite/",
      undefined,
      undefined,
      {
        method: "DELETE",
      },
    );

    const testUser = userEvent.setup();
    await testUser.click(screen.getByText("Remove from favorites"));

    expect(fetchApi).toHaveBeenCalledTimes(3);
    expect(fetchApi).toHaveBeenCalledWith(
      "places/1/favorite/",
      undefined,
      undefined,
      {
        method: "DELETE",
      },
    );

    expect(screen.queryByText("Remove from favorites")).not.toBeInTheDocument();
    expect(screen.getByText("Add to favorites")).toBeInTheDocument();
  });
});
