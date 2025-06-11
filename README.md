# Taxi24 API Documentation

## Introduction

Technical test: Carlos Aponte

## Base URL

All endpoints are relative to the base URL: `http://localhost:3000`

## Setup Instructions

1.  **Clone the repository from Git:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies using npm:**

    ```bash
    npm install
    ```

3.  **Run Project using npm:**

    ```bash
    npm run start:dev
    ```    

4.  **Run Test using npm:**

    ```bash
    npm run test
    ```        

## Endpoints

### 1. Get All Drivers with Pagination

*   **Endpoint:** `GET /drivers`
*   **Description:** Retrieves a paginated list of drivers.
*   **Query Parameters:**
    *   `page` (optional, integer): Pagination number. Used to retrieve the next set of results. Default is 1.
    *   `limit` (optional, integer): Maximum number of drivers to return per page. Default is 10.
    *   `status` (optional, enum): Filter drivers by status. Possible values: `Available`, `Unavailable`, `TripInProgress`, `Inactive`.
    *   `lat` (optional, number): Latitude for location-based search.
    *   `lon` (optional, number): Longitude for location-based search.
    *   `max-distance` (optional, integer): Maximum distance (in kilometers) from the specified location. Default is 3.

*   **Examples:**

    *   **Get a list of all drivers:**

        ```
        GET /drivers
        ```

    *   **Get a list of all available drivers:**

        ```
        GET /drivers?status=Available
        ```

    *   **Get a list of all available drivers within a 3km radius of a specific location:**

        ```
        GET /drivers?status=Available&lat=10.5061&lon=-66.9036&max-distance=3
        ```
    *   **Get the next page of drivers:**

        ```
        GET /drivers?page=2&limit=10
        ```

*   **Response:**

    ```json
    {
      "items": [
        {
          "id": "6847a17c22186096e6abfce6",
          "name": "Carlos",
          "lastName": "Martínez",
          "status": "Available",
          "lastCoordinates": {
            "type": "Point",
            "coordinates": [
              -66.9036,
              10.5061
            ]
          },
          "createdAt": "2025-06-09T12:30:00.000Z",
        },
        ...
      ],
      "totalRecords": 18,
      "totalPages": 2,
      "hasNextPage": true
    }
    ```

*   **Response Fields:**

    *   `items` (array): Array of driver objects.
    *   `totalRecords` (number): Total number of drivers matching the query.
    *   `hasNextPage` (boolean): Indicates if there is a next page of results.
    *   `totalPages` (number): total of pages.

### 2. Get Driver by ID

*   **Endpoint:** `GET /drivers/:id`
*   **Description:** Retrieves a specific driver by ID.
*   **Path Parameter:**
    *   `id` (required, string): The ID of the driver to retrieve. Must be a valid MongoDB ObjectId.

*   **Request Example:**

    ```
    GET /drivers/6847a17c22186096e6abfce6
    ```

*   **Response:**

    ```json
    {
      "id": "6847a17c22186096e6abfce6",
      "name": "Carlos",
      "lastName": "Martínez",
      "status": "Available",
      "lastCoordinates": {
          "type": "Point",
          "coordinates": [
              -66.9036,
              10.5061
          ]
      },
      "createdAt": "2025-06-09T12:30:00.000Z",
    }
    ```

*   **Error Responses:**

    *   404 Not Found: If the driver with the specified ID does not exist.

### 3. Create a New Trip

*   **Endpoint:** `POST /trips`
*   **Description:** Creates a new trip request, assigning a driver to a passenger.
*   **Request Body:**
    ```json
    {
        "driverId": "6847a17c22186096e6abfce6",
        "passengerId": "68487c68917813bbbbb36f7c",
        "startCoordinates": [-66.9036, 10.5061],
        "destinationCoordinates": [-66.9005, 10.5092],
        "paymentType": "Cash",
        "tip": 2.5,
    }
    ```
*   **Response:**
    ```json
    {
      "id": "6848b17c22186096e6abfce7",
      "driver": "6847a17c22186096e6abfce6",
      "passenger": "68487c68917813bbbbb36f7c",
      "status": "Active",
      "startCoordinates": { "type": "Point", "coordinates": [-66.9036, 10.5061] },
      "destinationCoordinates": { "type": "Point", "coordinates": [-66.9005, 10.5092] },
      "price": 10.5,
      "tip": 2.5,
      "paymentType": "Cash",
      "distance": 1.2,
      "startAt": "2025-06-09T12:40:00.000Z",
      "createdAt": "2025-06-09T12:40:00.000Z"
    }
    ```

---

### 4. Complete a Trip

*   **Endpoint:** `PATCH /trips/:id/complete`
*   **Description:** Completes an active trip by its ID.
*   **Path Parameter:**
    *   `id` (required, string): The ID of the trip to complete.

*   **Request Example:**
    ```
    PATCH /trips/6848b17c22186096e6abfce7/complete
    ```

