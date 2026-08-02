import PlaceMap from "@/app/ui/PlaceMap";
import { render, screen } from "@testing-library/react";

const flyToBounds = vi.fn();

vi.mock("react-leaflet", () => ({
  useMap: () => ({
    flyToBounds,
  }),
  Marker: ({
    children,
    position,
  }: {
    children: React.ReactNode;
    position: [number, number];
  }) => (
    <div
      data-testid="marker"
      data-latitude={position[0]}
      data-longitude={position[1]}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ZoomControl: vi.fn(),
  TileLayer: vi.fn(),
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker-cluster-group">{children}</div>
  ),
}));

describe("PlaceMap", () => {
  it("should display marker with place name and correct coordinates", () => {
    render(<PlaceMap name="TestPlace" position={[43, 38]} />);

    expect(screen.getByTestId("marker")).toBeInTheDocument();
    expect(screen.getByText("TestPlace")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toHaveAttribute("data-latitude", "43");
    expect(screen.getByTestId("marker")).toHaveAttribute(
      "data-longitude",
      "38",
    );
  });
});
