export function queryOpenPolicyAgent() {
	const response = fetch("http://localhost:8181/v1/query", {
		method: "POST",
		body: JSON.stringify({
			query: ``
		})
	})
}