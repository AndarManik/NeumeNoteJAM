import instances from "./NeumeEngine.js";
import notes from "./Notes.js";
class NearestNeighborGraph {
  loadInitialData() {
    const embeddings = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding) => {
        embeddings.push(embedding);
      });
    });

    this.nearestMatrix = embeddings.map((embedding) =>
      this.nearestIndexes(embedding, embeddings)
    );
    this.positions = embeddings.map((e) => {
      return [Math.random(), Math.random()];
    });
    this.velocities = embeddings.map((e) => {
      return [0, 0];
    });

    this.scaledPositions = embeddings.map((e) => {
      return [0, 0];
    });

    console.log(this.nearestMatrix);
  }

  update(n, k) {
    const forces = this.getForces(n);

    const min = [this.positions[0][0], this.positions[0][1]];
    const max = [this.positions[0][0], this.positions[0][1]];

    forces.forEach((force, index) => {
      this.positions[index][0] += force[0] * 0.99 ** k;
      this.positions[index][1] += force[1] * 0.99 ** k;

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

  getForces(n) {
    const forces = [];
    this.nearestMatrix.forEach((nearest, nearestIndex) => {
      const force = [0, 0];
      const restLength = 1; // This value can be adjusted based on your simulation needs.
      const springConstant = 1; // This value determines the stiffness of the spring.
      const repulsiveConstant = 2;
      const dampingCoefficient = 0; // This value can be fine-tuned for your simulation.

      nearest.forEach((near, index) => {
        const xDiff = this.positions[near][0] - this.positions[nearestIndex][0];
        const yDiff = this.positions[near][1] - this.positions[nearestIndex][1];

        if (xDiff == 0 && yDiff == 0) {
          return;
        }
        const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
        // Apply Hooke's Law for the strength calculation
        const displacement = Math.log(distance / restLength);
        const springForce = springConstant * displacement;

        const norm = Math.sqrt(xDiff ** 2 + yDiff ** 2);
        const direction = [xDiff / norm, yDiff / norm];

        if (index > n) {
          force[0] += (-repulsiveConstant * direction[0]) / distance ** 2;
          force[1] += (-repulsiveConstant * direction[1]) / distance ** 2;
          return;
        }

        force[0] += direction[0] * springForce;
        force[1] += direction[1] * springForce;
      });
      console.log("force", force);
      forces.push(force);
    });
    return forces;
  }

  nearestIndexes(currentEmbedding, embeddings) {
    const distances = embeddings
      .map((embedding, index) => {
        let distance = 0;
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
