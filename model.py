import numpy as np
from sklearn.cluster import KMeans
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/cluster-passengers', methods=['POST'])
def cluster_passengers():
    data = request.get_json()
    
    passengers = np.array(data)

    k = 1
    max_k = 10
    walking_distance = 3 

    while k <= max_k:
        kmeans = KMeans(n_clusters=k, random_state=0)

        kmeans.fit(passengers)

        centers = kmeans.cluster_centers_
        labels = kmeans.labels_

        distances = np.linalg.norm(passengers - centers[labels], axis=1)

        if np.all(distances < walking_distance):
            break

        k += 1

    if k > max_k:
        return jsonify({"status": "error", "message": "Could not fit all passengers within the specified distance with the maximum number of clusters."}), 400

    unique_labels, counts = np.unique(labels, return_counts=True)

    bus_capacity = 10
    
    for i in range(len(counts)):
        if counts[i] > bus_capacity:
            counts[i] -= bus_capacity
            counts = np.append(counts, bus_capacity)
            centers = np.vstack([centers, centers[i]])

    routes = generate_routes(counts, centers)

    result = {
        "clusterCenters": centers.tolist(),
        "labels": labels.tolist(),
        "clusterCounts": counts.tolist()
    }

    result["routes"] = []
    for route in routes:
        result["routes"].append([int(item) for item in route]) 

    return jsonify(result)

def generate_routes(counts, centers):
    depot = np.array([10, 10])

    bus_capacity = 10

    def calculate_distances(depot, centers):
        depot = np.array(depot)
        centers = np.array(centers)
        distances = np.linalg.norm(centers - depot, axis=1)
        return distances
    
    def create_routes(depot, centers, counts, bus_capacity):
        distances = calculate_distances(depot, centers)
        routes = []
        sorted_indices = np.argsort(distances)

        stops = [(idx, counts[idx]) for idx in sorted_indices]

        while stops:
            current_route = []
            current_load = 0

            for i in range(len(stops)):
                idx, count = stops[i]
                if current_load + count <= bus_capacity:
                    current_route.append(idx)
                    current_load += count

            if not current_route:
                idx, count = stops[0]
                if count > bus_capacity:
                    raise ValueError(f"Cannot accommodate {count} passengers at stop {idx} as it exceeds bus capacity.")
                current_route.append(idx)
                current_load += count

            routes.append(current_route)
            stops = [stop for stop in stops if stop[0] not in current_route]

        return routes

    routes = create_routes(depot, centers, counts, bus_capacity)

    return routes

if __name__ == '__main__':
    app.run(debug=True)
