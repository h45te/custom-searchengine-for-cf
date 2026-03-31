const DEFAULT_URL = 'https://duckduckgo.com/?q=$';
const ESCAPE_PREFIX = '$';
const MARKER = '$';

const redirect = (template, query) => new Response(
	template.replace(MARKER, encodeURIComponent(query.join(' '))), {
		status: 303,
		headers: {
			Location: template.replace(MARKER, encodeURIComponent(query.join(' ')))
		}
	}
);

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'GET') {
			const urlObj = new URL(request.url);
			const q = urlObj.searchParams?.get('q')?.split(' ') ?? null;
			if (q === null) {
				return new Response('Empty Query', { status: 400 });
			} else if (q[0].startsWith(ESCAPE_PREFIX)) {
				return redirect(DEFAULT_URL, [q[0].slice(ESCAPE_PREFIX.length)].concat(q.slice(1)));
			} else {
				const template = await env.SHORTCUTS.get(q[0]);
				if (template !== null) {
					return redirect(template, q.slice(1));
				} else {
					return redirect(DEFAULT_URL, q);
				}
			}
		} else if (request.method === 'PUT') {
			const req = await request.json();
			const key = req.key
			const value = req.value
			if (typeof key !== 'string' || typeof value !== 'string') {
				return new Response('Invalid Request Body', {status: 400});
			}
			const current = env.SHORTCUTS.get(key);
			if (current === value) {
				return new Response(null, {status: 204})
			} else {
				await env.SHORTCUTS.put(key, value);
				const h = new Headers();
				h.set("Content-type", "application/json");
				return new Response(JSON.stringify({key, value: await env.SHORTCUTS.get(key)}), {status: 201, headers: h})
			}
		} else if (request.method === 'DELETE') {
			const key = (await request.json()).key;
			if (typeof key !== 'string') {
				return new Response('Invalid Request Body', {status: 400});
			} else {
				await env.SHORTCUTS.delete(key);
				return new Response(null, {status: 204});
			}
		} else {
			return new Response('Invalid Request', {status: 400})
		}
	}
}