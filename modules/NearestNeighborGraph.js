import notes from "./Notes.js";
class NearestNeighborGraph {
  loadInitialData(n) {
    this.n = n;
    this.ignore = -1;
    this.restLength = 100;

    this.embeddings = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding) => {
        this.embeddings.push(embedding);
      });
    });

    this.initializeMatricies();

    this.scaledPositions = this.embeddings.map(() => [
      Math.random(),
      Math.random(),
    ]);

    this.positions = this.scaledPositions.map(([x, y]) => [
      x * this.restLength * 4,
      y * this.restLength * 4,
    ]);
  }

  initializeMatricies() {
    this.distanceMatrix = this.embeddings.map((left) =>
      this.getDistances(left)
    );

    this.adjacencyMatrix = this.distanceMatrix.map(() => []);

    this.distanceMatrix.forEach((neighbors, currentIndex) => {
      this.adjacencyMatrix[currentIndex].push(
        ...neighbors.slice(1, this.n + 1).map((n) => n.index)
      );
      neighbors.slice(1, this.n + 1).forEach((neighbor) => {
        this.adjacencyMatrix[neighbor.index].push(currentIndex);
      });
    });

    this.adjacencyMatrix = this.adjacencyMatrix.map((arr) => [...new Set(arr)]);
  }

  getDistances(left) {
    const distances = [];
    this.embeddings.forEach((right, index) => {
      let distance = 0;
      for (let j = 0; j < left.length; j++) {
        distance += (left[j] - right[j]) ** 2;
      }
      distances.push({ distance, index });
    });
    distances.sort((a, b) => a.distance - b.distance);
    return distances;
  }

  update(k) {
    const forces = this.getForces();

    const initialPosition = (1 + this.ignore) % this.positions.length;
    const min = [
      this.positions[initialPosition][0] + forces[initialPosition][0] * k,
      this.positions[initialPosition][1] + forces[initialPosition][1] * k,
    ];
    const max = [
      this.positions[initialPosition][0] + forces[initialPosition][0] * k,
      this.positions[initialPosition][1] + forces[initialPosition][1] * k,
    ];
    for (let index = 0; index < forces.length; index++) {
      if (index != this.ignore) {
        this.positions[index][0] += forces[index][0] * k;
        this.positions[index][1] += forces[index][1] * k;

        
      }

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
    }

    this.min = min;
    this.max = max;

    this.scale = [
      1 / (this.max[0] - this.min[0]),
      1 / (this.max[1] - this.min[1]),
    ];

    this.positions.forEach((position, index) => {
      if (index == this.ignore) {
        this.positions[index][0] =
          this.scaledPositions[index][0] / this.scale[0] + this.min[0];
        this.positions[index][1] =
          this.scaledPositions[index][1] / this.scale[1] + this.min[1];
        return;
      }
      this.scaledPositions[index][0] =
        (position[0] - this.min[0]) * this.scale[0];
      this.scaledPositions[index][1] =
        (position[1] - this.min[1]) * this.scale[1];
    });
  }

  setPositionByPercentage(index, percentageX, percentageY) {
    this.scaledPositions[index][0] = (percentageX - 10) / 80;
    this.scaledPositions[index][1] = (percentageY - 10) / 80;
    this.positions[index][0] =
      this.scaledPositions[index][0] / this.scale[0] + this.min[0];
    this.positions[index][1] =
      this.scaledPositions[index][1] / this.scale[1] + this.min[1];
  }

  getForces() {
    const forces = [];
    const directions = [];
    const scales = [];
    for (let i = 0; i < this.positions.length; i++) {
      forces[i] = [0, 0];
      directions[i] = [];
      scales[i] = [];
    }
    for (let leftIndex = 0; leftIndex < this.positions.length; leftIndex++) {
      for (let rightIndex = 0; rightIndex < leftIndex; rightIndex++) {
        const left = this.positions[leftIndex];
        const right = this.positions[rightIndex];
        const xDiff = right[0] - left[0];
        const yDiff = right[1] - left[1];

        if (xDiff == 0 && yDiff == 0) {
          continue;
        }

        const distanceSquared = xDiff ** 2 + yDiff ** 2;
        const distance = Math.sqrt(distanceSquared);
        const direction = [xDiff / distance, yDiff / distance];
        const scale = this.restLength / distanceSquared;
        directions[leftIndex][rightIndex] = direction;
        scales[leftIndex][rightIndex] = scale;

        const forceX = direction[0] * scale;
        const forceY = direction[1] * scale;

        forces[leftIndex][0] -= forceX;
        forces[leftIndex][1] -= forceY;
        forces[rightIndex][0] += forceX;
        forces[rightIndex][1] += forceY;
      }
    }

    for (let leftIndex = 0; leftIndex < this.positions.length; leftIndex++) {
      for (const rightIndex of this.adjacencyMatrix[leftIndex]) {
        if (
          leftIndex <= rightIndex ||
          (scales[leftIndex] && scales[leftIndex][rightIndex] < 1 / 10000)
        ) {
          continue;
        }

        const forceXAtt =
          directions[leftIndex][rightIndex][0] / scales[leftIndex][rightIndex];
        const forceYAtt =
          directions[leftIndex][rightIndex][1] / scales[leftIndex][rightIndex];
        forces[leftIndex][0] += forceXAtt;
        forces[leftIndex][1] += forceYAtt;
        forces[rightIndex][0] -= forceXAtt;
        forces[rightIndex][1] -= forceYAtt;
      }
    }
    return forces;
  }

  handleNoteChange() {
    console.time("noteChange1");

    console.log("initial distance matrix", this.distanceMatrix[0]);

    const previousEmbeddings = this.embeddings;

    const previousData = this.embeddings.map((e, index) => {
      return {
        embedding: this.embeddings[index],
        position: this.positions[index],
        scaledPosition: this.scaledPositions[index],
        index,
      };
    });

    this.embeddings = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding) => {
        this.embeddings.push(embedding);
      });
    });

    this.positions = this.embeddings.map(() => []);
    this.scaledPositions = this.embeddings.map(() => []);

    const newEmbeddings = [];

    this.embeddings.forEach((embedding, index) => {
      const previousIndex = previousEmbeddings.indexOf(embedding);
      if (previousIndex == -1) {
        newEmbeddings.push(index);

        this.scaledPositions[index] = [
          Math.random() / 1.5 + 1 / 1.5 / 2,
          Math.random() / 1.5 + 1 / 1.5 / 2,
        ];
        if (this.scale) {
          this.positions[index][0] =
            this.scaledPositions[index][0] / this.scale[0] + this.min[0];
          this.positions[index][1] =
            this.scaledPositions[index][1] / this.scale[1] + this.min[1];
        } else {
          this.positions[index][0] =
            this.scaledPositions[index][0] * this.restLength * 4;
          this.positions[index][1] =
            this.scaledPositions[index][1] * this.restLength * 4;
        }
      } else {
        this.positions[index] = previousData[previousIndex].position;
        this.scaledPositions[index] =
          previousData[previousIndex].scaledPosition;
        previousData.splice(previousIndex, 1);
        previousEmbeddings.splice(previousIndex, 1);
      }
    });

    console.log("new embeddings", newEmbeddings);
    console.log("previous embeddings", previousData);

    for (let index = previousData.length - 1; index >= 0; index--) {
      this.distanceMatrix.splice(previousData[index].index, 1);
    }

    console.log("after removing", this.distanceMatrix.length);

    const justIndexes = previousData.map((data) => data.index);

    this.distanceMatrix.forEach((vec) => {
      for (let vecIndex = vec.length - 1; vecIndex >= 0; vecIndex--) {
        if (justIndexes.indexOf(vec[vecIndex].index) != -1) {
          vec.splice(vecIndex, 1);
        } else {
          let running = true;
          for (
            let removedIndex = previousData.length - 1;
            removedIndex >= 0 && running;
            removedIndex--
          ) {
            if (vec[vecIndex].index > previousData[removedIndex].index) {
              vec[vecIndex].index -= removedIndex + 1;
              running = false;
            }
          }

          newEmbeddings.forEach((newIndex) => {
            if (vec[vecIndex].index > newIndex) {
              vec[vecIndex].index++;
            }
          });
        }
      }
    });

    console.log("after adjusting indexes", this.distanceMatrix[0]);

    const addedDistanceMatrix = newEmbeddings.map((i) =>
      this.getDistances(this.embeddings[i])
    );

    console.log("added distance matrix", addedDistanceMatrix);

    newEmbeddings.forEach((index, distanceIndex) => {
      this.distanceMatrix.splice(index, 0, addedDistanceMatrix[distanceIndex]);
    });

    console.log("adding new rows", this.distanceMatrix[0]);

    newEmbeddings.forEach((index, distanceIndex) => {
      addedDistanceMatrix[distanceIndex].forEach((edge) => {
        if (newEmbeddings.indexOf(edge.index) == -1) {
          this.insert(this.distanceMatrix[edge.index], {
            distance: edge.distance,
            index,
          });
        }
      });
    });

    console.log(this.distanceMatrix[0]);

    this.adjacencyMatrix = this.distanceMatrix.map(() => []);

    this.distanceMatrix.forEach((neighbors, currentIndex) => {
      this.adjacencyMatrix[currentIndex].push(
        ...neighbors.slice(1, this.n + 1).map((n) => n.index)
      );
      neighbors.slice(1, this.n + 1).forEach((neighbor) => {
        if (!this.adjacencyMatrix[neighbor.index]) {
          console.log(neighbor.index);
        }
        this.adjacencyMatrix[neighbor.index].push(currentIndex);
      });
    });

    this.adjacencyMatrix = this.adjacencyMatrix.map((arr) => [...new Set(arr)]);

    console.timeEnd("noteChange1");
  }

  insert(edges, edge) {
    let index = edges.findIndex(
      (checkEdge) => edge.distance < checkEdge.distance
    );
    if (index === -1) {
      edges.push(edge);
    } else {
      edges.splice(index, 0, edge);
    }
  }
}

const nearestNeighborGraph = new NearestNeighborGraph();

export default nearestNeighborGraph;
