import OpeningStatusFilter from "@/app/ui/OpeningStatusFilter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

type FilterValue = number | string | number[] | string[];
type Filters = Record<string, FilterValue>;

function renderOpeningStatusFilter(initialFilters: Filters = {}) {
  const user = userEvent.setup();

  function Wrapper() {
    const [openFilter, setOpenFilter] = useState<string | null>(
      "opening_status",
    );
    const [selectedFilters, setSelectedFilters] =
      useState<Filters>(initialFilters);

    return (
      <>
        <OpeningStatusFilter
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

describe("OpeningStatusFilter", () => {
  it("should add and remove selected opening status", async () => {
    const { user } = renderOpeningStatusFilter();

    await user.click(screen.getByText("OPEN"));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent(
      '"opening_status":"OPEN"',
    );

    await user.click(screen.getByText("OPEN"));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent("{}");
  });

  it("should clear selected opening status", async () => {
    const { user } = renderOpeningStatusFilter({ opening_status: "CLOSED" });

    expect(screen.getByTestId("selected-filters")).toHaveTextContent(
      '"opening_status":"CLOSED"',
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent("{}");
  });

  it("should close filter", async () => {
    const { user } = renderOpeningStatusFilter();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByTestId("open-filter")).toHaveTextContent("closed");
  });
});
