export async function GET() {
  const content = `google.com, pub-8285912744304653, DIRECT, f08c47fec0942fa0
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
