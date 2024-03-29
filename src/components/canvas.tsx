import { useState } from "react";
import { type Tool } from "~/utils/tools/tools";

type Square = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hexColor: string;
};

type Circle = {
  cx: number;
  cy: number;
  radius: number;
};

type TemplateSquare = Pick<Square, "x" | "y" | "width" | "height"> & {
  visibility: boolean;
};

type Point = {
  x: number;
  y: number;
};

const SELECTED_TEMPLATE_OFFSET_PX = 6;

let startPos: Point = { x: 0, y: 0 };
let endPos: Point = { x: 0, y: 0 };
let selectStartPos: Point = { x: 0, y: 0 };
let selectedSquareStartPos: Point = { x: 0, y: 0 };
let selectedSquareStartValues: Square = {
  x: -1,
  y: -1,
  width: -1,
  height: -1,
  hexColor: "#000000",
  id: -1,
};
let isDrawing = false;
let isMoving = false;
let isShapeSelected = false;
let selectedSquareId = -1;
let selectedAnchorId = -1;
let isAnchorSelected = false;
const iterations: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

type CanvasProps = {
  tool: Tool;
};

export const Canvas = (props: CanvasProps) => {
  const [squares, setSquares] = useState([] as Square[]);
  const [anchorPoints, setAnchorPoints] = useState<Circle[]>([]);

  const [templateSquare, setTemplateSquare] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visibility: false,
  } as TemplateSquare);

  function resetTemplateSquare() {
    setTemplateSquare({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      visibility: false,
    });
    setAnchorPoints([]);
  }

  function transformEventCoordinates(
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return svgPoint;
  }

  function drawnNewSquare() {
    const width = Math.abs(startPos.x - endPos.x);
    const height = Math.abs(startPos.y - endPos.y);
    if (width < 2 || height < 2) return;
    const newSquare: Square = {
      id: squares.length,
      x: Math.min(startPos.x, endPos.x),
      y: Math.min(startPos.y, endPos.y),
      width: Math.abs(startPos.x - endPos.x),
      height: Math.abs(startPos.y - endPos.y),
      hexColor: "#b9b3fc",
    };
    setSquares([newSquare, ...squares]);
  }

  function drawSelectedTemplateSquare() {
    if (isShapeSelected) {
      const selectedSquare = squares[selectedSquareId]!;
      const templateSquare = {
        x: selectedSquare.x - SELECTED_TEMPLATE_OFFSET_PX,
        y: selectedSquare.y - SELECTED_TEMPLATE_OFFSET_PX,
        width: selectedSquare.width + 2 * SELECTED_TEMPLATE_OFFSET_PX,
        height: selectedSquare.height + 2 * SELECTED_TEMPLATE_OFFSET_PX,
        visibility: true,
      };
      setTemplateSquare(templateSquare);
      const anchorPoints: Circle[] = iterations.map((val) => {
        return {
          cx: templateSquare.x + templateSquare.width * val[0],
          cy: templateSquare.y + templateSquare.height * val[1],
          radius: 6,
        };
      });
      setAnchorPoints(anchorPoints);
    }
  }

  function pointIsInSquare(point: DOMPoint, square: Square) {
    const isHorizontallyContained =
      square.x < point.x && point.x < square.x + square.width;
    const isVerticallyContained =
      square.y < point.y && point.y < square.y + square.height;
    return isHorizontallyContained && isVerticallyContained;
  }

  function pointIsInCircle(point: DOMPoint, circle: Circle) {
    return (
      (point.x - circle.cx) ** 2 + (point.y - circle.cy) ** 2 <=
      circle.radius ** 2
    );
  }

  function anchorIdToCursor(anchorId: number) {
    switch (anchorId) {
      case 0:
        return "nwse-resize";
      case 1:
        return "nesw-resize";
      case 2:
        return "nesw-resize";
      case 3:
        return "nwse-resize";
      default:
        return "";
    }
  }

  const handleMouseDown = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    const svgPoint = transformEventCoordinates(event);
    if (props.tool == "RECTANGLE") {
      startPos = { x: svgPoint.x, y: svgPoint.y };
      resetTemplateSquare();
      isDrawing = true;
    } else if (props.tool == "SELECT") {
      for (let i = 0; i < anchorPoints.length; i++) {
        const currAnchor = anchorPoints[i]!;
        if (pointIsInCircle(svgPoint, currAnchor)) {
          selectedAnchorId = i;
          break;
        }
      }
      if (selectedSquareId !== -1 && selectedAnchorId !== -1) {
        isAnchorSelected = true;
        startPos = { x: -1, y: -1 };
        selectStartPos = { x: svgPoint.x, y: svgPoint.y };
        const selectedSquare = squares[selectedSquareId]!;
        selectedSquareStartPos = { x: selectedSquare.x, y: selectedSquare.y };
        selectedSquareStartValues = selectedSquare;
        return;
      }

      selectedSquareId = -1;
      for (let i = 0; i < squares.length; i++) {
        const currSquare = squares[i]!;
        if (pointIsInSquare(svgPoint, currSquare)) {
          selectedSquareId = i;
          break;
        }
      }
      if (selectedSquareId !== -1) {
        isShapeSelected = true;
        drawSelectedTemplateSquare();
        isMoving = true;
        startPos = { x: -1, y: -1 };
        selectStartPos = { x: svgPoint.x, y: svgPoint.y };
        const selectedSquare = squares[selectedSquareId]!;
        selectedSquareStartPos = { x: selectedSquare.x, y: selectedSquare.y };
      } else {
        isShapeSelected = false;
        isAnchorSelected = false;
        resetTemplateSquare();
      }
    }
  };

  const handleMouseUp = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    if (props.tool == "RECTANGLE") {
      const svgPoint = transformEventCoordinates(event);
      if (selectedSquareId == -1 && startPos.x !== -1) {
        endPos = { x: svgPoint.x, y: svgPoint.y };
        drawnNewSquare();
        isDrawing = false;
        resetTemplateSquare();
        setTemplateSquare({ ...templateSquare, visibility: false });
      }
    } else if (props.tool == "SELECT") {
      isMoving = false;
      isAnchorSelected = false;
      selectedAnchorId = -1;
    }
  };

  const handleMouseMove = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    const svgPoint = transformEventCoordinates(event);
    if (isDrawing && props.tool == "RECTANGLE") {
      setTemplateSquare({
        x: Math.min(startPos.x, svgPoint.x),
        y: Math.min(startPos.y, svgPoint.y),
        width: Math.abs(startPos.x - svgPoint.x),
        height: Math.abs(startPos.y - svgPoint.y),
        visibility: true,
      });
    } else if (props.tool == "SELECT") {
      if (isMoving) {
        const offSet: Point = {
          x: svgPoint.x - selectStartPos.x,
          y: svgPoint.y - selectStartPos.y,
        };
        const selectedSquare = squares[selectedSquareId]!;
        squares[selectedSquareId] = {
          ...selectedSquare,
          x: selectedSquareStartPos.x + offSet.x,
          y: selectedSquareStartPos.y + offSet.y,
        };
        setSquares([...squares]);
        drawSelectedTemplateSquare();
      } else if (isAnchorSelected) {
        const offSet: Point = {
          x: svgPoint.x - selectStartPos.x,
          y: svgPoint.y - selectStartPos.y,
        };
        const selectedSquare = squares[selectedSquareId]!;
        const currentIteration = iterations[selectedAnchorId]!;
        let newWidth =
          selectedSquareStartValues.width +
          offSet.x * (currentIteration[0] == 0 ? -1 : 1);
        let newX =
          selectedSquareStartValues.x +
          offSet.x * (currentIteration[0] == 0 ? 1 : 0);
        if (newWidth < 0) {
          newX += newWidth;
          newWidth = Math.abs(newWidth);
        }
        let newY =
          selectedSquareStartValues.y +
          offSet.y * (currentIteration[1] == 0 ? 1 : 0);
        let newHeight =
          selectedSquareStartValues.height +
          offSet.y * (currentIteration[1] == 0 ? -1 : 1);

        if (newHeight < 0) {
          newY += newHeight;
          newHeight = Math.abs(newHeight);
        }
        squares[selectedSquareId] = {
          ...selectedSquare,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
        setSquares([...squares]);
        drawSelectedTemplateSquare();
      }
    }
  };

  return (
    <div className="p-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="min-h-screen w-screen"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {squares.map((square, index) => (
          <rect
            className="stroke-black"
            key={index}
            x={square.x}
            y={square.y}
            width={square.width}
            height={square.height}
            fill={square.hexColor}
          ></rect>
        ))}
        <rect
          className={
            "fill-transparent " +
            (isShapeSelected ? "stroke-black" : "outline-dotted")
          }
          x={templateSquare.x}
          y={templateSquare.y}
          width={templateSquare.width}
          height={templateSquare.height}
          visibility={templateSquare.visibility ? "" : "hidden"}
        ></rect>
        {anchorPoints.map((anchorPoint, index) => (
          <circle
            className="fill-white stroke-black"
            cursor={anchorIdToCursor(index)}
            key={index}
            cx={anchorPoint.cx}
            cy={anchorPoint.cy}
            r={anchorPoint.radius}
          />
        ))}
      </svg>
    </div>
  );
};
