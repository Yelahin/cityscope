import PlaceFilter from "@/app/ui/PlaceFilter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("PlaceFilter", () => {
  it("should render placeholder", () => {
    const { rerender } = render(
      <PlaceFilter
        placeholder="Test PlaceFilter"
        selectedFilters={{}}
        isOpen={false}
        onToggle={() => null}
        filter={<div></div>}
      />,
    );

    expect(screen.getByText("Test PlaceFilter")).toBeInTheDocument();

    rerender(
      <PlaceFilter
        placeholder="Test"
        selectedFilters={{}}
        isOpen={false}
        onToggle={() => null}
        filter={<div></div>}
      />,
    );

    expect(screen.queryByText("Test PlaceFilter")).not.toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should render filter if isOpen set to true", () => {
    const { rerender } = render(
      <PlaceFilter
        placeholder="Test PlaceFilter"
        selectedFilters={{}}
        isOpen={false}
        onToggle={() => null}
        filter={<p>PlaceFilter filter</p>}
      />,
    );

    expect(screen.queryByText("PlaceFilter filter")).not.toBeInTheDocument();

    rerender(
      <PlaceFilter
        placeholder="Test PlaceFilter"
        selectedFilters={{}}
        isOpen={true}
        onToggle={() => null}
        filter={<p>PlaceFilter filter</p>}
      />,
    );

    expect(screen.queryByText("PlaceFilter filter")).toBeInTheDocument();
  });

  it("should trigger onToggle when user click on PlaceFilter button", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [placeholder, setPlaceholder] = useState<number>(0);

      return (
        <PlaceFilter
          placeholder={String(placeholder)}
          selectedFilters={{}}
          isOpen={false}
          onToggle={() => setPlaceholder((prev) => prev + 1)}
          filter={<div></div>}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText("0")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("1")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should render require to select state if param in requiredToSelect", () => {
    const { rerender } = render(
      <PlaceFilter
        placeholder="Test PlaceFilter"
        selectedFilters={{}}
        isOpen={false}
        param="wrongParam"
        requiredToSelect={["test"]}
        onToggle={() => null}
        filter={<div></div>}
      />,
    );

    expect(screen.queryByTestId("required-to-select")).not.toBeInTheDocument();

    rerender(
      <PlaceFilter
        placeholder="Test PlaceFilter"
        selectedFilters={{}}
        isOpen={false}
        param="test"
        requiredToSelect={["test"]}
        onToggle={() => null}
        filter={<div></div>}
      />,
    );

    expect(screen.queryByTestId("required-to-select")).toBeInTheDocument();
  });
});
