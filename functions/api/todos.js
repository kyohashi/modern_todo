// Helper to get username from session token
async function getUsername(context) {
  const token = context.request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return await context.env.TODO_KV.get(`session:${token}`);
}

export async function onRequestGet(context) {
  const username = await getUsername(context);
  if (!username) return new Response("Unauthorized", { status: 401 });

  const data = await context.env.TODO_KV.get(`todos:${username}`);
  return new Response(data || "[]", {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost(context) {
  const username = await getUsername(context);
  if (!username) return new Response("Unauthorized", { status: 401 });

  const todos = await context.request.text();
  await context.env.TODO_KV.put(`todos:${username}`, todos);
  return new Response("Saved", { status: 200 });
}
