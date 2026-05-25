export default function Noop() {
  return null;
}

export function loader() {
  return new Response(null, { status: 204 });
}
