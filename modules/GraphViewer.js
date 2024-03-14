import instances from "./NeumeEngine.js";
import notes from "./Notes.js";
import projectToTopTwoPCA from "./PCA.js";
import Thought from "./chunkviewercomponents/Thought.js";
import nearestNeighborGraph from "./NearestNeighborGraph.js";
class GraphViewer {
  constructor() {
    this.state = "editor";
    this.thought = new Thought({});
  }

  updateGraph(n = 100) {
    if (!notes.notes.length) {
      return;
    }
    const embeddings = [];
    const noteThought = [];
    const indexes = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding, index) => {
        embeddings.push(embedding.slice(0, n));
        noteThought.push(note);
        indexes.push(index);
      });
    });

    const pcaProject = projectToTopTwoPCA(embeddings);

    const data = [];
    pcaProject[0].forEach((value, index) => {
      data.push([value, pcaProject[1][index]]);
    });

    let minX = data[0][0],
      maxX = data[0][0];
    let minY = data[0][1],
      maxY = data[0][1];
    data.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const rightSection = document.getElementById("rightSection");
    const graphSection = document.getElementById("graphSection");
    const sectionWidth = graphSection.clientWidth;
    const sectionHeight = graphSection.clientHeight;
    const elementRatio = sectionWidth / sectionHeight;
    const dataRatio = (maxX - minX) / (maxY - minY);

    if (
      (elementRatio < 1 && dataRatio > 1) ||
      (elementRatio > 1 && dataRatio < 1)
    ) {
      data.forEach((point) => {
        [point[0], point[1]] = [point[1], point[0]];
      });
      [minX, minY] = [minY, minX];
      [maxX, maxY] = [maxY, maxX];
    }

    graphSection.innerHTML = "";

    data.forEach((datum, index) => {
      const point = document.createElement("div");
      point.classList.add("editorTab");
      point.style.position = "absolute";

      const x = (datum[0] - minX) / (maxX - minX);
      const y = (datum[1] - minY) / (maxY - minY);

      point.style.left = `calc(${x * 80 + 10}% - 11px)`;
      point.style.top = `calc(${y * 80 + 10}% - 11px)`;
      point.style.background = noteThought[index].color;
      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      thought.style.position = "absolute";
      point.style.zIndex = "1";

      if (x > 0.5) {
        thought.style.right = `50%`;
      } else {
        thought.style.left = `50%`;
      }

      if (y > 0.5) {
        thought.style.bottom = `50%`;
      } else {
        thought.style.top = `50%`;
      }

      thought.style.display = "none";

      point.addEventListener("mouseover", (e) => {
        thought.style.display = "block";
        point.style.zIndex = "1000";
      });

      point.addEventListener("mouseout", (e) => {
        thought.style.display = "none";
        point.style.zIndex = "1";
      });

      point.append(thought);

      graphSection.appendChild(point);
    });

    rightSection.append(graphSection);
  }

  async displayGraph() {
    const n = 6;
    if (this.state == "graph" || !notes.notes.length) {
      return;
    }

    this.state = "graph";

    nearestNeighborGraph.loadInitialData();

    const noteThought = [];
    const indexes = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding, index) => {
        noteThought.push(note);
        indexes.push(index);
      });
    });

    const rightSection = document.getElementById("rightSection");

    this.editor = [...rightSection.children];
    rightSection.innerHTML = "";

    const graphSection = document.createElement("div");
    graphSection.id = "graphSection";

    nearestNeighborGraph.positions.forEach((position, index) => {
      const point = document.createElement("div");
      point.classList.add("editorTab");
      point.style.position = "absolute";

      const x = position[0];
      const y = position[1];

      point.style.left = `calc(${x * 80 + 10}% - 11px)`;
      point.style.top = `calc(${y * 80 + 10}% - 11px)`;
      point.style.background = noteThought[index].color;
      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      thought.style.position = "absolute";
      point.style.zIndex = "1";

      if (x > 0.5) {
        thought.style.right = `50%`;
      } else {
        thought.style.left = `50%`;
      }

      if (y > 0.5) {
        thought.style.bottom = `50%`;
      } else {
        thought.style.top = `50%`;
      }

      thought.style.display = "none";

      point.addEventListener("mouseover", (e) => {
        thought.style.display = "block";
        point.style.zIndex = "1000";
      });

      point.addEventListener("mouseout", (e) => {
        thought.style.display = "none";
        point.style.zIndex = "1";
      });

      point.append(thought);
      graphSection.appendChild(point);
    });

    const lines = [];

    nearestNeighborGraph.nearestMatrix.forEach((nearest, rightIndex) => {
        nearest.forEach((leftIndex, index) => {
            if(index < n) {
                lines.push(this.connectElementsWithLine(graphSection.children[leftIndex], graphSection.children[rightIndex]));
            }
        })
    })

    rightSection.append(graphSection);

    for (let index = 0; index < 300; index++) {
      await new Promise((resolve) => setTimeout(resolve, 1));
      console.log("loop");
      nearestNeighborGraph.update(n, index);
      graphSection.childNodes.forEach((child, childIndex) => {
        const x = nearestNeighborGraph.scaledPositions[childIndex][0];
        const y = nearestNeighborGraph.scaledPositions[childIndex][1];

        child.style.left = `calc(${x * 80 + 10}% - 11px)`;
        child.style.top = `calc(${y * 80 + 10}% - 11px)`;
      });
      lines.forEach(line => line());
    }

    graphSection.childNodes.forEach((child, childIndex) => {
      const x = nearestNeighborGraph.scaledPositions[childIndex][0];
      const y = nearestNeighborGraph.scaledPositions[childIndex][1];

      if (x > 0.5) {
        child.firstChild.style.right = `50%`;
      } else {
        child.firstChild.style.left = `50%`;
      }

      if (y > 0.5) {
        child.firstChild.style.bottom = `50%`;
      } else {
        child.firstChild.style.top = `50%`;
      }
    });
  }

  connectElementsWithLine(element1, element2) {
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    );
    document.body.appendChild(svg);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("id", "connectionLine");
    line.setAttribute("style", "stroke: var(--left); stroke-width: 1");
    svg.appendChild(line);

    function updateLine() {
      var elem1 = element1.getBoundingClientRect();
      var elem2 = element2.getBoundingClientRect();
      line.setAttribute("x1", elem1.left + elem1.width / 2);
      line.setAttribute("y1", elem1.top + elem1.height / 2);
      line.setAttribute("x2", elem2.left + elem2.width / 2);
      line.setAttribute("y2", elem2.top + elem2.height / 2);
    }

    updateLine(); // Update line position immediately
    return updateLine;
  }

  displayGraphf(n = 100) {
    if (this.state == "graph" || !notes.notes.length) {
      return;
    }

    this.state = "graph";

    const embeddings = [];
    const noteThought = [];
    const indexes = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding, index) => {
        embeddings.push(embedding.slice(0, n));
        noteThought.push(note);
        indexes.push(index);
      });
    });

    const pcaProject = projectToTopTwoPCA(embeddings);

    const data = [];
    pcaProject[0].forEach((value, index) => {
      data.push([value, pcaProject[1][index]]);
    });

    let minX = data[0][0],
      maxX = data[0][0];
    let minY = data[0][1],
      maxY = data[0][1];
    data.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const rightSection = document.getElementById("rightSection");

    const elementRatio = rightSection.clientWidth / rightSection.clientHeight;
    const dataRatio = (maxX - minX) / (maxY - minY);

    if (
      (elementRatio < 1 && dataRatio > 1) ||
      (elementRatio > 1 && dataRatio < 1)
    ) {
      data.forEach((point) => {
        [point[0], point[1]] = [point[1], point[0]];
      });
      [minX, minY] = [minY, minX];
      [maxX, maxY] = [maxY, maxX];
    }

    this.editor = [...rightSection.children];
    rightSection.innerHTML = "";

    const graphSection = document.createElement("div");
    graphSection.id = "graphSection";

    data.forEach((datum, index) => {
      const point = document.createElement("div");
      point.classList.add("editorTab");
      point.style.position = "absolute";

      const x = (datum[0] - minX) / (maxX - minX);
      const y = (datum[1] - minY) / (maxY - minY);

      point.style.left = `calc(${x * 80 + 10}% - 11px)`;
      point.style.top = `calc(${y * 80 + 10}% - 11px)`;
      point.style.background = noteThought[index].color;
      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      thought.style.position = "absolute";
      point.style.zIndex = "1";

      if (x > 0.5) {
        thought.style.right = `50%`;
      } else {
        thought.style.left = `50%`;
      }

      if (y > 0.5) {
        thought.style.bottom = `50%`;
      } else {
        thought.style.top = `50%`;
      }

      thought.style.display = "none";

      point.addEventListener("mouseover", (e) => {
        thought.style.display = "block";
        point.style.zIndex = "1000";
      });

      point.addEventListener("mouseout", (e) => {
        thought.style.display = "none";
        point.style.zIndex = "1";
      });

      point.append(thought);

      graphSection.appendChild(point);
    });

    rightSection.append(graphSection);
  }

  displayEditor() {
    if (this.state == "editor") {
      return;
    }
    this.state = "editor";
    const rightSection = document.getElementById("rightSection");
    rightSection.innerHTML = "";
    rightSection.append(...this.editor);
  }

  toggle() {
    if (this.state == "editor") {
      this.displayGraph();
    } else {
      this.displayEditor();
    }
  }
}

const graphViewer = new GraphViewer();
instances.graphViewer = graphViewer;
export default graphViewer;
