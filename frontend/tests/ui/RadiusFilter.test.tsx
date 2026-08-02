import RadiusFilter from "@/app/ui/RadiusFilter";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

type FilterValue = number | string | number[] | string[];
type Filters = Record<string, FilterValue>;

function renderRadiusFilter(initialFilters: Filters = {}) {
  const user = userEvent.setup();

  function Wrapper() {
    const [openFilter, setOpenFilter] = useState<string | null>("radius");
    const [selectedFilters, setSelectedFilters] =
      useState<Filters>(initialFilters);

    return (
      <>
        <RadiusFilter
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
        <div data-testid="open-filter">{openFilter ?? "closed"}</div>
        <div data-testid="selected-filters">
          {JSON.stringify(selectedFilters)}
        </div>
      </>
    );
  }

  render(<Wrapper />);

  return { user };
}

describe("RadiusFilter", () => {
  it("should save radius value in selected filters", async () => {
    const { user } = renderRadiusFilter();

    await user.type(screen.getByRole("spinbutton"), "25");

    await waitFor(() => {
      expect(screen.getByTestId("selected-filters")).toHaveTextContent(
        '"radius":25',
      );
    });
  });

  it("should render initial radius value", () => {
    renderRadiusFilter({ radius: 15 });

    expect(screen.getByRole("spinbutton")).toHaveValue(15);
  });

  it("should clear radius value", async () => {
    const { user } = renderRadiusFilter({ radius: 15 });

    await user.click(screen.getByRole("button", { name: "Clear" }));

    await waitFor(() => {
      expect(screen.getByRole("spinbutton")).toHaveValue(null);
      expect(screen.getByTestId("selected-filters")).toHaveTextContent("{}");
    });
  });

  it("should close filter", async () => {
    const { user } = renderRadiusFilter();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByTestId("open-filter")).toHaveTextContent("closed");
  });
});
