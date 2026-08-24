const GOOGLE_SHEETS_EXPORTS = [
  'https://docs.google.com/spreadsheets/d/165aYGrHyUS_sE3vJa3OgUczKU7fTsSpjKW-0-vbCdDc/export?format=csv&gid=1278275282',
  'https://docs.google.com/spreadsheets/d/1gHarObyJgt9j70D1GReEYzJt2akqqgsfNB9zESj03R8/export?format=csv&gid=1422661407',
];

export async function GET() {
  const sheets = await Promise.all(GOOGLE_SHEETS_EXPORTS.map(async (url) => {
    try {
      const response = await fetch(url, { next: { revalidate: 60 } });
      return response.ok ? response.text() : '';
    } catch {
      return '';
    }
  }));

  return Response.json({ sheets });
}
