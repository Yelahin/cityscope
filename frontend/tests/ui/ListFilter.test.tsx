import ListFilter from "@/app/ui/ListFilter";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";

const cities = [
  { id: 1, name: "Paris" },
  { id: 2, name: "London" },
  { id: 3, name: "Rome" },
  { id: 4, name: "Madrid" },
  { id: 5, name: "Chicago" },
];

describe("ListFilter", () => {
  it("should render placeholder", () => {
    function Wrapper({ placeholder }: { placeholder: string }) {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={[]}
          placeholder={placeholder}
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={0}
        />
      );
    }

    const { rerender } = render(<Wrapper placeholder={"Test ListFilter"} />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter test listfilter",
    );

    rerender(<Wrapper placeholder="Test" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute(
      "placeholder",
      "Enter test listfilter",
    );
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter test",
    );
  });

  it("should render all provided list items", () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText(cities[0].name)).toBeInTheDocument();
    expect(screen.getByText(cities[1].name)).toBeInTheDocument();
    expect(screen.getByText(cities[2].name)).toBeInTheDocument();
    expect(screen.getByText(cities[3].name)).toBeInTheDocument();
    expect(screen.getByText(cities[4].name)).toBeInTheDocument();
  });

  it("should render limit value", () => {
    function Wrapper({ limit }: { limit: number }) {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={[]}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={limit}
        />
      );
    }

    const { rerender } = render(<Wrapper limit={5} />);

    expect(screen.getByText("/5")).toBeInTheDocument();

    rerender(<Wrapper limit={2} />);

    expect(screen.queryByText("/5")).not.toBeInTheDocument();
    expect(screen.getByText("/2")).toBeInTheDocument();
  });

  it("should render selected items count", () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/5")).toBeInTheDocument();
  });

  it("should display check marker on selected list items", () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({
        city: [1, 2, 3],
      });

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText("3")).toBeInTheDocument();

    expect(
      within(screen.getByText(cities[0].name)).getByTestId("check-mark"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText(cities[1].name)).getByTestId("check-mark"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText(cities[2].name)).getByTestId("check-mark"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByText(cities[3].name)).queryByTestId("check-mark"),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByText(cities[4].name)).queryByTestId("check-mark"),
    ).not.toBeInTheDocument();
  });

  it("should select list items when click on them", async () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    const user = userEvent.setup();

    render(<Wrapper />);

    expect(screen.queryAllByTestId("check-mark")).toHaveLength(0);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[0].name));

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(1);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[4].name));

    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(2);
    expect(screen.getByText("/5")).toBeInTheDocument();
  });

  it("should remove list items from selected when click on them when items already selected", async () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({
        city: [1, 2, 3, 4, 5],
      });

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    const user = userEvent.setup();

    render(<Wrapper />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(5);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[0].name));

    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(4);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[1].name));
    await user.click(screen.getByText(cities[2].name));
    await user.click(screen.getByText(cities[3].name));
    await user.click(screen.getByText(cities[4].name));

    expect(screen.queryByText("4")).not.toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(0);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[1].name));

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(1);
    expect(screen.getByText("/5")).toBeInTheDocument();
  });

  it("should filter list items using input", async () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    const user = userEvent.setup();

    render(<Wrapper />);

    expect(screen.getByText(cities[0].name)).toBeInTheDocument();
    expect(screen.getByText(cities[1].name)).toBeInTheDocument();
    expect(screen.getByText(cities[2].name)).toBeInTheDocument();
    expect(screen.getByText(cities[3].name)).toBeInTheDocument();
    expect(screen.getByText(cities[4].name)).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "Paris");
    expect(screen.getByText(cities[0].name)).toBeInTheDocument();

    expect(screen.queryByText(cities[1].name)).not.toBeInTheDocument();
    expect(screen.queryByText(cities[2].name)).not.toBeInTheDocument();
    expect(screen.queryByText(cities[3].name)).not.toBeInTheDocument();
    expect(screen.queryByText(cities[4].name)).not.toBeInTheDocument();

    await user.clear(screen.getByRole("textbox"));
    expect(screen.getByText(cities[0].name)).toBeInTheDocument();
    expect(screen.getByText(cities[1].name)).toBeInTheDocument();
    expect(screen.getByText(cities[2].name)).toBeInTheDocument();
    expect(screen.getByText(cities[3].name)).toBeInTheDocument();
    expect(screen.getByText(cities[4].name)).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "ri");
    expect(screen.getByText(cities[0].name)).toBeInTheDocument();
    expect(screen.getByText(cities[3].name)).toBeInTheDocument();

    expect(screen.queryByText(cities[1].name)).not.toBeInTheDocument();
    expect(screen.queryByText(cities[2].name)).not.toBeInTheDocument();
    expect(screen.queryByText(cities[4].name)).not.toBeInTheDocument();
  });

  it("should select objects by string when selectById set to false", async () => {
    function Wrapper({ selected }: { selected: number[] | string[] }) {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({
        city: selected,
      });

      useEffect(() => {
        setSelectedFilters({ city: selected });
      }, [selected]);

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          selectById={false}
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    const user = userEvent.setup();

    const { rerender } = render(<Wrapper selected={[1, 2, 3]} />);

    expect(screen.queryAllByTestId("check-mark")).toHaveLength(0);

    rerender(<Wrapper selected={["Paris", "London", "Rome"]} />);

    expect(screen.getAllByTestId("check-mark")).toHaveLength(3);

    await user.click(screen.getByText(cities[3].name));

    expect(screen.getAllByTestId("check-mark")).toHaveLength(4);
  });

  it("should display Clear button if limit equal 1", () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={[]}
          placeholder="ListFilter"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={1}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.queryByText("Clear All")).not.toBeInTheDocument();
  });

  it("should display Clear All button if limit greater than 1", () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({});

      return (
        <ListFilter
          objects={[]}
          placeholder="ListFilter"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={2}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.getByText("Clear All")).toBeInTheDocument();
    expect(screen.queryByText("Clear")).not.toBeInTheDocument();
  });

  it("should remove all selected filter items when clicked on clear buttons", async () => {
    function Wrapper() {
      const [_openFilter, setOpenFilter] = useState<string | null>(null);
      const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string | number | string[] | number[]>
      >({
        city: [1, 2, 3, 4, 5],
      });

      return (
        <ListFilter
          objects={cities}
          placeholder="ListFilter"
          param="city"
          setOpenFilter={setOpenFilter}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          limit={cities.length}
        />
      );
    }

    const user = userEvent.setup();

    render(<Wrapper />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(5);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText("Clear All"));

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(0);
    expect(screen.getByText("/5")).toBeInTheDocument();

    await user.click(screen.getByText(cities[0].name));

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(1);

    await user.click(screen.getByText("Clear All"));

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryAllByTestId("check-mark")).toHaveLength(0);
    expect(screen.getByText("/5")).toBeInTheDocument();
  });
});
