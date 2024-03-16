import instances from "./NeumeEngine.js";
import notes from "./Notes.js";
import projectToTopTwoPCA from "./PCA.js";
import Thought from "./chunkviewercomponents/Thought.js";
import nearestNeighborGraph from "./NearestNeighborGraph.js";
import themeEditor from "./settingscomponents/ThemeEditor.js";
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
      point.style.background = noteThought[index].getColor();

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

    for (let index = 0; index < 1000; index++) {
      nearestNeighborGraph.update(0.1);
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
    const n = 5;
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

    var isDraggingGlobal = false;
    nearestNeighborGraph.scaledPositions.forEach((position, index) => {
      const point = document.createElement("div");
      point.classList.add("graphTab");
      point.style.position = "absolute";

      const x = position[0];
      const y = position[1];

      point.style.left = `calc(${x * 80 + 10}% - 11px)`;
      point.style.top = `calc(${y * 80 + 10}% - 11px)`;
      point.style.background = noteThought[index].getColor();

      const thought = this.thought.buildGraphthought(
        noteThought[index],
        indexes[index]
      );

      thought.classList.remove("thought");
      thought.classList.add("graphThought");
      point.style.zIndex = "2";

      let isDragging = false;

      function calculatePercentagePosition(event) {
        const bounds = graphSection.getBoundingClientRect();
        const x = event.pageX - bounds.left - window.scrollX;
        const y = event.pageY - bounds.top - window.scrollY;
        const percentageX = (x / bounds.width) * 100;
        const percentageY = (y / bounds.height) * 100;
        return { percentageX, percentageY };
      }

      point.addEventListener("mousedown", function (event) {
        if (thought.matches(":hover")) {
          return;
        }
        nearestNeighborGraph.ignore = index;
        isDragging = true;
        isDraggingGlobal = true;

        thought.remove();
        point.style.zIndex = "2";
      });

      document.addEventListener("mousemove", function (event) {
        if (isDragging) {
          var { percentageX, percentageY } = calculatePercentagePosition(event);
          if (percentageX < 10) percentageX = 10;
          if (percentageX > 90) percentageX = 90;
          if (percentageY < 10) percentageY = 10;
          if (percentageY > 90) percentageY = 90;

          nearestNeighborGraph.setPositionByPercentage(
            index,
            percentageX,
            percentageY
          );
        }
      });

      document.addEventListener("mouseup", function () {
        isDragging = false;
        isDraggingGlobal = false;
        nearestNeighborGraph.ignore = -1;
        point.classList.remove("isActiveTab");
      });

      point.addEventListener("mouseover", (e) => {
        if (isDraggingGlobal) {
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

      graphSection.appendChild(point);
    });

    const lines = [];

    nearestNeighborGraph.nearestMatrix.forEach((nearest, rightIndex) => {
      nearest.forEach((leftIndex, index) => {
        if (leftIndex < rightIndex) {
          return;
        }
        lines.push(
          this.connectElementsWithLine(
            graphSection.children[leftIndex],
            graphSection.children[rightIndex],
            leftIndex,
            rightIndex
          )
        );
      });
    });

    rightSection.append(graphSection);

    var index = 0;

    while (this.state == "graph") {
      const timePromise = new Promise((resolve) => setTimeout(resolve, 16));
      console.time("onepass" + index);

      for (let i = 0; i < 10; i++) {
        nearestNeighborGraph.update(0.035);
      }

      const bounds = [];

      graphSection.childNodes.forEach((child, childIndex) => {
        const x = nearestNeighborGraph.scaledPositions[childIndex][0];
        const y = nearestNeighborGraph.scaledPositions[childIndex][1];

        child.style.left = `calc(${x * 80 + 10}% - 11px)`;
        child.style.top = `calc(${y * 80 + 10}% - 11px)`;
      });

      Array.from(graphSection.childNodes).map((child, index) => {
        bounds[index] = child.getBoundingClientRect();
      });

      lines.forEach((line) => line(bounds));
      console.timeEnd("onepass" + index++);
      await timePromise;
    }
  }

  connectElementsWithLine(element1, element2, index1, index2) {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const svgNS = "http://www.w3.org/2000/svg";
    // Create a defs element for gradients
    const defs = document.createElementNS(svgNS, "defs");
    this.svg.appendChild(defs);

    const getColorFromStyle = (element) => {
      const style = element.style;
      const backgroundImage = style.background;
      const colorMatch = backgroundImage.match(/rgb\((\d+), (\d+), (\d+)\)/g);
      if (colorMatch && colorMatch.length > 0) {
        const lastColor = colorMatch[colorMatch.length - 1];
        const [r, g, b] = lastColor.match(/\d+/g);
        console.log(r);
        if(themeEditor.state == "light"){
          return `#${parseInt(255 - (255 - r)/2.5)
          .toString(16)
          .padStart(2, "0")}${parseInt(255 - (255 - g)/2.5)
          .toString(16)
          .padStart(2, "0")}${parseInt(255 - (255 - b)/2.5)
          .toString(16)
          .padStart(2, "0")}`;
        }
        else{
          return `#${parseInt(r /2.5)
          .toString(16)
          .padStart(2, "0")}${parseInt(g/2.5)
          .toString(16)
          .padStart(2, "0")}${parseInt(b/2.5)
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
      var elem1 = elementBounds[index1];
      var elem2 = elementBounds[index2];

      const bool = elem1.left < elem2.left;

      if (bool != left2right) {
        left2right = bool;
        gradient
          .querySelector('stop[offset="0%"]')
          .setAttribute("stop-color", bool ? color1 : color2);
        gradient
          .querySelector('stop[offset="100%"]')
          .setAttribute("stop-color", bool ? color2 : color1);
      }

      line.setAttribute("x1", elem1.left + elem1.width / 2);
      line.setAttribute("y1", elem1.top + elem1.height / 2);
      line.setAttribute("x2", elem2.left + elem2.width / 2);
      line.setAttribute("y2", elem2.top + elem2.height / 2);
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
instances.graphViewer = graphViewer;
export default graphViewer;
