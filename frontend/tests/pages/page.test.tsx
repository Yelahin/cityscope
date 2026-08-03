import Home from "@/app/page";
import { act, render, screen } from "@testing-library/react";

vi.mock("@/app/ui/Map", () => ({
  default: ({
    zoom,
    position,
  }: {
    zoom: number;
    position?: [number, number];
  }) => (
    <div>
      <p data-testid="zoom-prop">{zoom}</p>
      {position && <p data-testid="position-prop">{position}</p>};
    </div>
  ),
}));

const consoleSpy = vi.spyOn(console, "log");

describe("Home", () => {
  it("should log error and set proper props to map when geolocation not supported", async () => {
    vi.stubGlobal("navigator", { geolocation: undefined });

    render(<Home />);
    await act(async () => {});

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Geolocation not supported!");
    expect(screen.getByTestId("zoom-prop")).toHaveTextContent("0");
    expect(screen.queryByTestId("position-prop")).not.toBeInTheDocument();
  });

  it("should log error and set proper props to map when geolocation access denied", async () => {
    const getCurrentPosition = vi.fn((success, error) => error());
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    render(<Home />);
    await act(async () => {});

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("Access denied!");
    expect(screen.getByTestId("zoom-prop")).toHaveTextContent("0");
    expect(screen.queryByTestId("position-prop")).not.toBeInTheDocument();
  });

  it("should display map with proper zoom and position props", async () => {
    const getCurrentPosition = vi.fn((success, error) =>
      success({
        coords: {
          latitude: 36,
          longitude: 12,
        },
      }),
    );
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    render(<Home />);
    await act(async () => {});

    expect(consoleSpy).toHaveBeenCalledTimes(0);
    expect(screen.getByTestId("zoom-prop")).toHaveTextContent("15");
    expect(screen.getByTestId("position-prop")).toBeInTheDocument();
    expect(screen.getByTestId("position-prop")).toHaveTextContent("3612");
  });
});
