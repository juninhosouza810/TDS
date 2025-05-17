export default async function handler(req, res) {
  const GIST_ID = process.env.GIST_ID;
  const FILE_NAME = "tds.json";
  const TOKEN = process.env.GITHUB_TOKEN;

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  if (req.method === "GET") {
    // Obter dados do Gist (com bust no raw_url)
    const meta = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
    const gist = await meta.json();
    const rawUrl = gist.files[FILE_NAME].raw_url + `?t=${Date.now()}`;
    const contentRes = await fetch(rawUrl, { cache: 'no-store' });
    const content = await contentRes.json();
    console.log("content", content)
    return res.status(200).json(content);
  }

  if (req.method === "PATCH") {
    const body = req.body;

    const update = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        files: {
          [FILE_NAME]: {
            content: JSON.stringify(body, null, 2)
          }
        }
      })
    });

    if (!update.ok) {
      return res.status(500).json({ error: "Falha ao salvar no Gist" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).end(); // Método não permitido
}
