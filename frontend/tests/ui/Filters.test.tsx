import fetchApi from "@/app/lib/api/client";
import Filters from "@/app/ui/Filters";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";

const push = vi.fn();
const scrollTo = vi.fn();

const searchParams = new URLSearchParams();

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
    useAuth: () => vi.fn(),
  };
});

vi.mock("@/app/lib/api/client", () => ({
  default: vi.fn(),
}));

HTMLElement.prototype.scrollTo = scrollTo;

describe("Filters", () => {
  beforeEach(() => {
    searchParams.delete("search");
    searchParams.delete("city");
    searchParams.delete("category");
    searchParams.delete("radius");
    searchParams.delete("price_level");
    searchParams.delete("opening_status");
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

  it("should conatin all filters that not dependant of user coordinates", async () => {
    render(<Filters position={[1, 1]} />);
    await act(async () => {});

    expect(screen.getByText(/City/i)).toBeInTheDocument();
    expect(screen.getByText(/Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Price level/i)).toBeInTheDocument();
    expect(screen.getByText(/Opening status/i)).toBeInTheDocument();
  });

  it("should conatin radius filter if users coordinates provided", async () => {
    render(<Filters position={[1, 1]} />);
    await act(async () => {});

    expect(screen.getByText(/Radius/i)).toBeInTheDocument();
  });

  it("should not conatin radius filter if users coordinates not provided", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    expect(screen.queryByText(/Radius/i)).not.toBeInTheDocument();
  });

  it("should fetch cities and categories on mount", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    expect(fetchApi).toHaveBeenCalledTimes(2);
    expect(fetchApi).toHaveBeenCalledWith("categories/");
    expect(fetchApi).toHaveBeenCalledWith("cities/");
  });

  it("should display fetched cities and categories on filters lists", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    expect(screen.queryByText("Paris")).not.toBeInTheDocument();
    expect(screen.queryByText("London")).not.toBeInTheDocument();

    await user.click(screen.getByText("City"));

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter city",
    );
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();

    expect(screen.queryByText("Gym")).not.toBeInTheDocument();
    expect(screen.queryByText("Cafe")).not.toBeInTheDocument();

    await user.click(screen.getByText("Category"));

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter category",
    );
    expect(screen.getByText("Gym")).toBeInTheDocument();
    expect(screen.getByText("Cafe")).toBeInTheDocument();
  });

  it("should push selected filters when applying valid filters", async () => {
    render(<Filters position={[1, 1]} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Category"));
    await user.click(screen.getByText("Gym"));
    await user.click(screen.getByText("Cafe"));

    await user.click(screen.getByText("Radius"));
    await user.type(screen.getByRole("spinbutton"), "1000");

    await user.click(screen.getByText("Opening status"));
    await user.click(screen.getByText("OPEN"));

    await user.click(screen.getByText("Apply"));

    const expectedParams = new URLSearchParams();
    expectedParams.set("city", "1");
    expectedParams.set("category", "1,2");
    expectedParams.set("radius", "1000");
    expectedParams.set("opening_status", "OPEN");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?" + expectedParams.toString());
  });

  it("should not push selected filters when apllying invalid filters", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Opening status"));
    await user.click(screen.getByText("OPEN"));

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(0);
  });

  it("should set filters init values to values from url", async () => {
    searchParams.set("city", "1");
    searchParams.set("category", "1");

    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    expect(screen.getByTestId("check-mark")).toBeInTheDocument();

    await user.click(screen.getByText("Category"));
    expect(screen.getByTestId("check-mark")).toBeInTheDocument();

    await user.click(screen.getByText("Apply"));

    const expectedParams = new URLSearchParams();
    expectedParams.set("category", "1");
    expectedParams.set("city", "1");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?" + expectedParams.toString());
  });

  it("should not set filters init values to invalid values from url", async () => {
    searchParams.set("city", "1");
    searchParams.set("category", "2");
    searchParams.set("radius", "invalid value");
    searchParams.set("price_level", "7$ - 16$");
    searchParams.set("opening_status", "invalid value");

    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    expect(screen.getByTestId("check-mark")).toBeInTheDocument();

    await user.click(screen.getByText("Category"));
    expect(screen.getByTestId("check-mark")).toBeInTheDocument();

    await user.click(screen.getByText("Price level"));
    expect(screen.getByTestId("check-mark")).toBeInTheDocument();

    await user.click(screen.getByText("Opening status"));
    expect(screen.queryByTestId("check-mark")).not.toBeInTheDocument();

    await user.click(screen.getByText("Apply"));

    const expectedParams = new URLSearchParams();
    expectedParams.set("category", "2");
    expectedParams.set("city", "1");
    expectedParams.set("price_level", "7$ - 16$");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?" + expectedParams.toString());
  });

  it("should push selected filters when required filters not selected but search is defined", async () => {
    searchParams.set("search", "test");
    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("Opening status"));
    await user.click(screen.getByText("OPEN"));

    await user.click(screen.getByText("Apply"));

    const expectedParams = new URLSearchParams();
    expectedParams.set("search", "test");
    expectedParams.set("opening_status", "OPEN");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("?" + expectedParams.toString());
  });

  it("should trigger scrollTo when trying apply filters without required filters selected", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(0);
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("should clear all filters when when trigger Clear All button", async () => {
    render(<Filters position={undefined} />);
    await act(async () => {});

    const user = userEvent.setup();

    await user.click(screen.getByText("City"));
    await user.click(screen.getByText("Paris"));

    await user.click(screen.getByText("Category"));
    await user.click(screen.getByText("Gym"));
    await user.click(screen.getByText("Cafe"));

    await user.click(screen.getByText("Opening status"));
    await user.click(screen.getByText("OPEN"));

    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(
      `?city=1&category=${encodeURIComponent("1,2")}&opening_status=OPEN`,
    );

    await user.click(screen.getByText("Clear All"));
    await user.click(screen.getByText("Apply"));

    expect(push).toHaveBeenCalledWith("?");
  });
});
