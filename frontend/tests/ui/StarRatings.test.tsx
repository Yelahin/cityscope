import StarRating from "@/app/ui/StarRatings";
import { render, screen } from "@testing-library/react";

vi.mock("react-icons/io5", () => ({
  IoStar: () => <span data-testid="full-star" />,
  IoStarHalf: () => <span data-testid="half-star" />,
  IoStarOutline: () => <span data-testid="empty-star" />,
}));

describe("StarRating", () => {
  it("should render five empty stars for zero rating", () => {
    render(<StarRating rating={0} />);

    expect(screen.queryAllByTestId("full-star")).toHaveLength(0);
    expect(screen.queryAllByTestId("half-star")).toHaveLength(0);
    expect(screen.getAllByTestId("empty-star")).toHaveLength(5);
  });

  it("should render full stars for integer rating", () => {
    render(<StarRating rating={3} />);

    expect(screen.getAllByTestId("full-star")).toHaveLength(3);
    expect(screen.queryAllByTestId("half-star")).toHaveLength(0);
    expect(screen.getAllByTestId("empty-star")).toHaveLength(2);
  });

  it("should render half star for decimal rating", () => {
    render(<StarRating rating={3.5} />);

    expect(screen.getAllByTestId("full-star")).toHaveLength(3);
    expect(screen.getAllByTestId("half-star")).toHaveLength(1);
    expect(screen.getAllByTestId("empty-star")).toHaveLength(1);
  });
});