*   **Response:**
    ```json
    {
      "id": "6848b17c22186096e6abfce7",
      "status": "Completed",
      "completedAt": "2025-06-09T13:00:00.000Z",
      ...
    }
    ```

*   **Error Responses:**
    *   404 Not Found: If the trip with the specified ID does not exist.
    *   400 Bad Request: If the trip is not active.

---

### 5. Get All Active Trips

*   **Endpoint:** `GET /trips`
*   **Description:** Retrieves a paginated list of all active trips.
*   **Query Parameters:**
    *   `page` (optional, integer): Pagination number. Default is 1.
    *   `limit` (optional, integer): Maximum number of trips per page. Default is 10.
    *   `status` (optional, string): Filter by trip status. Use `Active` to get active trips.

*   **Example:**
    ```
    GET /trips?status=Active
    ```

*   **Response:**
    ```json
    {
      "items": [
        {
          "id": "6848b17c22186096e6abfce7",
          "driver": {
            "id": "6847a17c22186096e6abfce6",
            "name": "Carlos",
            "lastName": "Martínez",
            "status": "TripInProgress",
            "lastCoordinates": {
                "type": "Point",
                "coordinates": [
                    -66.9036,
                    10.5061
                ]
            },
            "createdAt": "2025-06-09T12:30:00.000Z",
            "updatedAt": "2025-06-11T03:12:33.611Z",
          },
          "passenger": {
            "name": "Ana",
            "lastName": "Ramírez",
            "status": "TripInProgress",
            "createdAt": "2025-06-09T12:45:00.000Z",
            "updatedAt": "2025-06-11T03:12:33.704Z",
            "id": "68487c68917813bbbbb36f7c"
          },
          "status": "Active",
          "startCoordinates": { "type": "Point", "coordinates": [-66.9036, 10.5061] },
          "destinationCoordinates": { "type": "Point", "coordinates": [-66.9005, 10.5092] },
          "price": 10.5,
          "tip": 2.5,
          "paymentType": "Cash",
          "distance": 1.2,
          "startAt": "2025-06-09T12:40:00.000Z",
          "createdAt": "2025-06-09T12:40:00.000Z"
        }
      ],
      "totalRecords": 1,
      "totalPages": 1,
      "hasNextPage": false
    }
    ```

### 6. Get All Passengers with Pagination

*   **Endpoint:** `GET /passengers`
*   **Description:** Retrieves a paginated list of passengers.
*   **Query Parameters:**
    *   `page` (optional, integer): Pagination number. Used to retrieve the next set of results. Default is 1.
    *   `limit` (optional, integer): Maximum number of passengers to return per page. Default is 10.
    *   `status` (optional, enum): Filter passengers by status. Possible values: `Available`, `TripInProgress`.

### 7. Get Passengers by ID

*   **Endpoint:** `GET /passengers/:id`
*   **Description:** Retrieves a specific passengers by ID.
*   **Path Parameter:**
    *   `id` (required, string): The ID of the passengers to retrieve. Must be a valid MongoDB ObjectId.

*   **Request Example:**

    ```
    GET /drivers/68487c68917813bbbbb36f7a
    ```

*   **Response:**

    ```json
    {
        "id": "68487c68917813bbbbb36f7a",
        "name": "María",
        "lastName": "González",
        "status": "Available",
        "createdAt": "2025-06-09T12:35:00.000Z"
    }
    ```

*   **Error Responses:**

    *   404 Not Found: If the passenger with the specified ID does not exist.

### 8. Get Nearest Drivers for a Passenger's Requested Trip

*   **Endpoint:** `GET /drivers/nearby`
*   **Description:** Retrieves a list of the 3 nearest drivers to a passenger's starting point.
*   **Query Parameters:**

    *   `page` (optional, integer): Pagination number. Used to retrieve the next set of results. Default is 1.
    *   `limit` (optional, integer): Maximum number of drivers to return per page. Default is 3.
    *   `lat` (required, number): Latitude of the passenger's starting point.
    *   `lon` (required, number): Longitude of the passenger's starting point.
    *   `max-distance` (optional, integer): Maximum distance (in kilometers) from the specified location. Default is 3.
*   **Example:**

    ```
    GET /drivers/nearby?lat=10.5061&lon=-66.9036
    ```    

*   **Response:**

    ```json
    {
        "items": [
            {
                "_id": "6847a17c22186096e6abfce6",
                "name": "Carlos",
                "lastName": "Martínez",
                "status": "Available",
                "lastCoordinates": {
                    "type": "Point",
                    "coordinates": [
                        -66.9036,
                        10.5061
                    ]
                },
                "createdAt": "2025-06-09T12:30:00.000Z",
                "distance": 0
            },
            ...
        ],
        "totalRecords": 10,
        "hasNextPage": true,
        "totalPages": 4
    }
    ```
