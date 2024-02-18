import { useState } from "react"

type CounterProps = {
	title: string
	start: number
}



export const Counter = (props: CounterProps) => {
	const [counter, setCounter] = useState(props.start)
	return (
		<div>
			<div>
				<h3 className="text-2xl text-white" >{props.title}</h3>
				<p className="text-3xl text-white">{counter}</p>
			</div>
			<button onClick={() => { setCounter(counter + 1) }}>
				Click me!
			</button>
		</div>
	)
}
