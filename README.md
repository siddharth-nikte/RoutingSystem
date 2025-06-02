
# Routing System

This project provides a solution for optimizing passenger transportation by clustering them and generating bus routes through a web interface. 

Features
-  **Passenger Clustering:** Uses K-Means clustering to group passengers based on their locations. The algorithm dynamically determines the optimal number of clusters based on a walking distances.

-  **Bus Stop Generation:** Generates optimal bus stop locations using cluster centers.

-  **Route Generation:** Creates efficient bus routes, considering bus capacity, by prioritizing closer stops to the depot.

-  **Interactive Map:** A visual grid interface allows users to plot passenger locations and visualize the generated clusters, bus stops, and routes.

# Installation
1. Clone the repository.
2. Create a virtual environment:   
    
    ```python -m venv venv```

    ```source venv/bin/activate. On Windows, use venv\Scripts\activate```

3. Install dependencies:

    ```pip install numpy scikit-learn Flask Flask-Cors```

4. Run the Flask application:

   ```model.py```

# Usage
### Mark passenger Locations:
-  Click on the grid to place passenger locations. Each click will draw a magenta dot representing a passenger.
-  The "Coordinates" display will show the grid coordinates of your mouse cursor.
-  Use the "Sample passengers" button to load a predefined set of passenger locations for quick testing.

### Generate Bus Stops and Routes:
-  Click the "Create Stops" button. This will send the passenger location data to the Flask API.
-  The API will process the data, perform clustering, and generate bus routes.
-  The frontend will then display the red bus stops, white depot, and colored bus routes connecting the depot to the stops and back. Dotted lines connect passengers to their assigned bus stops.

# Logic Details
### Backend
-  K-Means Clustering: The cluster_passengers endpoint uses sklearn.cluster.KMeans to group passengers. It iteratively increases the number of clusters (k) from 1 to max_k (10 by default) until all passengers are within a walking_distance (3 units by default) of their assigned cluster center.
-  Bus Capacity Handling: If a cluster has more passengers than bus_capacity (10 by default), it is split, and an additional "stop" is created for the overflowing passengers.
-  Route Generation (generate_routes):
    -  Calculates distances of cluster centers from a fixed depot ([10, 10]).
    -  Sorts stops by their distance from the depot.
    -  Creates routes by assigning stops to buses based on bus_capacity, prioritizing closer stops.

### Frontend
-  Canvas Drawing: Uses HTML Canvas to draw the grid, passenger points, bus stops, and routes.
-  Coordinate System: The grid uses a custom coordinate system where (0,0) is the top-left and (cols, rows) is the bottom-right.
-  Visualizations:
    -  Magenta dots: passenger locations.
    -  Red dots: Bus stop locations (cluster centers).
    -  White dot: Depot location.
    -  Colored solid lines: Bus routes from the depot, through bus stops, and back to the depot. Different colors represent different routes.
    -  Gray dotted lines: Connect each passenger to their assigned bus stop.

 # Screenshots
 ![screenshot1](https://github.com/siddharth-nikte/RoutingSystem/blob/main/Images/screenshot1.png?raw=true)
 
 ![screenshot2](https://github.com/siddharth-nikte/RoutingSystem/blob/main/Images/screenshot2.png?raw=true)
 
 ![screenshot3](https://github.com/siddharth-nikte/RoutingSystem/blob/main/Images/screenshot3.png?raw=true)
