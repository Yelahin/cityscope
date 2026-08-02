import RatingFilter from "@/app/ui/RatingFilter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

type FilterValue = number | string | number[] | string[];
type Filters = Record<string, FilterValue>;

function renderRatingFilter(initialFilters: Filters = {}) {
  const user = userEvent.setup();

  function Wrapper() {
    const [openFilter, setOpenFilter] = useState<string | null>("rating");
    const [selectedFilters, setSelectedFilters] =
      useState<Filters>(initialFilters);

    return (
      <>
        <RatingFilter
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

describe("RatingFilter", () => {
  it("should add rating_min and rating_max when rating is selected", async () => {
    const { user } = renderRatingFilter();

    await user.click(screen.getByRole("listitem", { name: "Rating 3" }));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent(
      '"rating_min":3',
    );
    expect(screen.getByTestId("selected-filters")).toHaveTextContent(
      '"rating_max":4',
    );
  });

  it("should remove rating filters when selected rating is clicked again", async () => {
    const { user } = renderRatingFilter({ rating_min: 3, rating_max: 4 });

    await user.click(screen.getByRole("listitem", { name: "Rating 3" }));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent("{}");
  });

  it("should clear rating filters", async () => {
    const { user } = renderRatingFilter({ rating_min: 3, rating_max: 4 });

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByTestId("selected-filters")).toHaveTextContent("{}");
  });

  it("should close filter", async () => {
    const { user } = renderRatingFilter();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByTestId("open-filter")).toHaveTextContent("closed");
  });
});
