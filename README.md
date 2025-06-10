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

## Endpoints

### 1. Get All Drivers with Pagination

*   **Endpoint:** `GET /drivers`
*   **Description:** Retrieves a paginated list of drivers.
*   **Query Parameters:**
    *   `page` (optional, integer): Pagination number. Used to retrieve the next set of results. Default is 1.
    *   `limit` (optional, integer): Maximum number of drivers to return per page. Default is 10.
    *   `status` (optional, enum): Filter drivers by status. Possible values: `Available`, `Unavailable`, `InService`, `Inactive`.
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
    *   `nextCursor` (string | null): Cursor for the next page, or null if there are no more pages.

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
