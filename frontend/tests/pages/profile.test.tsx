import { ApiError } from "@/app/lib/api/client";
import Profile from "@/app/profile/page";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { replace, fetchApi, fetchAllPages } = vi.hoisted(() => ({
  replace: vi.fn(),
  fetchApi: vi.fn(),
  fetchAllPages: vi.fn(),
}));

const mockRouter = { replace };

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("@/app/lib/api/client", async () => {
  const actual = await vi.importActual("@/app/lib/api/client");
  return {
    ...actual,
    default: fetchApi,
    fetchAllPages,
  };
});

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
    is_favorite: true,
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

const searches = [
  {
    id: 1,
    name: "Berlin Gyms",
    params: {
      city: "1",
      radius: "3000",
      category: "1",
    },
    user: 1,
  },
  {
    id: 2,
    name: "Europe restaurants & cafes",
    params: {
      city: "2",
      radius: "3000",
      category: "1,2",
    },
    user: 1,
  },
];

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "me/") {
        return Promise.resolve({
          username: "testUser",
          email: "testEmail@gmail.com",
        });
      }
      return Promise.resolve([]);
    });

    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "places/favorite/") {
        return Promise.resolve(places);
      }
      if (path === "searches/") {
        return Promise.resolve(searches);
      }
      return Promise.resolve([]);
    });
  });

  it("should redirect unauthenticated user and display spinner before redirect ", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError(
        "Can't fetch 'me/' endpoint with authenticated user",
        401,
        null,
      ),
    );

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("me/");
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login?next=/profile");

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should display error message when unexpected errer occur", async () => {
    vi.mocked(fetchApi).mockRejectedValue(
      new ApiError("Something went wrong", 500, null),
    );

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("me/");
    expect(replace).toHaveBeenCalledTimes(0);

    expect(
      screen.getByText("Could not load your profile."),
    ).toBeInTheDocument();
  });

  it("should display users username and email when successfully loged in", async () => {
    render(<Profile />);
    await act(async () => {});

    expect(screen.getByText("testUser's profile")).toBeInTheDocument();
    expect(screen.getByText("testEmail@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Favorite places")).toBeInTheDocument();
    expect(screen.getByText("Saved searches")).toBeInTheDocument();
  });

  it("should fetch user, saved searches and favorite places enpoints on mount", async () => {
    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchApi).toHaveBeenCalledWith("me/");
    expect(fetchAllPages).toHaveBeenCalledTimes(2);
    expect(fetchAllPages).toHaveBeenCalledWith("places/favorite/");
    expect(fetchAllPages).toHaveBeenCalledWith("searches/");
  });

  it("should display empty state when user have not saved searches and favorite places", async () => {
    vi.mocked(fetchAllPages).mockReturnValue([]);
    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchAllPages).toHaveBeenCalledTimes(2);

    expect(
      screen.getByText("You have no favorite places yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You have no saved searches yet."),
    ).toBeInTheDocument();
  });

  it("should display saved searches and favorite places when user successfully loged in", async () => {
    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);
    expect(fetchAllPages).toHaveBeenCalledTimes(2);

    expect(screen.getByText(places[0].name)).toBeInTheDocument();
    expect(screen.getByText(places[1].name)).toBeInTheDocument();

    expect(screen.getByText(searches[0].name)).toBeInTheDocument();
    expect(screen.getByText(searches[1].name)).toBeInTheDocument();
  });

  it("should redirect to place detail page when user click on favorte place", async () => {
    render(<Profile />);
    await act(async () => {});

    expect(screen.getByText(places[0].name)).toHaveAttribute(
      "href",
      `/places/${places[0].id}`,
    );
    expect(screen.getByText(places[1].name)).toHaveAttribute(
      "href",
      `/places/${places[1].id}`,
    );
  });

  it("should redirect to home page with selected filters when click on saved search", async () => {
    render(<Profile />);
    await act(async () => {});

    expect(screen.getByText(searches[0].name)).toHaveAttribute(
      "href",
      `/?${new URLSearchParams(searches[0].params)}`,
    );
    expect(screen.getByText(searches[1].name)).toHaveAttribute(
      "href",
      `/?${new URLSearchParams(searches[1].params)}`,
    );
  });

  it("should make DELETE request to favorite places endpoint when user click remove favorite place", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "places/favorite/") {
        return Promise.resolve([places[0]]);
      }
      return Promise.resolve([]);
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();

    await user.click(screen.getByText("Remove"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `places/${places[0].id}/favorite/`,
      undefined,
      { method: "DELETE" },
    );

    expect(screen.queryByText(places[0].name)).not.toBeInTheDocument();
  });

  it("should redirect user to login page when 401 error occurs during removing favorite place", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "places/favorite/") {
        return Promise.resolve([places[0]]);
      }
      return Promise.resolve([]);
    });

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "me/") {
        return Promise.resolve({
          username: "testUser",
          email: "testEmail@gmail.com",
        });
      }
      if (path === `places/${places[0].id}/favorite/`) {
        return Promise.reject(
          new ApiError("user is unauthenticated", 401, null),
        );
      }
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();
    expect(screen.getByText(places[0].name)).toBeInTheDocument();

    await user.click(screen.getByText("Remove"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `places/${places[0].id}/favorite/`,
      undefined,
      { method: "DELETE" },
    );

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login?next=/profile");
    expect(screen.getByText(places[0].name)).toBeInTheDocument();
  });

  it("should display error message when unexpected error occurs during removing favorite place", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "places/favorite/") {
        return Promise.resolve([places[0]]);
      }
      return Promise.resolve([]);
    });

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "me/") {
        return Promise.resolve({
          username: "testUser",
          email: "testEmail@gmail.com",
        });
      }
      if (path === `places/${places[0].id}/favorite/`) {
        return Promise.reject(new ApiError("Something went wrong", 500, null));
      }
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();
    expect(screen.getByText(places[0].name)).toBeInTheDocument();

    await user.click(screen.getByText("Remove"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `places/${places[0].id}/favorite/`,
      undefined,
      { method: "DELETE" },
    );

    expect(replace).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Could not remove this favorite."),
    ).toBeInTheDocument();
  });

  it("should make DELETE request to saved searches enpoint when user click remove saved search", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "searches/") {
        return Promise.resolve([searches[0]]);
      }
      return Promise.resolve([]);
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `searches/${searches[0].id}/`,
      undefined,
      { method: "DELETE" },
    );

    expect(screen.queryByText(searches[0].name)).not.toBeInTheDocument();
  });

  it("should redirect user to login page when 401 error occurs during removing saved search", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "searches/") {
        return Promise.resolve([searches[0]]);
      }
      return Promise.resolve([]);
    });

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "me/") {
        return Promise.resolve({
          username: "testUser",
          email: "testEmail@gmail.com",
        });
      }
      if (path === `searches/${searches[0].id}/`) {
        return Promise.reject(
          new ApiError("user is unauthenticated", 401, null),
        );
      }
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();
    expect(screen.getByText(searches[0].name)).toBeInTheDocument();

    await user.click(screen.getByText("Delete"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `searches/${searches[0].id}/`,
      undefined,
      { method: "DELETE" },
    );

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login?next=/profile");
    expect(screen.getByText(searches[0].name)).toBeInTheDocument();
  });

  it("should display error message when unexpected error occurs during removing saved search", async () => {
    vi.mocked(fetchAllPages).mockImplementation((path: string) => {
      if (path === "searches/") {
        return Promise.resolve([searches[0]]);
      }
      return Promise.resolve([]);
    });

    vi.mocked(fetchApi).mockImplementation((path: string) => {
      if (path === "me/") {
        return Promise.resolve({
          username: "testUser",
          email: "testEmail@gmail.com",
        });
      }
      if (path === `searches/${searches[0].id}/`) {
        return Promise.reject(new ApiError("Something went wrong", 500, null));
      }
    });

    render(<Profile />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(1);

    const user = userEvent.setup();
    expect(screen.getByText(searches[0].name)).toBeInTheDocument();

    await user.click(screen.getByText("Delete"));

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith(
      `searches/${searches[0].id}/`,
      undefined,
      { method: "DELETE" },
    );

    expect(replace).toHaveBeenCalledTimes(0);
    expect(
      screen.getByText("Could not delete this saved search."),
    ).toBeInTheDocument();
  });
});
