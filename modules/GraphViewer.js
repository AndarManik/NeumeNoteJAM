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

  async updateGraph(n = 6) {
    if (!notes.notes.length) {
      return;
    }
    const svgNS = "http://www.w3.org/2000/svg";
    this.svg.remove();
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100svw; height: 100svh;"
    );
    document.body.appendChild(this.svg);

    this.state = "graph";

    nearestNeighborGraph.loadInitialData(n);

    const noteThought = [];
    const indexes = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding, index) => {
        noteThought.push(note);
        indexes.push(index);
      });
    });

    const rightSection = document.getElementById("rightSection");

    rightSection.innerHTML = "";

    const graphSection = document.createElement("div");
    graphSection.id = "graphSection";

    const thoughts = [];

    nearestNeighborGraph.scaledPositions.forEach((position, index) => {
      const point = document.createElement("div");
      point.classList.add("graphTab");
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
      point.style.zIndex = "2";

      thought.style.display = "none";

      point.addEventListener("mouseover", (e) => {
        thought.style.display = "block";
        point.style.zIndex = "1000";
      });

      point.addEventListener("mouseout", (e) => {
        thought.style.display = "none";
        point.style.zIndex = "2";
      });

      thoughts.push(thought);
      graphSection.appendChild(point);
    });

    const lines = [];

    nearestNeighborGraph.nearestMatrix.forEach((nearest, rightIndex) => {
      nearest.forEach((leftIndex, index) => {
        lines.push(
          this.connectElementsWithLine(
            graphSection.children[leftIndex],
            graphSection.children[rightIndex]
          )
        );
      });
    });

    rightSection.append(graphSection);
    console.time("thisone");

    for (let index = 0; index < 1000; index++) {
      nearestNeighborGraph.update(index);
    }

    graphSection.childNodes.forEach((child, childIndex) => {
      const x = nearestNeighborGraph.scaledPositions[childIndex][0];
      const y = nearestNeighborGraph.scaledPositions[childIndex][1];
      child.append(thoughts[childIndex]);

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
    console.timeEnd("thisone");

    for (let index = 0; index < 10000; index++) {
      console.log("loop");
      await new Promise((resolve) => setTimeout(resolve, 0));

      for (let i = 0; i < 10; i++) {
        nearestNeighborGraph.update(300);
      }

      graphSection.childNodes.forEach((child, childIndex) => {
        const x = nearestNeighborGraph.scaledPositions[childIndex][0];
        const y = nearestNeighborGraph.scaledPositions[childIndex][1];

        child.style.left = `calc(${x * 80 + 10}% - 11px)`;
        child.style.top = `calc(${y * 80 + 10}% - 11px)`;
      });
      lines.forEach((line) => line());
    }

    graphSection.childNodes.forEach((child, childIndex) => {
      const x = nearestNeighborGraph.scaledPositions[childIndex][0];
      const y = nearestNeighborGraph.scaledPositions[childIndex][1];
      child.append(thoughts[childIndex]);

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

  async displayGraph() {
    const n = 6;
    if (this.state == "graph" || !notes.notes.length) {
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100svw; height: 100svh;"
    );
    document.body.appendChild(this.svg);

    this.state = "graph";

    nearestNeighborGraph.loadInitialData(n);

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

    const thoughts = [];

    nearestNeighborGraph.scaledPositions.forEach((position, index) => {
      const point = document.createElement("div");
      point.classList.add("graphTab");
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
      point.style.zIndex = "2";

      thought.style.display = "none";

      point.addEventListener("mouseover", (e) => {
        thought.style.display = "block";
        point.style.zIndex = "1000";
      });

      point.addEventListener("mouseout", (e) => {
        thought.style.display = "none";
        point.style.zIndex = "2";
      });

      thoughts.push(thought);
      graphSection.appendChild(point);
    });

    const lines = [];

    nearestNeighborGraph.nearestMatrix.forEach((nearest, rightIndex) => {
      nearest.forEach((leftIndex, index) => {
        lines.push(
          this.connectElementsWithLine(
            graphSection.children[leftIndex],
            graphSection.children[rightIndex]
          )
        );
      });
    });

    rightSection.append(graphSection);
    console.time("thisone");

    for (let index = 0; index < 2000; index++) {
      nearestNeighborGraph.update(index);
    }

    graphSection.childNodes.forEach((child, childIndex) => {
      const x = nearestNeighborGraph.scaledPositions[childIndex][0];
      const y = nearestNeighborGraph.scaledPositions[childIndex][1];
      child.append(thoughts[childIndex]);

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
    console.timeEnd("thisone");

    for (let index = 0; index < 10000; index++) {
      console.log("loop");
      await new Promise((resolve) => setTimeout(resolve, 0));

      for (let i = 0; i < 20; i++) {
        nearestNeighborGraph.update(500);
      }

      graphSection.childNodes.forEach((child, childIndex) => {
        const x = nearestNeighborGraph.scaledPositions[childIndex][0];
        const y = nearestNeighborGraph.scaledPositions[childIndex][1];

        child.style.left = `calc(${x * 80 + 10}% - 11px)`;
        child.style.top = `calc(${y * 80 + 10}% - 11px)`;
      });
      lines.forEach((line) => line());
    }

    graphSection.childNodes.forEach((child, childIndex) => {
      const x = nearestNeighborGraph.scaledPositions[childIndex][0];
      const y = nearestNeighborGraph.scaledPositions[childIndex][1];
      child.append(thoughts[childIndex]);

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
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("id", "connectionLine");
    line.setAttribute("style", "stroke: var(--left); stroke-width: 1");
    this.svg.appendChild(line);

    function updateLine() {
      var elem1 = element1.getBoundingClientRect();
      var elem2 = element2.getBoundingClientRect();
      line.setAttribute("x1", elem1.left + elem1.width / 2);
      line.setAttribute("y1", elem1.top + elem1.height / 2);
      line.setAttribute("x2", elem2.left + elem2.width / 2);
      line.setAttribute("y2", elem2.top + elem2.height / 2);
    }

    updateLine();
    return updateLine;
  }

  displayEditor() {
    if (this.state == "editor") {
      return;
    }
    this.svg.remove();
    this.state = "editor";
    const rightSection = document.getElementById("rightSection");
    rightSection.innerHTML = "";
    rightSection.append(...this.editor);
  }

  async toggle() {
    if (this.state == "editor") {
      await this.displayGraph();
    } else {
      this.displayEditor();
    }
  }
}

const graphViewer = new GraphViewer();
instances.graphViewer = graphViewer;
export default graphViewer;
