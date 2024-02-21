import { useState } from "react"

type Square = {
	id: number
	x: number
	y: number
	width: number
	height: number
	hexColor: string
}

type TemplateSquare = Pick<Square, 'x' | 'y' | 'width' | 'height'> & { visibility: boolean }

type Point = {
	x: number
	y: number
}

let startPos: Point = { x: 0, y: 0 }
let endPos: Point = { x: 0, y: 0 }
let selectStartPos: Point = { x: 0, y: 0 }
let selectedSquareStartPos: Point = { x: 0, y: 0 }
let isDrawing = false;
let isMoving = false;
let selectedSquareId = -1;

type CanvasProps = {
	tool: string
}

export const Canvas = (props: CanvasProps) => {
	const [squares, setSquares] = useState([] as Square[]);


	const [templateSquare, setTemplateSquare] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		visibility: false
	} as TemplateSquare)

	function resetTemplateSquare() {
		setTemplateSquare({
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			visibility: false,
		})
	}


	function transformEventCoordinates(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
		const svg = event.currentTarget;
		const point = svg.createSVGPoint();
		point.x = event.clientX;
		point.y = event.clientY;
		const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());
		return svgPoint;
	}

	function drawnNewSquare() {
		const width = Math.abs(startPos.x - endPos.x)
		const height = Math.abs(startPos.y - endPos.y)
		if (width < 2 || height < 2) return
		const newSquare: Square = {
			id: squares.length,
			x: Math.min(startPos.x, endPos.x),
			y: Math.min(startPos.y, endPos.y),
			width: Math.abs(startPos.x - endPos.x),
			height: Math.abs(startPos.y - endPos.y),
			hexColor: "#b9b3fc"
		}
		setSquares([newSquare, ...squares])
	}

	const handleMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		const svgPoint = transformEventCoordinates(event)
		if (props.tool == "rectangle") {
			startPos = { x: svgPoint.x, y: svgPoint.y }
			resetTemplateSquare()
			isDrawing = true
		} else {
			for (let i = 0; i < squares.length; i++) {
				const currSquare = squares[i]!;
				if (pointIsInSquare(svgPoint, currSquare)) {
					selectedSquareId = i;
					break
				}
			}
			if (selectedSquareId !== -1) {
				isMoving = true
				startPos = { x: -1, y: -1 }
				selectStartPos = { x: svgPoint.x, y: svgPoint.y }
				const selectedSquare = squares[selectedSquareId]!
				selectedSquareStartPos = { x: selectedSquare.x, y: selectedSquare.y }
			}
		}
	}

	const handleMouseUp = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		if (props.tool == "rectangle") {
			const svgPoint = transformEventCoordinates(event)
			if (selectedSquareId == -1 && startPos.x !== -1) {
				endPos = { x: svgPoint.x, y: svgPoint.y }
				drawnNewSquare()
				isDrawing = false
				resetTemplateSquare()
				setTemplateSquare({ ...templateSquare, visibility: false })
			}
		} else if (props.tool == "select") {
			isMoving = false
			selectedSquareId = -1
		}
	}

	const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
		const svgPoint = transformEventCoordinates(event)
		if (isDrawing && props.tool == "rectangle") {
			setTemplateSquare({
				x: Math.min(startPos.x, svgPoint.x),
				y: Math.min(startPos.y, svgPoint.y),
				width: Math.abs(startPos.x - svgPoint.x),
				height: Math.abs(startPos.y - svgPoint.y),
				visibility: true
			})
		} else if (props.tool == "select" && isMoving) {
			const offSet: Point = { x: svgPoint.x - selectStartPos.x, y: svgPoint.y - selectStartPos.y }
			const selectedSquare = squares[selectedSquareId]!
			squares[selectedSquareId] = { ...selectedSquare, x: selectedSquareStartPos.x + offSet.x, y: selectedSquareStartPos.y + offSet.y }
			setSquares([...squares])
		}
	}

	function pointIsInSquare(point: DOMPoint, square: Square) {
		const isHorizontallyContained = square.x < point.x && point.x < square.x + square.width
		const isVerticallyContained = square.y < point.y && point.y < square.y + square.height
		return isHorizontallyContained && isVerticallyContained
	}

	return (
		<div className="p-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="w-screen min-h-screen"
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
						fill={square.hexColor}>
					</rect>
				))}
				<rect className="fill-transparent outline-dashed" x={templateSquare.x} y={templateSquare.y} width={templateSquare.width} height={templateSquare.height} visibility={templateSquare.visibility ? "" : "hidden"}></rect>
			</svg>
		</div >
	)
}
