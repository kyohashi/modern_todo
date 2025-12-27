/**
 * Simple Auth System using KV
 * signup: /api/auth?action=signup
 * login:  /api/auth?action=login
 */

// Simple hash function using Web Crypto API
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const action = url.searchParams.get("action");
  const { username, password } = await context.request.json();

  if (!username || !password) return new Response("Missing fields", { status: 400 });

  const userKey = `user:${username}`;

  if (action === "signup") {
    const existing = await context.env.TODO_KV.get(userKey);
    if (existing) return new Response("User already exists", { status: 400 });

    const passwordHash = await hashPassword(password);
    await context.env.TODO_KV.put(userKey, JSON.stringify({ passwordHash }));
    return new Response("User created", { status: 201 });
  }

  if (action === "login") {
    const data = await context.env.TODO_KV.get(userKey);
    if (!data) return new Response("Invalid credentials", { status: 401 });

    const { passwordHash } = JSON.parse(data);
    const inputHash = await hashPassword(password);

    if (inputHash === passwordHash) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      // Store session for 7 days
      await context.env.TODO_KV.put(`session:${token}`, username, { expirationTtl: 3600 * 24 * 7 });
      return new Response(JSON.stringify({ token }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response("Invalid credentials", { status: 401 });
  }

  return new Response("Invalid action", { status: 400 });
}
