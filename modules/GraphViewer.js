import instances from "./NeumeEngine.js";
import notes from "./Notes.js";
import projectToTopTwoPCA from "./PCA.js";
import Thought from "./chunkviewercomponents/Thought.js";
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
    const sectionWidth = rightSection.clientWidth
    const sectionHeight = rightSection.clientHeight;
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
    rightSection.innerHTML = "";

    const graphSection = document.createElement("div");
    graphSection.id = "graphSection";

    data.forEach((datum, index) => {
      const point = document.createElement("div");
      point.classList.add("editorTab");
      point.style.position = "absolute";

      const x = (datum[0] - minX) / (maxX - minX);
      const y = (datum[1] - minY) / (maxY - minY);

      point.style.left = `calc(${sectionWidth * (x * 80 + 10) - 11}px)`;
      point.style.top = `calc(${sectionHeight * (y * 80 + 10) - 11}px)`;
      point.style.background = noteThought[index].color;
      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      thought.style.position = "absolute";
      point.style.zIndex = "10";

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
        point.style.zIndex = "10";
      });

      point.append(thought);

      graphSection.appendChild(point);
    });

    rightSection.append(graphSection);
  }

  displayGraph(n = 100) {
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
      point.style.zIndex = "10";

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
        point.style.zIndex = "10";
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
