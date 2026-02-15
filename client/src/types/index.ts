export interface ConnectorBackend {
    id: string;
    port_number: number;
    connector_type: string;
    max_power_kw: number;
    price_per_kwh: number;
    status: 'available' | 'occupied' | 'out_of_order';
}

export interface Connector {
    id: string;
    type: string;
    status: 'Available' | 'In Use' | 'Unavailable';
    power: string;
    image: string;
}

export interface Station {
    id: number;
    name: string;
    address: string;
    distance: string;
    time: string;
    chargerType: string;
    price: string;
    parking: string;
    image: string;
    available: boolean;
    lat: number;
    lng: number;
    connectors?: ConnectorBackend[];
}
