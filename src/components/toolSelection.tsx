import { useState } from "react";

type ToolSelectionProps = {
	onSelect: (value: string) => void
	selectedTool: string
}

export const ToolSelection = (props: ToolSelectionProps) => {

	const handleChange = (event: any) => {
		props.onSelect(event.target.value)
	}

	return (
		<div className="flex">
			<div>
				<input
					onChange={handleChange}
					id="select"
					value={"select"}
					type="radio" name="tool" checked={props.selectedTool == "select"} />
				<label>Select</label>
			</div>
			<div>
				<input
					onChange={handleChange}
					id="rectangle"
					value={"rectangle"}
					type="radio" name="tool" checked={props.selectedTool == "rectangle"} />
				<label>Rectangle</label>
			</div>
		</div>
	)
}
