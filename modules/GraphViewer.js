import notes from "./Notes.js";
import Thought from "./chunkviewercomponents/Thought.js";
import nearestNeighborGraph from "./NearestNeighborGraph.js";
import themeEditor from "./settingscomponents/ThemeEditor.js";
class GraphViewer {
  constructor() {
    this.state = "editor";
    this.thought = new Thought({});
    this.n = 6;
    this.fps = 45;
    this.initialized = false;
  }

  async initialize() {
    const noteCounter = notes.notes.reduce((prev, current) => {
      return prev + current.chunks.length;
    }, 0);
    if (noteCounter < 3) {
      return;
    }
    this.isDraggingGlobal = false;
    const svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100svw; height: 100svh;"
    );

    this.building = true;
    nearestNeighborGraph.loadInitialData(this.n);
    this.buildGraph();
    this.building = false;
    this.initialized = true;
  }

  handleNoteChange() {
    const noteCounter = notes.notes.reduce((prev, current) => {
      return prev + current.chunks.length;
    }, 0);
    if (noteCounter < 3 || !this.initialized) {
      return;
    }
    this.building = true;

    this.graphSection.remove();
    this.svg.remove();
    const svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100svw; height: 100svh;"
    );
    nearestNeighborGraph.handleNoteChange();
    this.buildGraph();
    this.building = false;

    if (this.state == "graph") {
      document.getElementById("rightSection").append(this.graphSection);
      document.body.appendChild(this.svg);
    }
  }

  handleStyleChange() {
    const noteCounter = notes.notes.reduce((prev, current) => {
      return prev + current.chunks.length;
    }, 0);
    if (noteCounter < 3 || !this.initialized) {
      return;
    }
    this.building = true;

    this.graphSection.remove();
    this.svg.remove();
    const svgNS = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(svgNS, "svg");
    this.svg.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 100svw; height: 100svh;"
    );
    this.buildGraph();
    this.building = false;

    if (this.state == "graph") {
      document.getElementById("rightSection").append(this.graphSection);
      document.body.appendChild(this.svg);
    }
  }

  async displayGraph() {
    const noteCounter = notes.notes.reduce((prev, current) => {
      return prev + current.chunks.length;
    }, 0);
    if (noteCounter < 3 || !notes.notes.length) {
      return;
    }

    if (!this.initialized) {
      await this.initialize();
    }
    this.state = "graph";

    const rightSection = document.getElementById("rightSection");
    this.editor = [...rightSection.children];
    rightSection.innerHTML = "";
    document.getElementById("rightSection").append(this.graphSection);
    document.body.appendChild(this.svg);
    await this.simulate(this.fps);
  }

  async simulate() {
    var index = 0;
    var numberOfUpdates = 1;
    var renderTime = 0;

    const graphSectionBounds = document
      .getElementById("graphSection")
      .getBoundingClientRect();

    var left = graphSectionBounds.left;
    var top = graphSectionBounds.top;
    var width = graphSectionBounds.width / 100;
    var height = graphSectionBounds.height / 100;

    while (this.state == "graph") {
      const timePromise = new Promise((resolve) =>
        setTimeout(resolve, 1000 / this.fps)
      );
      console.time("onepass" + index);
      const startTime = performance.now();

      console.time("updateTime");
      for (let i = 0; i < numberOfUpdates; i++) {
        nearestNeighborGraph.update(0.1);
      }
      console.timeEnd("updateTime");

      const bounds = [];

      this.graphSection.childNodes.forEach((child, childIndex) => {
        const x = nearestNeighborGraph.scaledPositions[childIndex][0];
        const y = nearestNeighborGraph.scaledPositions[childIndex][1];

        const nodeLeft = left + (x * 80 + 10) * width - 11;
        const nodeTop = top + (y * 80 + 10) * height - 11;

        child.style.transform = `translate(${nodeLeft}px, ${nodeTop}px)`;
        bounds.push({ nodeLeft, nodeTop });
      });

      this.lines.forEach((line) => line(bounds));

      renderTime += performance.now() - startTime;

      if (index % this.fps == this.fps - 1) {
        const singleUpdateTime = renderTime / this.fps;
        console.log(singleUpdateTime);
        if (singleUpdateTime < 1000 / this.fps - 1) {
          numberOfUpdates = Math.min(50, numberOfUpdates + 1);
        }
        if (singleUpdateTime > 1000 / this.fps + 1) {
          numberOfUpdates = Math.max(1, numberOfUpdates - 1);
        }
        renderTime = 0;
      }

      if (index % (this.fps / 4) == this.fps / 4 - 1) {
        const graphSectionBounds = document
          .getElementById("graphSection")
          .getBoundingClientRect();

        left = graphSectionBounds.left;
        top = graphSectionBounds.top;
        width = graphSectionBounds.width / 100;
        height = graphSectionBounds.height / 100;
      }

      console.log(numberOfUpdates);
      console.timeEnd("onepass" + index++);
      await timePromise;
    }
  }

  buildGraph() {
    this.graphSection = document.createElement("div");
    this.graphSection.id = "graphSection";

    const noteThought = [];
    const indexes = [];
    notes.notes.forEach((note) => {
      note.embeddings.forEach((embedding, index) => {
        noteThought.push(note);
        indexes.push(index);
      });
    });

    nearestNeighborGraph.scaledPositions.forEach((position, index) => {
      const point = document.createElement("div");
      point.classList.add("graphTab");
      point.style.position = "absolute";

      const x = position[0];
      const y = position[1];

      point.style.left = `0`;
      point.style.top = `0`;
      point.style.background = noteThought[index].getColor();
      point.style.boxShadow = `-0px 0px 50px hsl(${noteThought[index].innerHue}, 100%, 50%, 0.33)`;

      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      point.style.zIndex = "2";

      let isDragging = false;

      const calculatePercentagePosition = (event) => {
        const bounds = this.graphSection.getBoundingClientRect();
        const x = event.pageX - bounds.left - window.scrollX;
        const y = event.pageY - bounds.top - window.scrollY;
        const percentageX = (x / bounds.width) * 100;
        const percentageY = (y / bounds.height) * 100;
        return { percentageX, percentageY };
      };

      point.addEventListener("mousedown", (event) => {
        if (thought.matches(":hover")) {
          return;
        }
        event.preventDefault();
        nearestNeighborGraph.ignore = index;
        isDragging = true;
        this.isDraggingGlobal = true;

        thought.remove();
        point.style.zIndex = "2";
      });

      document.addEventListener("mousemove", (event) => {
        if (isDragging) {
          var { percentageX, percentageY } = calculatePercentagePosition(event);
          if (percentageX < 10.1) percentageX = 10.1;
          if (percentageX > 89.9) percentageX = 89.9;
          if (percentageY < 10.1) percentageY = 10.1;
          if (percentageY > 89.9) percentageY = 89.9;

          nearestNeighborGraph.setPositionByPercentage(
            index,
            percentageX,
            percentageY
          );
        }
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
        this.isDraggingGlobal = false;
        nearestNeighborGraph.ignore = -1;
        point.classList.remove("isActiveTab");
      });

      point.addEventListener("mouseover", (e) => {
        if (this.isDraggingGlobal) {
          return;
        }
        const x = nearestNeighborGraph.scaledPositions[index][0];
        const y = nearestNeighborGraph.scaledPositions[index][1];
        thought.style.background = "var(--search)";
        thought.classList.add("isActiveTab");

        thought.style.position = "absolute";
        thought.style.transform = `translate(${
          x > 0.5 ? "calc(-100% + 0px)" : "19px"
        }, ${y > 0.5 ? "calc(-100% + 19px)" : "0px"})`;

        point.append(thought);
        point.style.zIndex = "1000";
        point.classList.add("isActiveTab");
      });

      point.addEventListener("mouseout", (e) => {
        if (thought.matches(":hover")) {
          return;
        }
        thought.style.position = "static";
        thought.remove();
        point.style.zIndex = "2";
        if (!isDragging) {
          point.classList.remove("isActiveTab");
        }
      });

      this.graphSection.appendChild(point);
    });

    this.lines = [];

    nearestNeighborGraph.adjacencyMatrix.forEach((nearest, rightIndex) => {
      nearest.forEach((leftIndex, index) => {
        if (leftIndex < rightIndex) {
          return;
        }
        this.lines.push(
          this.connectElementsWithLine(
            this.graphSection.children[leftIndex],
            this.graphSection.children[rightIndex],
            leftIndex,
            rightIndex
          )
        );
      });
    });
  }

  connectElementsWithLine(element1, element2, index1, index2) {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(svgNS, "defs");
    this.svg.appendChild(defs);

    const getColorFromStyle = (element) => {
      const style = element.style;
      const backgroundImage = style.background;
      const colorMatch = backgroundImage.match(/rgb\((\d+), (\d+), (\d+)\)/g);
      if (colorMatch && colorMatch.length > 0) {
        const lastColor = colorMatch[colorMatch.length - 1];
        const [r, g, b] = lastColor.match(/\d+/g);
        if (themeEditor.state == "light") {
          return `#${parseInt(255 - (255 - r) / 3.5)
            .toString(16)
            .padStart(2, "0")}${parseInt(255 - (255 - g) / 3.5)
            .toString(16)
            .padStart(2, "0")}${parseInt(255 - (255 - b) / 3.5)
            .toString(16)
            .padStart(2, "0")}`;
        } else {
          return `#${parseInt(r / 2.5)
            .toString(16)
            .padStart(2, "0")}${parseInt(g / 2.5)
            .toString(16)
            .padStart(2, "0")}${parseInt(b / 2.5)
            .toString(16)
            .padStart(2, "0")}`;
        }
      }
      return null;
    };

    const bounding1 = element1.getBoundingClientRect().left;
    const bounding2 = element2.getBoundingClientRect().left;

    const color1 = getColorFromStyle(element1);
    const color2 = getColorFromStyle(element2);

    let left2right = bounding1 < bounding2;

    const currentColor1 = bounding1 < bounding2 ? color1 : color2;
    const currentColor2 = bounding1 < bounding2 ? color2 : color1;

    // Create gradient
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "gradientLine" + uniqueId);
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", currentColor1);
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", currentColor2);
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);

    // Line setup
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("class", "connectionLine");
    line.setAttribute(
      "style",
      `stroke: url(#gradientLine${uniqueId}); stroke-width: 1`
    );
    this.svg.appendChild(line);

    function updateLine(elementBounds) {
      const elem1 = elementBounds[index1];
      const elem2 = elementBounds[index2];

      const bool = elem1.nodeLeft < elem2.nodeLeft;

      if (bool != left2right) {
        left2right = bool;
        gradient
          .querySelector('stop[offset="0%"]')
          .setAttribute("stop-color", bool ? color1 : color2);
        gradient
          .querySelector('stop[offset="100%"]')
          .setAttribute("stop-color", bool ? color2 : color1);
      }

      line.setAttribute("x1", elem1.nodeLeft + 11);
      line.setAttribute("y1", elem1.nodeTop + 11);
      line.setAttribute("x2", elem2.nodeLeft + 11);
      line.setAttribute("y2", elem2.nodeTop + 11);
    }
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
export default graphViewer;
