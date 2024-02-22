import { ToolEnum, type Tool } from "~/utils/tools/tools";

type ToolSelectionProps = {
	onSelect: (value: Tool) => void
	selectedTool: Tool
}

export const ToolSelection = (props: ToolSelectionProps) => {

	const handleChange = (event: { target: { value: string } }) => {
		props.onSelect(event.target.value as Tool)
	}

	return (
		<div className="flex">
			<div>
				<input
					onChange={handleChange}
					id="select"
					value={ToolEnum.SELECT}
					type="radio" name="tool" checked={props.selectedTool == "SELECT"} />
				<label>Select</label>
			</div>
			<div>
				<input
					onChange={handleChange}
					id="rectangle"
					value={ToolEnum.RECTANGLE}
					type="radio" name="tool" checked={props.selectedTool == "RECTANGLE"} />
				<label>Rectangle</label>
			</div>
		</div>
	)
}
