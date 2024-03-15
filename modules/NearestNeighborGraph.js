import instances from "./NeumeEngine.js";
import notes from "./Notes.js";
import projectToTopTwoPCA from "./PCA.js";
class NearestNeighborGraph {
  loadInitialData(n) {
    this.restLength = 100;

    const embeddings = [];
    const embeddingsSlice = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding) => {
        embeddings.push({ embedding, note });
        embeddingsSlice.push(embedding.slice(0, 100));
      });
    });

    this.scaledPositions = embeddings.map(() => [
      Math.random(),
      Math.random()
    ]);


    this.positions = this.scaledPositions.map(([x,y]) => [
      x * this.restLength * 0.1,
      y * this.restLength * 0.1,
    ]);

    const nearest = embeddings.map(({ embedding, note }) =>
      this.nearestIndexes(embedding, embeddings, note)
    );

    this.nearestMatrix = nearest.map(() => []);

    nearest.forEach((neighbors, currentIndex) => {
      this.nearestMatrix[currentIndex].push(...neighbors.slice(1, n + 1));
      neighbors.slice(1, n + 1).forEach((neighbor) => {
        this.nearestMatrix[neighbor].push(currentIndex);
      });
    });

    this.nearestMatrix = this.nearestMatrix.map((arr) => [...new Set(arr)]);

    this.velocities = embeddings.map((e) => {
      return [0, 0];
    });

    this.scaledPositions = embeddings.map((e) => {
      return [0, 0];
    });
    console.log(this.positions);
    console.log(this.nearestMatrix);
  }

  update(k) {
    const forces = this.getForces();

    const min = [
      this.positions[0][0] + forces[0][0],
      this.positions[0][1] + forces[0][1],
    ];
    const max = [
      this.positions[0][0] + forces[0][0],
      this.positions[0][1] + forces[0][1],
    ];
    const cooling = this.cooling(0.01, 0.2, k);
    forces.forEach((force, index) => {
      this.positions[index][0] += force[0] * cooling;
      this.positions[index][1] += force[1] * cooling;

      if (this.positions[index][0] < min[0]) {
        min[0] = this.positions[index][0];
      }
      if (this.positions[index][1] < min[1]) {
        min[1] = this.positions[index][1];
      }
      if (this.positions[index][0] > max[0]) {
        max[0] = this.positions[index][0];
      }
      if (this.positions[index][1] > max[1]) {
        max[1] = this.positions[index][1];
      }
    });

    const scale = [1 / (max[0] - min[0]), 1 / (max[1] - min[1])];

    this.positions.forEach((position, index) => {
      this.scaledPositions[index][0] = position[0];
      this.scaledPositions[index][1] = position[1];
      this.scaledPositions[index][0] -= min[0];
      this.scaledPositions[index][1] -= min[1];
      this.scaledPositions[index][0] *= scale[0];
      this.scaledPositions[index][1] *= scale[1];
    });
  }

  cooling(minTemp, maxTemp, k) {
    const ratio = maxTemp / minTemp;
    const rounds = 2000;
    const atMax = 500;
    return k < atMax
      ? minTemp * Math.pow(ratio, 1 / atMax) ** k
      : maxTemp * Math.pow(1 / ratio, 1 / (rounds - atMax)) ** (k - atMax);
  }

  getForces() {
    const forces = [];
    this.positions.forEach((left, leftIndex) => {
      const force = [0, 0];
      this.positions.forEach((right, rightIndex) => {
        const xDiff = right[0] - left[0];
        const yDiff = right[1] - left[1];

        if (xDiff == 0 && yDiff == 0) {
          return;
        }

        const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);

        if (distance < 0.1) {
          return;
        }

        const direction = [xDiff / distance, yDiff / distance];

        force[0] -= (direction[0] * this.restLength) / distance ** 2;
        force[1] -= (direction[1] * this.restLength) / distance ** 2;

        if (this.nearestMatrix[leftIndex].indexOf(rightIndex) != -1) {
          force[0] += (direction[0] * distance ** 2) / this.restLength;
          force[1] += (direction[1] * distance ** 2) / this.restLength;
        }
      });
      forces.push(force);
    });
    return forces;
  }

  nearestIndexes(currentEmbedding, embeddings, currentNote) {
    const distances = embeddings
      .map(({ embedding, note }, index) => {
        let distance = note == currentNote ? 0 : 0;
        for (let j = 0; j < embedding.length; j++) {
          distance += (currentEmbedding[j] - embedding[j]) ** 2;
        }
        return { index, distance };
      })
      .flat();
    console.log("distances", distances);
    distances.sort((a, b) => a.distance - b.distance);
    return distances.map((distance) => distance.index);
  }
}

const nearestNeighborGraph = new NearestNeighborGraph();
instances.nearestNeighborGraph = nearestNeighborGraph;

export default nearestNeighborGraph;
