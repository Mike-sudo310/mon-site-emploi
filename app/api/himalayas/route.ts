export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "drone";

    const res = await fetch(
      `https://himalayas.app/jobs/api?search=${search}`
    );

    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Erreur Himalayas API" },
      { status: 500 }
    );
  }
}