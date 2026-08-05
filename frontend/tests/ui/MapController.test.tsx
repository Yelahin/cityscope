import { Place } from "@/app/lib/api/types";
import MapController from "@/app/ui/MapController";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MapContainer } from "react-leaflet";
import L from "leaflet";

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
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker-cluster-group">{children}</div>
  ),
}));

describe("MapController", () => {
  it("should display markers for each place", () => {
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
        is_favorite: false,
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
      {
        id: 3,
        name: "TestPlace 3",
        slug: "testplace-3",
        address: "10 Downing Street",
        latitude: 51.5033635,
        longitude: -0.1276248,
        rating: 3.2,
        price_level: null,
        opening_status: null,
        city: { id: 1, name: "TestCity" },
        category: { id: 1, name: "TestCategory" },
        sourcerecord: 1,
        is_favorite: false,
      },
      {
        id: 4,
        name: "TestPlace 4",
        slug: "testplace-4",
        address: null,
        latitude: 51.4994794,
        longitude: -0.1245355,
        rating: null,
        price_level: null,
        opening_status: null,
        city: { id: 1, name: "TestCity" },
        category: { id: 1, name: "TestCategory" },
        sourcerecord: 1,
        is_favorite: true,
      },
      {
        id: 5,
        name: "TestPlace 5",
        slug: "testplace-5",
        address: "1 Trafalgar Square",
        latitude: 51.5080498,
        longitude: -0.1329696,
        rating: 5,
        price_level: null,
        opening_status: null,
        city: { id: 1, name: "TestCity" },
        category: { id: 1, name: "TestCategory" },
        sourcerecord: 1,
        is_favorite: false,
      },
    ];
    const markersRef = { current: {} };
    render(
      <MapContainer>
        <MapController places={places} markersRef={markersRef} />
      </MapContainer>,
    );

    expect(screen.getAllByTestId("marker")).toHaveLength(5);
    expect(screen.getByText(`Name: ${places[0].name}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${places[1].name}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${places[2].name}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${places[3].name}`)).toBeInTheDocument();
    expect(screen.getByText(`Name: ${places[4].name}`)).toBeInTheDocument();
    expect(screen.getAllByText(`City: ${places[0].city["name"]}`)).toHaveLength(
      5,
    );
    expect(
      screen.getAllByText(`Category: ${places[0].category["name"]}`),
    ).toHaveLength(5);
  });

  it("should trigger flyToBounds when places change", async () => {
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
        is_favorite: false,
      },
    ];
    const markersRef = { current: {} };
    render(
      <MapContainer>
        <MapController places={places} markersRef={markersRef} />
      </MapContainer>,
    );

    expect(flyToBounds).toHaveBeenCalledTimes(1);
    expect(flyToBounds).toHaveBeenCalledWith(
      L.latLngBounds([[places[0].latitude, places[0].longitude]]),
      { maxZoom: 14, duration: 2, padding: [100, 100] },
    );
  });

  it("should not be trigger flyToBounds when places is empty", () => {
    const places = [] as Place[];
    const markersRef = { current: {} };
    render(
      <MapContainer>
        <MapController places={places} markersRef={markersRef} />
      </MapContainer>,
    );

    expect(flyToBounds).toHaveBeenCalledTimes(0);
  });
});
