export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // check auth
  const auth = event.headers["authorization"] || "";
  if (!auth.endsWith(process.env.AUTH_TOKEN)) {
    return { statusCode: 403, body: "Forbidden" };
  }

  try {
    const fid = Math.random().toString(36).substring(2, 10);
    const url = `https://${process.env.URL}/v/${fid}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}
