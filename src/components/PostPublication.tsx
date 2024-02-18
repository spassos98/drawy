import { useState } from "react";
import { api } from "~/utils/api"

export const PostPublication = () => {

	const [textareaValue, setTextareaValue] = useState<string>('');
	const createPost = api.post.create.useMutation();

	const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextareaValue(event.target.value);
	};

	const handleSubmit = () => {
		createPost.mutate({ name: textareaValue })
	}

	return (
		<div>
			<p>Create your post!</p>
			<div>
				<textarea className="border-black border" onChange={handleTextareaChange}></textarea>
			</div>
			<button onClick={handleSubmit}>Post!</button>
		</div>
	)
}
