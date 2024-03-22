import notes from "./Notes.js";
class NearestNeighborGraph {
  loadInitialData(n) {
    this.n = n;
    this.ignore = -1;
    this.restLength = 100;
    
    this.embeddings = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding) => {
        this.embeddings.push({ embedding, note });
      });
    });

    const nearest = this.embeddings.map(({ embedding, note }) =>
      this.nearestIndexes(embedding, note)
    );

    this.nearestMatrix = nearest.map(() => []);

    nearest.forEach((neighbors, currentIndex) => {
      this.nearestMatrix[currentIndex].push(...neighbors.slice(1, n + 1));
      neighbors.slice(1, n + 1).forEach((neighbor) => {
        this.nearestMatrix[neighbor].push(currentIndex);
      });
    });

    this.nearestMatrix = this.nearestMatrix.map((arr) => [...new Set(arr)]);

    this.scaledPositions = this.embeddings.map(() => [
      Math.random(),
      Math.random(),
    ]);

    this.positions = this.scaledPositions.map(([x, y]) => [
      x * this.restLength * 4,
      y * this.restLength * 4,
    ]);
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
    forces.forEach((force, index) => {
      if (index != this.ignore) {
        this.positions[index][0] += force[0] * k;
        this.positions[index][1] += force[1] * k;
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
    });

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
    const forces = this.positions.map(() => [0, 0]);
    this.positions.forEach((left, leftIndex) => {
      const directions = [];
      const scales = [];
      this.positions.forEach((right, rightIndex) => {
        if (leftIndex <= rightIndex) {
          return;
        }

        const xDiff = right[0] - left[0];
        const yDiff = right[1] - left[1];

        if (xDiff == 0 && yDiff == 0) {
          return;
        }

        const distanceSquared = xDiff ** 2 + yDiff ** 2;
        const distance = Math.sqrt(distanceSquared);
        const direction = [xDiff / distance, yDiff / distance];
        const scale = this.restLength / distanceSquared;
        directions[rightIndex] = direction;
        scales[rightIndex] = scale;

        if(distance > 500) {
          return;
        }
        const forceX = direction[0] * scale;
        const forceY = direction[1] * scale;
        
        forces[leftIndex][0] -= forceX;
        forces[leftIndex][1] -= forceY;
        forces[rightIndex][0] += forceX;
        forces[rightIndex][1] += forceY;
      });

      this.nearestMatrix[leftIndex].forEach((rightIndex) => {
        if(leftIndex <= rightIndex || scales[rightIndex] < 1 / 10000) {
          return;
        }

        const forceXAtt = directions[rightIndex][0] / scales[rightIndex];
        const forceYAtt = directions[rightIndex][1] / scales[rightIndex];
        forces[leftIndex][0] += forceXAtt;
        forces[leftIndex][1] += forceYAtt;
        forces[rightIndex][0] -= forceXAtt;
        forces[rightIndex][1] -= forceYAtt;
      });
    });
    return forces;
  }

  nearestIndexes(currentEmbedding, currentNote) {
    const distances = this.embeddings
      .map(({ embedding, note }, index) => {
        let distance = note == currentNote ? 0 : 0;
        for (let j = 0; j < embedding.length; j++) {
          distance += (currentEmbedding[j] - embedding[j]) ** 2;
        }
        return { index, distance };
      })
      .flat();
    distances.sort((a, b) => a.distance - b.distance);
    return distances.map((distance) => distance.index);
  }

  handleNoteChange() {
    console.time("noteChange1");
    const previousEmbeddings = this.embeddings.map(
      ({ embedding }) => embedding
    );
    const previousPositions = this.positions;
    const previousScaledPositions = this.scaledPositions;

    this.loadInitialData(this.n);

    this.embeddings.forEach(({ embedding }, index) => {
      const previousIndex = previousEmbeddings.indexOf(embedding);
      if (previousIndex == -1) {
        if(this.scale){
          this.scaledPositions[index] = [Math.random() / 1.5 + 1/1.5/2, Math.random() / 1.5 + 1/1.5/2];

          this.positions[index][0] =
            this.scaledPositions[index][0] / this.scale[0] + this.min[0];
          this.positions[index][1] =
            this.scaledPositions[index][1] / this.scale[1] + this.min[1];
        }
        return;
      }
      this.positions[index] = previousPositions[previousIndex];
      this.scaledPositions[index] = previousScaledPositions[previousIndex];
    });
    console.timeEnd("noteChange1");
  }
}

const nearestNeighborGraph = new NearestNeighborGraph();

export default nearestNeighborGraph;
